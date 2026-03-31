# HireReady — Complete Project Summary

> **Tagline:** *"Beat the ATS. Land Your Dream Job."*
> **Author:** Abhineet Kumar Sinha
> **Status:** Working prototype (Stripe not integrated yet)

---

## 1. What Is HireReady?

HireReady is an **AI-powered career tools SaaS platform** that helps job seekers:

- Score their resume against a job description for ATS compatibility
- Generate AI-predicted interview questions
- Discover career path recommendations
- (PRO) Rewrite resume bullet points for ATS optimization
- (PRO) Generate personalized salary negotiation scripts
- (PRO) Get deep-dive interview prep plans

The app follows a **freemium model**: 3 tools are free (with daily limits), 3 tools require PRO ($9/month, simulated).

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI framework |
| **Vite** | 7.3 | Build tool & dev server |
| **TailwindCSS** | 4.2 (via `@tailwindcss/vite`) | Utility CSS (v4 — uses `@theme` directive) |
| **React Router DOM** | 7.13 | Client-side routing |
| **Lucide React** | 0.577 | Icon library |
| **Firebase** (client SDK) | 12.10 | Google Auth (sign in with popup) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python / FastAPI** | ≥0.100 | REST API server |
| **Uvicorn** | ≥0.20 | ASGI server |
| **Google Generative AI** | ≥0.3 | Gemini AI (model: `gemini-2.0-flash`) |
| **Firebase Admin** | ≥6.2 | Token verification & Firestore |
| **pdfplumber** | ≥0.10 | PDF text extraction |
| **SlowAPI** | ≥0.1.9 | Rate limiting |
| **python-dotenv** | ≥1.0 | Env variable loading |
| **Pydantic** | ≥2.0 | Request validation |
| **python-multipart** | ≥0.0.6 | File uploads |

### Infrastructure
| Service | Purpose |
|---|---|
| **Firebase Auth** | Google sign-in (popup-based) |
| **Firestore** | Usage tracking, scan history, PRO status |
| **Gemini AI** (free tier) | All AI analysis (ATS scoring, interview Qs, etc.) |
| **Stripe** | Payment (simulated — not yet integrated) |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────┐
│                 FRONTEND                     │
│         React + Vite + TailwindCSS v4        │
│                                              │
│  Landing ─ ATS Scorer ─ Interview Predictor  │
│  Role Recommender ─ Dashboard                │
│  Resume Rewriter ─ Salary Negotiator         │
│  Advanced Prep                               │
│                                              │
│  Auth: Firebase Google Sign-In (popup)       │
│  State: React Context (AuthContext)          │
│  API: services/api.js → FastAPI backend      │
│  Fallback: Local mock analysis if offline    │
└────────────────────┬────────────────────────┘
                     │ HTTP (Bearer token)
                     ▼
