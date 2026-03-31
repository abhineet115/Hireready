import json
import os
import re
from datetime import datetime, timezone
from typing import Optional

import firebase_admin
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials, firestore
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from config import CORS_ORIGINS, DEV_TEST_TOKEN, RATE_LIMIT
from key_rotator import KeyRotator, call_gemini
from pdf_parser import extract_text_from_pdf
from prompts import (
    ats_prompt,
    interview_prompt,
    negotiate_salary_prompt,
    prep_interview_prompt,
    roles_prompt,
    rewrite_resume_prompt,
)

# ── Init ────────────────────────────────────────────────────────
app = FastAPI(title="HireReady API", version="1.0.0")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Firebase Init ────────────────────────────────────────────────
_firebase_initialized = False
_db = None


def init_firebase():
    global _firebase_initialized, _db
    if _firebase_initialized:
        return
    sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    try:
        if sa_json:
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
        elif sa_path:
            cred = credentials.Certificate(sa_path)
        else:
            return
        firebase_admin.initialize_app(cred)
        _db = firestore.client()
        _firebase_initialized = True
    except Exception as e:
        print(f"Firebase init error: {e}")


init_firebase()

# ── Gemini Key Rotator ──────────────────────────────────────────
rotator = KeyRotator()

# ── Auth Helpers ─────────────────────────────────────────────────
GUEST_DAILY_LIMIT = 3
USER_DAILY_LIMIT = 10
PRO_DAILY_LIMIT = 9999


def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    if token == DEV_TEST_TOKEN:
        return {"uid": "dev-user", "email": "dev@hireready.ai", "is_pro": True, "type": "pro"}
    if not _firebase_initialized:
        return None
    try:
        decoded = firebase_auth.verify_id_token(token)
        uid = decoded["uid"]
        user_record = firebase_auth.get_user(uid)
        is_pro = (user_record.custom_claims or {}).get("pro", False)
        return {"uid": uid, "email": decoded.get("email", ""), "is_pro": is_pro, "type": "pro" if is_pro else "user"}
    except Exception:
        return None


