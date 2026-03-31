"""Tests for the FastAPI endpoints using TestClient."""
import json
import os
import pytest
from unittest.mock import MagicMock, patch

# Patch Firebase and Stripe before importing the app
os.environ.setdefault("GEMINI_API_KEYS", "fake-key")
os.environ.setdefault("STRIPE_SECRET_KEY", "")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "")
os.environ.setdefault("STRIPE_PRICE_ID", "")
os.environ.setdefault("DEV_TEST_TOKEN", "test-dev-token")

with patch("firebase_admin.initialize_app"), patch("firebase_admin.credentials.Certificate"):
    from fastapi.testclient import TestClient
    from main import app

client = TestClient(app)
DEV_TOKEN = "test-dev-token"
AUTH_HEADERS = {"Authorization": f"Bearer {DEV_TOKEN}"}


# ── Health ───────────────────────────────────────────────────────
def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "keys" in data
    assert "firebase" in data
    assert "startup_time" in data
    assert "version" in data


# ── ATS Scorer ───────────────────────────────────────────────────
def test_analyze_ats_success():
    mock_result = {
        "score": 80,
        "matched_keywords": ["python", "django"],
        "missing_keywords": ["kubernetes"],
        "suggestions": ["Add more keywords"],
        "section_breakdown": {},
    }
    with patch("main.call_gemini", return_value=json.dumps(mock_result)):
        resp = client.post(
            "/api/analyze-ats",
            json={"resume_text": "Python developer", "job_description": "Python django role"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["score"] == 80


def test_analyze_ats_missing_fields():
    resp = client.post("/api/analyze-ats", json={"resume_text": "only resume"})
    assert resp.status_code == 422


# ── Interview Predictor ──────────────────────────────────────────
def test_predict_interview_success():
    mock_result = {"questions": [{"category": "Technical", "question": "Q?", "tip": "T"}]}
    with patch("main.call_gemini", return_value=json.dumps(mock_result)):
        resp = client.post(
            "/api/predict-interview",
            json={"job_title": "Engineer", "experience_level": "Senior"},
        )
    assert resp.status_code == 200
    assert "questions" in resp.json()


# ── Role Recommender ─────────────────────────────────────────────
def test_recommend_roles_success():
    mock_result = {"roles": [{"title": "ML Engineer", "matchPct": 85}]}
    with patch("main.call_gemini", return_value=json.dumps(mock_result)):
        resp = client.post(
            "/api/recommend-roles",
            json={"current_title": "Data Analyst", "skills": ["Python", "SQL"]},
        )
    assert resp.status_code == 200
    assert "roles" in resp.json()


# ── PRO Endpoints require auth ───────────────────────────────────
def test_pro_endpoint_requires_auth():
    resp = client.post(
        "/api/pro/rewrite-resume",
        json={"resume_text": "resume", "job_description": "jd"},
    )
    assert resp.status_code == 401


def test_pro_rewrite_resume_with_dev_token():
    mock_result = {"summary": "Good resume", "rewrites": []}
    with patch("main.call_gemini", return_value=json.dumps(mock_result)):
        resp = client.post(
            "/api/pro/rewrite-resume",
            json={"resume_text": "resume text", "job_description": "job desc"},
            headers=AUTH_HEADERS,
        )
    assert resp.status_code == 200
    assert "summary" in resp.json()


def test_pro_negotiate_salary_with_dev_token():
    mock_result = {"market_insight": "...", "scripts": [], "leverage_tips": []}
    with patch("main.call_gemini", return_value=json.dumps(mock_result)):
        resp = client.post(
            "/api/pro/negotiate-salary",
            json={"job_title": "Engineer", "location": "NYC", "target_salary": 120000, "skills": "Python"},
            headers=AUTH_HEADERS,
        )
    assert resp.status_code == 200


def test_pro_cover_letter_with_dev_token():
    mock_result = {
        "subject_line": "Application for Engineer",
        "cover_letter": "Dear Hiring Manager...",
        "key_selling_points": ["Python expertise"],
        "customization_tips": ["Add company name"],
    }
    with patch("main.call_gemini", return_value=json.dumps(mock_result)):
        resp = client.post(
            "/api/pro/cover-letter",
            json={"resume_text": "resume text", "job_description": "job desc", "tone": "professional"},
            headers=AUTH_HEADERS,
        )
    assert resp.status_code == 200
    data = resp.json()
    assert "cover_letter" in data
    assert "subject_line" in data


def test_pro_cover_letter_requires_auth():
    resp = client.post(
        "/api/pro/cover-letter",
        json={"resume_text": "resume", "job_description": "jd"},
    )
    assert resp.status_code == 401


# ── User usage/history require auth ─────────────────────────────
def test_user_usage_requires_auth():
    resp = client.get("/api/user/usage")
    assert resp.status_code == 401


def test_user_history_requires_auth():
    resp = client.get("/api/user/history")
    assert resp.status_code == 401


def test_user_usage_with_dev_token():
    resp = client.get("/api/user/usage", headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert "used" in data
    assert "limit" in data
    assert "remaining" in data


def test_user_history_with_dev_token():
    resp = client.get("/api/user/history", headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert "history" in data
    assert "total" in data
    assert "page" in data


# ── parse_gemini_json ────────────────────────────────────────────
def test_parse_gemini_json_plain():
    from main import parse_gemini_json
    result = parse_gemini_json('{"score": 90}')
    assert result["score"] == 90


def test_parse_gemini_json_with_fences():
    from main import parse_gemini_json
    raw = "```json\n{\"score\": 75}\n```"
    result = parse_gemini_json(raw)
    assert result["score"] == 75


def test_parse_gemini_json_invalid_raises():
    from main import parse_gemini_json
    with pytest.raises(Exception):
        parse_gemini_json("not json at all")