┌─────────────────────────────────────────────┐
│                 BACKEND                      │
│              FastAPI (Python)                │
│                                              │
│  /api/upload-resume     (PDF → text)         │
│  /api/analyze-ats       (Gemini AI)          │
│  /api/predict-interview (Gemini AI)          │
│  /api/recommend-roles   (Gemini AI)          │
│  /api/pro/rewrite-resume     (PRO)           │
│  /api/pro/negotiate-salary   (PRO)           │
│  /api/pro/prep-interview     (PRO)           │
│  /api/user/usage        (daily limits)       │
│  /api/user/history      (scan log)           │
│  /api/health            (status)             │
│                                              │
│  Auth: Firebase Admin (verify ID tokens)     │
│  AI: Gemini 2.0 Flash (key rotation)         │
│  Rate: SlowAPI (per-IP limiting)             │
│  DB: Firestore (usage + history + PRO flag)  │
└─────────────────────────────────────────────┘
```

---

## 4. File Structure

```
HireReady/
├── index.html                  # HTML entry point (SEO meta tags)
├── package.json                # Frontend dependencies
├── vite.config.js              # Vite + React + TailwindCSS v4 plugin
├── .env                        # Frontend env (Firebase config)
├── .env.example                # Template for frontend env
├── .gitignore
│
├── src/
│   ├── main.jsx                # React entry: StrictMode + AuthProvider + App
│   ├── App.jsx                 # Router with 8 routes + Navbar + Footer
│   ├── index.css               # Design system (TailwindCSS v4 @theme, utilities, animations)
│   │
│   ├── firebase/
│   │   └── config.js           # Firebase init (Auth + Firestore + Google Provider)
│   │
│   ├── context/
│   │   └── AuthContext.jsx     # Auth state: user, userType, isPro, devMode, loginWithGoogle, logout
│   │
│   ├── services/
│   │   └── api.js              # API client (10 functions + error handling + BACKEND_OFFLINE detection)
│   │
│   ├── components/
│   │   ├── Navbar.jsx          # Sticky nav, logo, links, PRO links, auth buttons, mobile menu
│   │   ├── Footer.jsx          # 4-column footer: brand, free tools, pro tools, socials
│   │   ├── PricingModal.jsx    # Modal overlay: PRO upgrade ($9/mo), feature checklist, simulated Stripe
│   │   ├── CircularProgress.jsx # Animated SVG donut chart for ATS score (color-coded)
│   │   └── CooldownButton.jsx  # Button with loading spinner + post-click cooldown timer
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx     # Hero + How It Works + Free Tools grid + PRO teaser + Trust section
│   │   ├── ATSScorer.jsx       # PDF upload OR paste resume + JD → AI score + keywords + suggestions
│   │   ├── InterviewPredictor.jsx # Job title + level → 5 categorized questions with tips
│   │   ├── RoleRecommender.jsx # Current title + skills tags → 3 role cards with salary/demand/match%
│   │   ├── Dashboard.jsx       # User profile, usage stats, scan history list
│   │   ├── ResumeRewriter.jsx  # PRO: resume + JD → rewritten bullet points (original vs AI)
│   │   ├── SalaryNegotiator.jsx # PRO: title + location + target + skills → scripts + tips
│   │   └── AdvancedPrep.jsx    # PRO: JD + optional resume → topics + questions + red flags + projects
│   │
│   └── assets/
│       └── react.svg           # Default Vite asset
│
├── hireready-backend/
│   ├── main.py                 # FastAPI app: 10 endpoints, auth, usage tracking, CORS
│   ├── prompts.py              # 6 Gemini AI prompt templates (structured JSON output)
│   ├── key_rotator.py          # Multi-key rotation with auto-retry on rate limit
│   ├── pdf_parser.py           # pdfplumber extraction with validation (size, pages, empty pages)
│   ├── config.py               # API_BASE_URL constant
│   ├── requirements.txt        # Python deps
│   ├── .env                    # Backend env (Gemini keys, Firebase SA, CORS, rate limit)
│   ├── .env.example            # Template for backend env
│   └── test_gemini.py          # Simple Gemini API test script
```

---

## 5. All Features — Detailed Breakdown

---

### 5.1 Landing Page (`/`)

**Sections:**
1. **Hero** — Gradient headline "Beat the ATS. Land Your Dream Job.", stat about 75% rejection rate, CTA to ATS Scorer, "See All Tools" anchor
2. **How It Works** — 3-step visual: Paste/Upload → AI Analysis → Get Score
3. **Free Tools Grid** — 3 cards (ATS Scorer, Interview Predictor, Role Recommender) with icons, descriptions, "Try Now" links
4. **PRO Teaser** — Gradient-bordered section showcasing 3 PRO tools with "Get PRO Access — $9/mo" button → opens PricingModal
5. **Trust Section** — Shield icon + "Your Data is Safe" message

---

### 5.2 ATS Resume Scorer (`/ats-scorer`) — FREE

**Input:**
- PDF upload button (max 5MB, validates `.pdf` extension)
- OR paste resume text manually
- Paste job description text
- Word count shown for both fields
- Uploaded file indicator with clear button

**Processing:**
- Tries backend API first (`POST /api/analyze-ats`)
- Falls back to **local mock analysis** (keyword matching) if backend is offline
- Shows "Using local keyword analysis" warning banner when using mock

**Output:**
- **Circular animated score** (0–100 with color: red < 40, yellow < 60, cyan < 80, green ≥ 80)
- **Matched Keywords** — green tags
- **Missing Keywords** — red tags
- **Section-by-Section Breakdown** (AI only, not mock): contact, experience, skills, education, formatting — each with score bar + feedback
- **5 Suggestions** — numbered actionable tips

**Mock fallback logic:** Extracts words from JD > 4 chars (excluding stop words), matches against resume words, calculates percentage.

---

### 5.3 Interview Predictor (`/interview-predictor`) — FREE

**Input:**
- Job Title (text input)
- Experience Level (dropdown: Entry 0-2, Mid 3-5, Senior 6-10, Lead/Manager 10+)

**Output:**
- 5 questions, each with:
  - Category badge (Behavioral = cyan, Technical = purple, Situational = green)
  - Question number
  - Full question text
  - 💡 Tip for answering (e.g., "Use the STAR method")

**Mock fallback:** Pre-built question bank with category templates.

---

### 5.4 Role Recommender (`/role-recommender`) — FREE

**Input:**
- Current Job Title (text)
- Skills — tag input (type + Enter/click +, max 10, removable tags, min 2 required)

**Output:**
- 3 role recommendation cards, each with:
  - Rank number (#1, #2, #3) with gradient text
  - Role title + description
  - Conic-gradient match percentage circle
  - Details grid: Salary Range | Market Demand (color-coded) | Skills to Build
  - "Why this fits" explanation

---

### 5.5 Dashboard (`/dashboard`) — Requires Sign-In

**Sections:**
1. **Profile header** — Avatar (Google photo or placeholder), display name, email
2. **Stats Grid** — 3 cards:
   - Daily Scans Used (X / limit)
   - Account Type (PRO / Signed In Free / Guest)
   - Member Since date
3. **Recent Activity** — List of last 20 scans with:
   - Tool icon + name
   - Timestamp
   - Result preview (score % for ATS, question count for Interview, role count for Roles)

---

### 5.6 Resume Rewriter (`/resume-rewriter`) — PRO

**Input:**
- PDF upload or paste resume text
- Paste target job description
- Sign-in required (shows PricingModal if not signed in)

**Output:**
- **Overall summary** of changes made
- **Rewritten bullet points** list, each showing:
  - Original text (red label)
  - Arrow divider
  - AI Rewrite text (green label, bolder)
  - Reason for change (purple box)

---

### 5.7 Salary Negotiator (`/salary-negotiator`) — PRO

**Input:**
- Job Title
- Location / Market
- Target Salary
- Key Skills & Accomplishments (textarea)

**Output:**
- **Market Insight** — Market data context paragraph
- **Negotiation Scripts** — 3 scenarios (Initial offer, Email follow-up, Final ask), each with a blockquote script
- **Leverage Tips** — Numbered actionable tips

---

### 5.8 Advanced Interview Prep (`/advanced-prep`) — PRO

**Input:**
- Job Description (required)
- Resume (optional, for personalization) — PDF upload or paste

**Output:**
- **Priority Topics to Study** — Grid of topic cards with importance badge (High=red, Medium=yellow, Low=green) + reason
- **Deep-Dive Practice Questions** — Numbered questions with:
  - Expected concepts (purple tag chips)
  - Model answer (cyan-bordered blockquote)
- **Red Flags to Avoid** — Warning list
- **Projects to Mention** — Suggestion list

---

## 6. Shared Components

### Navbar
- Sticky, glassmorphism backdrop blur
- Logo: Zap icon + "HireReady" gradient text
- Desktop: Home, ATS Scorer, Interview Prep, Role Finder + (Dashboard if signed in) | PRO links with "PRO" badge
- Dev Mode toggle button (Crown icon: "FREE" / "DEV PRO")
- Auth: Sign In button or User avatar + name + Logout
- Mobile: Hamburger menu with full link list
- Responsive breakpoint at 768px

### Footer
- 4-column grid: Brand, Free Tools links, PRO Tools (text only), Social icons (GitHub, Twitter, LinkedIn)
- "Built with ❤ by Abhineet Kumar Sinha"

### PricingModal
- Full-screen overlay with backdrop blur
- Crown icon, "Upgrade to HireReady PRO" heading
- Price: **$9/month**
- Feature checklist: 100+ scans/day, Resume Rewriter, Salary Scripts, Advanced Prep, Ad-Free, Priority Support
- CTA button → `alert()` simulated Stripe checkout
- "Secure Payment via Stripe (Simulated)" disclaimer

### CircularProgress
- Animated SVG donut chart
- Props: `score`, `size` (180), `strokeWidth` (12), `animated`
- Animates from 0 to score with ease-out cubic easing over 1.5s
- Color thresholds: red < 40, yellow < 60, cyan < 80, green ≥ 80
- Labels: "Poor", "Needs Work", "Good", "Excellent"

### CooldownButton
- Wraps the neon-btn style
- Shows spinner + "Analyzing..." during loading
- After click completes: enters cooldown ("Wait Xs")
- Configurable `cooldownMs` (default 5000ms)
- Prevents double-clicks

---

## 7. API Endpoints

| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `GET` | `/api/health` | No | No | Server status + key count + Firebase status |
| `POST` | `/api/upload-resume` | Optional | Yes | Upload PDF → extract text (pdfplumber) |
| `POST` | `/api/analyze-ats` | Optional | Yes | Resume + JD → ATS score + keywords + suggestions + section breakdown |
| `POST` | `/api/predict-interview` | Optional | Yes | Job title + level → 5 interview questions |
| `POST` | `/api/recommend-roles` | Optional | Yes | Current title + skills → 3 role recommendations |
| `POST` | `/api/pro/rewrite-resume` | **Required** | Yes | Resume + JD → rewritten bullet points |
| `POST` | `/api/pro/negotiate-salary` | **Required** | Yes | Title + location + target + skills → scripts + tips |
| `POST` | `/api/pro/prep-interview` | **Required** | Yes | JD + optional resume → prep plan + questions |
| `GET` | `/api/user/usage` | Required | No | Today's scan count, limit, remaining, user_type |
| `GET` | `/api/user/history` | Required | No | Last 20 scans with tool, timestamp, input, result |

### Usage Limits
| User Type | Daily Scans |
|---|---|
| Guest (no sign-in) | 3 |
| Signed-in (free) | 10 |
| PRO | Unlimited (9999) |

---

## 8. Authentication System

### Flow:
1. **Google Sign-In** via `signInWithPopup` (Firebase Auth client SDK)
2. On auth state change, frontend gets Firebase ID token
3. Token sent as `Authorization: Bearer <token>` header to backend
4. Backend verifies token with `firebase_admin.auth.verify_id_token()`

### Dev Mode:
- Frontend has a **Dev PRO Mode** toggle in the Navbar
- Sets a fake user with `getIdToken()` returning `"hireready-dev-pro-test-2024"`
- Backend accepts this token via `DEV_TEST_TOKEN` env var bypass
- Useful for testing PRO features without real Firebase auth

### User Types:
| Type | How Determined |
|---|---|
| `guest` | No auth token sent |
| `user` | Valid Firebase token, `is_pro = false` in Firestore |
| `pro` | Valid Firebase token, `is_pro = true` in Firestore |

---

## 9. How To Run

### Frontend
```bash
cd HireReady
npm install
npm run dev            # → http://localhost:5173
```

### Backend
```bash
cd HireReady/hireready-backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Create .env with your Gemini keys + Firebase service account
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 10. Rebuild Plan (If Starting From Scratch)