def require_pro_user(user: Optional[dict] = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    if not user.get("is_pro"):
        raise HTTPException(status_code=403, detail="PRO subscription required")
    return user


def get_daily_limit(user: Optional[dict]) -> int:
    if not user:
        return GUEST_DAILY_LIMIT
    if user.get("is_pro"):
        return PRO_DAILY_LIMIT
    return USER_DAILY_LIMIT


def check_and_increment_usage(user: Optional[dict], request: Request) -> int:
    """Returns current usage count after incrementing. Raises 429 if limit exceeded."""
    limit = get_daily_limit(user)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    if user and _db:
        uid = user["uid"]
        doc_ref = _db.collection("users").document(uid).collection("usage").document(today)
        doc = doc_ref.get()
        count = doc.to_dict().get("scan_count", 0) if doc.exists else 0
        if count >= limit:
            raise HTTPException(status_code=429, detail=f"Daily limit of {limit} scans reached")
        doc_ref.set({"scan_count": count + 1, "date": today}, merge=True)
        return count + 1
    else:
        # For guests (no DB), we rely on client-side limiting
        return 1


def save_history(user: Optional[dict], tool: str, input_preview: str, result_preview: str):
    if not user or not _db or user["uid"] == "dev-user":
        return
    try:
        uid = user["uid"]
        _db.collection("users").document(uid).collection("history").add({
            "tool": tool,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "input_preview": input_preview[:200],
            "result_preview": result_preview[:200],
        })
    except Exception as e:
        print(f"History save error: {e}")


def parse_gemini_json(text: str) -> dict:
    """Strip markdown fences if present and parse JSON."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


# ── Request Models ───────────────────────────────────────────────
class AtsRequest(BaseModel):
    resume_text: str
    job_description: str


class InterviewRequest(BaseModel):
    job_title: str
    experience_level: str


class RolesRequest(BaseModel):
    current_title: str
    skills: list[str]


class RewriteRequest(BaseModel):
    resume_text: str
    job_description: str


class NegotiateRequest(BaseModel):
    job_title: str
    location: str
    target_salary: float
    skills: str


class PrepRequest(BaseModel):
    job_description: str
    resume_text: Optional[str] = None


# ── Routes ───────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "keys": rotator.key_count(),
        "firebase": _firebase_initialized,
    }


@app.post("/api/upload-resume")
@limiter.limit(RATE_LIMIT)
async def upload_resume(request: Request, file: UploadFile = File(...), user: Optional[dict] = Depends(get_current_user)):
    content = await file.read()
    try:
        text = extract_text_from_pdf(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"text": text}


@app.post("/api/analyze-ats")
@limiter.limit(RATE_LIMIT)
async def analyze_ats(request: Request, body: AtsRequest, user: Optional[dict] = Depends(get_current_user)):
    check_and_increment_usage(user, request)
    prompt = ats_prompt(body.resume_text, body.job_description)
    raw = call_gemini(prompt, rotator)
    result = parse_gemini_json(raw)
    save_history(user, "ATS Scorer", body.job_description[:100], f"Score: {result.get('score', '?')}")
    return result


@app.post("/api/predict-interview")
@limiter.limit(RATE_LIMIT)
async def predict_interview(request: Request, body: InterviewRequest, user: Optional[dict] = Depends(get_current_user)):
    check_and_increment_usage(user, request)
    prompt = interview_prompt(body.job_title, body.experience_level)
    raw = call_gemini(prompt, rotator)
    result = parse_gemini_json(raw)
    save_history(user, "Interview Predictor", body.job_title, f"{len(result.get('questions', []))} questions generated")
    return result


@app.post("/api/recommend-roles")
@limiter.limit(RATE_LIMIT)
async def recommend_roles(request: Request, body: RolesRequest, user: Optional[dict] = Depends(get_current_user)):
    check_and_increment_usage(user, request)
    prompt = roles_prompt(body.current_title, body.skills)
    raw = call_gemini(prompt, rotator)
    result = parse_gemini_json(raw)
    save_history(user, "Role Recommender", body.current_title, f"{len(result.get('roles', []))} roles recommended")
    return result


@app.post("/api/pro/rewrite-resume")
@limiter.limit(RATE_LIMIT)
async def rewrite_resume_endpoint(request: Request, body: RewriteRequest, user: dict = Depends(require_pro_user)):
    prompt = rewrite_resume_prompt(body.resume_text, body.job_description)
    raw = call_gemini(prompt, rotator)
    result = parse_gemini_json(raw)
    save_history(user, "Resume Rewriter", body.job_description[:100], result.get("summary", "")[:100])
    return result


@app.post("/api/pro/negotiate-salary")
@limiter.limit(RATE_LIMIT)
async def negotiate_salary_endpoint(request: Request, body: NegotiateRequest, user: dict = Depends(require_pro_user)):
    prompt = negotiate_salary_prompt(body.job_title, body.location, body.target_salary, body.skills)
    raw = call_gemini(prompt, rotator)
    result = parse_gemini_json(raw)
    save_history(user, "Salary Negotiator", f"{body.job_title} in {body.location}", result.get("market_insight", "")[:100])
    return result


@app.post("/api/pro/prep-interview")
@limiter.limit(RATE_LIMIT)
async def prep_interview_endpoint(request: Request, body: PrepRequest, user: dict = Depends(require_pro_user)):
    prompt = prep_interview_prompt(body.job_description, body.resume_text or "")
    raw = call_gemini(prompt, rotator)
    result = parse_gemini_json(raw)
    save_history(user, "Advanced Prep", body.job_description[:100], f"{len(result.get('practice_questions', []))} questions prepared")
    return result


@app.get("/api/user/usage")
async def get_user_usage(user: Optional[dict] = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    limit = get_daily_limit(user)
    used = 0
    if _db and user["uid"] != "dev-user":
        try:
            doc_ref = _db.collection("users").document(user["uid"]).collection("usage").document(today)
            doc = doc_ref.get()
            used = doc.to_dict().get("scan_count", 0) if doc.exists else 0
        except Exception:
            pass
    return {"used": used, "limit": limit, "remaining": max(0, limit - used), "user_type": user.get("type", "user")}


@app.get("/api/user/history")
async def get_user_history(user: Optional[dict] = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    history = []
    if _db and user["uid"] != "dev-user":
        try:
            docs = _db.collection("users").document(user["uid"]).collection("history").order_by(
                "timestamp", direction=firestore.Query.DESCENDING
            ).limit(20).stream()
            for doc in docs:
                history.append(doc.to_dict())
        except Exception as e:
            print(f"History fetch error: {e}")
    return {"history": history}
