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

## Architecture

```
HireReady/
├── hireready-frontend/   # React + Vite + TailwindCSS v4
└── hireready-backend/    # Python FastAPI
```

- **Frontend**: React 18, Vite, TailwindCSS v4, React Router v6, Firebase Auth
- **Backend**: FastAPI, Google Gemini AI, Firebase Admin SDK

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, TailwindCSS v4      |
| Routing    | React Router v6                     |
| Auth       | Firebase Authentication (Google)    |
| Database   | Firestore                           |
| Backend    | Python 3.11+, FastAPI               |
| AI         | Google Gemini API                   |
| Deployment | (TBD)                               |

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Firebase project with Authentication and Firestore enabled
- A Google Gemini API key

### Frontend

```bash
cd hireready-frontend
cp .env.example .env          # fill in your Firebase config
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

See [`hireready-frontend/.env.example`](hireready-frontend/.env.example) and [`hireready-backend/.env.example`](hireready-backend/.env.example) for required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Open a pull request