### Phase 1: Project Setup
- [ ] Create Vite + React project
- [ ] Install dependencies: `react-router-dom`, `lucide-react`, `firebase`, `@tailwindcss/vite`, `tailwindcss`
- [ ] Configure `vite.config.js` with React + TailwindCSS v4 plugins
- [ ] Set up `index.css` with the full design system (@theme tokens, utility classes, animations)
- [ ] Set up Firebase project (Auth + Firestore) and add config to `.env`

### Phase 2: Core Infrastructure
- [ ] Create `firebase/config.js` — init Firebase, export auth, db, googleProvider
- [ ] Create `context/AuthContext.jsx` — user state, Google sign-in, logout, dev mode, usage stats
- [ ] Create `services/api.js` — generic apiCall wrapper + all 10 endpoint functions + BACKEND_OFFLINE detection
- [ ] Create `App.jsx` with Router and all 8 routes
- [ ] Create `main.jsx` wrapping App with AuthProvider

### Phase 3: Shared Components
- [ ] `Navbar.jsx` — sticky, responsive, auth-aware, Pro links, dev mode toggle
- [ ] `Footer.jsx` — 4-column layout
- [ ] `PricingModal.jsx` — overlay modal with feature list
- [ ] `CircularProgress.jsx` — animated SVG donut
- [ ] `CooldownButton.jsx` — loading + cooldown state

