# HireReady

> AI-powered career preparation platform — optimize your resume, predict interview questions, and negotiate your salary with confidence.

## Overview

HireReady is a full-stack web application that provides AI-driven career tools:

- **ATS Scorer** – Upload your resume and a job description to get an ATS compatibility score with actionable feedback.
- **Interview Predictor** – Get AI-predicted interview questions tailored to your target role and company.
- **Role Recommender** – Discover the best-fit job roles based on your skills and experience.
- **Resume Rewriter** *(Pro)* – Rewrite your resume bullets using AI to maximise impact.
- **Salary Negotiator** *(Pro)* – Build a data-backed negotiation strategy using real market data.
- **Advanced Interview Prep** *(Pro)* – Deep-dive preparation covering key topics, red flags, and project suggestions.
- **Cover Letter Generator** *(Pro)* – Generate a tailored, compelling cover letter in seconds.

## Architecture

```
HireReady/
├── hireready-frontend/   # React + Vite + TailwindCSS v4
└── hireready-backend/    # Python FastAPI
```

## Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 19, Vite 8, TailwindCSS v4                 |
| Routing    | React Router v7                                   |
| Auth       | Firebase Authentication (Google Sign-In)          |
| Database   | Firestore (usage tracking + scan history)         |
| Backend    | Python 3.11+, FastAPI                             |
| AI         | Google Gemini 2.0 Flash                           |
| Payments   | Stripe (Checkout + webhooks + Billing Portal)     |
| Deployment | Frontend → Vercel · Backend → Render              |

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Firebase project with Authentication and Firestore enabled
- A Google Gemini API key

### Frontend

```bash
cd hireready-frontend
cp .env.example .env          # fill in your Firebase config + VITE_API_BASE
npm install
npm run dev                   # starts at http://localhost:5173
```

### Backend

```bash
cd hireready-backend
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in your API keys
uvicorn main:app --reload     # starts at http://localhost:8000
```

## Environment Variables

### Frontend (`hireready-frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_API_BASE` | Backend API URL (e.g. `https://your-api.onrender.com`) |

### Backend (`hireready-backend/.env`)

| Variable | Description |
|---|---|
| `GEMINI_API_KEYS` | Comma-separated Gemini API keys for rotation |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK service account JSON (stringified) |
| `CORS_ORIGINS` | Comma-separated allowed origins (e.g. your Vercel URL) |
| `FRONTEND_URL` | Frontend URL for Stripe redirect (e.g. `https://your-app.vercel.app`) |
| `DEV_TEST_TOKEN` | Token for dev PRO bypass (default: `hireready-dev-pro-test-2024`) |
| `RATE_LIMIT` | API rate limit (default: `30/minute`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRICE_ID` | Stripe Price ID for the PRO subscription (`price_...`) |

## Deployment

### Frontend → Vercel

1. Import the repo in [Vercel](https://vercel.com/new) and set the **Root Directory** to `hireready-frontend`.
2. Add all `VITE_*` environment variables in the Vercel project settings.
3. Set `VITE_API_BASE` to your Render backend URL.
4. Vercel automatically uses `vercel.json` (already configured for SPA routing and security headers).
5. Deploy — Vercel rebuilds on every push to `main`.

### Backend → Render

1. Create a **Web Service** in [Render](https://render.com) from this repo.
2. Set the **Root Directory** to `hireready-backend`.
3. Render uses `render.yaml` for the build/start commands automatically.
4. Add all environment variables listed above in the Render dashboard (all marked `sync: false` must be added manually).
5. Set up a Stripe webhook pointing to `https://your-api.onrender.com/api/stripe-webhook` with the event types:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

### Firebase / Firestore

1. Enable **Google Sign-In** in Firebase Authentication.
2. Deploy Firestore security rules from `hireready-backend/firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Download the Admin SDK service account JSON from Firebase → Project Settings → Service Accounts, stringify it, and paste it into the `FIREBASE_SERVICE_ACCOUNT_JSON` env var on Render.

## Running Tests

```bash
# Frontend
cd hireready-frontend && npm test

# Backend
cd hireready-backend && pytest tests/ -v
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Open a pull request