### Phase 4: Free Tool Pages
- [ ] `LandingPage.jsx` — Hero, How It Works, Free Tools grid, PRO teaser, Trust
- [ ] `ATSScorer.jsx` — PDF upload, text paste, mock fallback, results (score + keywords + sections + suggestions)
- [ ] `InterviewPredictor.jsx` — Job title + level inputs, categorized questions
- [ ] `RoleRecommender.jsx` — Skill tag input, role cards with match circles
- [ ] `Dashboard.jsx` — Profile header, stats grid, scan history

### Phase 5: PRO Tool Pages
- [ ] `ResumeRewriter.jsx` — resume + JD, original vs rewrite comparison
- [ ] `SalaryNegotiator.jsx` — form inputs, market insight + scripts + tips
- [ ] `AdvancedPrep.jsx` — JD + optional resume, topics + questions + red flags + projects

### Phase 6: Backend
- [ ] FastAPI app with CORS, rate limiting (slowapi), Firebase Admin
- [ ] `pdf_parser.py` — pdfplumber extraction
- [ ] `key_rotator.py` — multi-key Gemini rotation
- [ ] `prompts.py` — 6 structured JSON prompts
- [ ] `main.py` — all 10 endpoints + auth dependency + usage tracking + scan history
- [ ] Pydantic request models with validation

### Phase 7: Polish & Deploy
- [ ] Test all free tools with mock fallback
- [ ] Test PRO tools with dev mode
- [ ] Add real Stripe integration (replace simulated checkout)
- [ ] Deploy frontend (Vercel / Netlify)
- [ ] Deploy backend (Railway / Render / GCP)
- [ ] Set up production Firebase + Firestore rules

---

## 11. Key Design Decisions to Preserve

1. **Dark theme with neon accents** — The dark-900 background with cyan/purple neons is the core visual identity
2. **Glassmorphism cards** — `backdrop-filter: blur(20px)` + semi-transparent backgrounds
3. **Mock fallback** — Free tools ALWAYS work, even without backend (local keyword matching)
4. **Dev mode bypass** — The test token system allows testing PRO features without real auth
5. **Key rotation** — Multiple free-tier Gemini keys rotated automatically on rate limit
6. **Progressive disclosure** — Free tools work without sign-in, Dashboard appears only when signed in, PRO tools show upgrade prompt
7. **Cooldown buttons** — Prevent API spam on the frontend side
8. **Inter font** — Consistent modern typography throughout
9. **Staggered animations** — Cards slide up with increasing delay (i * 0.15s) for a cascading effect
10. **Inline styles + utility classes** — Most styling is inline JSX with shared utility classes from index.css
