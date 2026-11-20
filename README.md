# JobNex AI

An AI-powered career and hiring platform that combines resume analysis, ATS scoring, job matching, interview practice, and a role-aware career assistant in a single full-stack application.

JobNex AI serves three audiences:

- **Job seekers** — upload a resume, get an ATS score and structured feedback, build a CV, discover matched jobs, generate cover letters, and practice interviews.
- **Recruiters** — post and manage jobs, review applications and cover letters, and update candidate status.
- **Admins** — manage users, jobs, applications, and blog content from a central dashboard.

Repository: <https://github.com/IM-Vikinesh/project_cv_analyzer.git>

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Running locally](#running-locally)
- [How it works](#how-it-works)
- [API reference](#api-reference)
- [Authentication and roles](#authentication-and-roles)
- [Usage limits](#usage-limits)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security notes and limitations](#security-notes-and-limitations)
- [License](#license)

---

## Features

### Job seekers

| Feature | Description |
| --- | --- |
| Resume AI analysis | Upload a PDF resume; text is extracted, parsed into experience/education/skills, and an ATS score with suggestions is produced. |
| ATS scoring | Weighted 100-point score covering resume length, skills, experience, education, contact details, and achievements. A separate profile ATS score is computed in the frontend (skills 30%, experience 30%, education 20%, format 20%). |
| CV builder | Edit personal details, about me, education, and experience with a live A4 resume preview; export to PDF with jsPDF + html2canvas. |
| Job search | Browse active jobs with search, job type, experience level, and location filters, plus pagination. |
| Save jobs | Save/unsave jobs and view saved jobs from the dashboard. |
| Apply with cover letter | Apply to jobs, generate a tailored AI cover letter, and submit an application with an ATS score. |
| Recommendations | Skill-based job matching and skill-gap aggregation, from saved analysis or profile skills. |
| AI interview | Mock interview with generated questions, human-like follow-ups, and a final scored evaluation. |
| Applications tracking | Track submitted applications and their status. |
| Profile management | Edit personal, professional, social, and recruiter company fields; upload a profile image; change password. |
| Career assistant | Floating chatbot with session history, role-aware suggestions, CV review, career roadmap, interview coaching, and LLM-based job recommendations. |

### Recruiters

- Dashboard with recruiting metrics and a quick job-posting modal.
- Create, edit, and delete job postings.
- View applications per job or across all jobs, with applicant details and cover letters.
- Update application status (pending, reviewing, shortlisted, rejected, etc.).
- Company name changes propagate to all jobs posted by that recruiter.

### Admins

- Platform dashboard: users, recruiters, companies, jobs, and applications.
- User management (view, update, delete; admin accounts are protected from deletion).
- Job, application, and blog CRUD.
- Generic file upload to Firebase Storage.

### Public

- Landing page with product features and live stats.
- Public job board and job details.
- Blog listing and article pages (HTML or Markdown rendering, excerpts, reading time).
- Registration with role selection and Firebase-powered password reset.

---

## Tech stack

**Frontend** (`JobNexAI/frontend`)

- React 18 + React Router 6 (Create React App / react-scripts 5)
- Tailwind CSS 3, PostCSS, Autoprefixer, Headless UI, Heroicons
- Axios (API client with caching, request deduplication, and abort support)
- Firebase JS SDK 10 (password reset)
- React Dropzone, React Markdown, React PDF
- jsPDF, html2canvas, jspdf-autotable (PDF export)
- React Hot Toast, date-fns
- Lazy-loaded routes, skeleton loaders, IntersectionObserver-based lazy sections

**Backend** (`JobNexAI/backend`)

- Python 3.11, Flask 3, Flask-CORS, Gunicorn
- Firebase Admin SDK: Firestore + Cloud Storage
- Google Gemini (`google-generativeai`) as the primary LLM
- OpenAI-compatible fallback: OpenRouter (`gpt-4o-mini`) or OpenAI (`gpt-4o-mini`)
- PDF text extraction: pdfminer.six, pdfplumber, pypdf, PyMuPDF, with optional Tesseract OCR and AI vision OCR fallback
- NLTK for text statistics
- python-dotenv for environment configuration

**Infrastructure**

- Vercel — React frontend and serverless Flask API (via root `vercel.json` / `api/index.py`)
- Render — standalone backend service (via `render.yaml`, `Procfile`, `runtime.txt`)
- Firebase — Firestore, Storage, and Authentication (password reset)

---

## Repository layout

```text
.
├── api/                          # Root Vercel serverless entry point
│   ├── index.py                  # Imports JobNexAI/backend/app.py as `handler`
│   └── requirements.txt
├── JobNexAI/
│   ├── frontend/                 # React SPA (CRA)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── App.js            # Routes and route guards
│   │   │   ├── pages/            # Home, Jobs, CV tools, dashboards, ...
│   │   │   ├── components/       # Navbar, resume template, chatbot, skeletons
│   │   │   ├── context/          # AuthContext
│   │   │   ├── services/         # API client
│   │   │   ├── hooks/            # useAsyncData, useFileUpload
│   │   │   └── utils/            # ATS score, job formatting, navigation
│   │   └── package.json
│   ├── backend/                  # Flask application
│   │   ├── app.py                # App factory, CORS, blueprints, /api/health, /api/stats
│   │   ├── routes/               # auth, jobs, applications, ai, upload, admin, blog, chatbot
│   │   ├── utils/                # Firebase config/DB/storage/auth, AI helpers, resume processor
│   │   ├── requirements.txt
│   │   ├── Procfile
│   │   └── runtime.txt
│   ├── api/handler.py            # Alternate Vercel backend handler
│   ├── backend-deploy/           # Alternate Vercel-packaged backend
│   ├── setup.bat                 # Windows one-shot setup script
│   ├── vercel.json
│   └── requirements.txt
├── render.yaml                   # Render backend service definition
├── vercel.json                   # Root Vercel build/rewrite configuration
└── requirements.txt              # Root Python dependency list
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11 (3.10+ also works for the alternate backend package)
- **Firebase project** with:
  - Cloud Firestore
  - Cloud Storage
  - Authentication (Email/Password provider)
  - A service account with Admin SDK access
- **At least one AI API key**: Google Gemini (`GOOGLE_API_KEY`) is primary; OpenRouter (`OPENROUTER_API_KEY`) or OpenAI (`OPENAI_API_KEY`) is used as a fallback
- **Tesseract OCR** (optional, system-level) for scanned PDFs when the built-in extractors fail
- **Git**

---

## Quick start

### Windows (automated)

From the repository root:

```powershell
.\JobNexAI\setup.bat
```

The script installs backend Python dependencies and frontend npm dependencies, then copies `backend\.env.example` and `frontend\.env.example` to `.env` files. Edit both `.env` files with your credentials before starting the servers.

### Manual setup

```bash
# 1. Backend
cd JobNexAI/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Frontend
cd ../frontend
npm install
```

Then create the two `.env` files as described in [Configuration](#configuration).

---

## Configuration

### Backend: `JobNexAI/backend/.env`

Copy `JobNexAI/backend/.env.example` and fill in:

| Variable | Description |
| --- | --- |
| `FLASK_APP` | Set to `app.py`. |
| `FLASK_DEBUG` | `True` or `False`. Defaults to `True` when running `python app.py`. |
| `PORT` | Backend port, default `5000`. |
| `CORS_ORIGINS` | Comma-separated allowed origins. Defaults to `http://localhost:3000,http://127.0.0.1:3000,https://job-nex-ai.vercel.app`. |
| `FIREBASE_PROJECT_ID` | Firebase project ID. |
| `FIREBASE_PRIVATE_KEY_ID` | Service account private key ID. |
| `FIREBASE_PRIVATE_KEY` | Service account private key. Use `\n` for newlines. |
| `FIREBASE_CLIENT_EMAIL` | Service account client email. |
| `FIREBASE_CLIENT_ID` | Service account client ID. |
| `OPENAI_API_KEY` | OpenAI API key (fallback LLM and AI vision OCR). |
| `OPENROUTER_API_KEY` | OpenRouter key (`sk-or-v1-...`); preferred over OpenAI when present. |
| `GOOGLE_API_KEY` | Google Gemini API key (primary LLM). |

Firebase Admin credentials can also be supplied by placing `serviceAccountKey.json` in `JobNexAI/backend/`. When present, it takes precedence over the individual environment variables. **Never commit this file.**

### Frontend: `JobNexAI/frontend/.env`

Copy `JobNexAI/frontend/.env.example` and fill in:

| Variable | Description |
| --- | --- |
| `REACT_APP_FIREBASE_API_KEY` | Firebase web API key. |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `<project>.firebaseapp.com`. |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID. |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Usually `<project>.firebasestorage.app`. |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID. |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID. |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Measurement ID (documented; analytics is not initialized). |
| `REACT_APP_API_URL` | Backend API base URL. Optional locally: defaults to `/api`, which CRA proxies to `http://localhost:5000`. Set to `https://<your-app>.onrender.com/api` for a Render backend. |

### Firebase setup

1. Create a Firebase project and enable **Firestore Database** and **Storage**.
2. Enable **Email/Password** in Authentication.
3. Generate a service account JSON (Project Settings → Service Accounts) and either save it as `JobNexAI/backend/serviceAccountKey.json` or copy its fields into the backend `.env`.
4. Register a web app in Firebase and copy its config into the frontend `.env`.
5. Add the deployed frontend domain to the Firebase **Authorized domains** list.

The backend uses these Firestore collections: `users`, `jobs`, `applications`, `ai_analysis`, `blogs`, `chat_sessions`, `chat_messages`, `daily_usage`, and the `users/<user_id>/saved_jobs` subcollection. Uploads are stored under `uploads/resumes/`, `uploads/profiles/`, and `uploads/applications/` in Firebase Storage and made publicly readable via returned download URLs.

### AI provider setup

- **Primary:** set `GOOGLE_API_KEY`. The app tries `gemini-2.0-flash`, then `gemini-2.5-flash`, then `gemini-2.0-flash-lite`, moving to the next model on quota exhaustion.
- **Fallback:** if Gemini is missing or fails, the app uses OpenRouter when `OPENROUTER_API_KEY` starts with `sk-or-v1-` (model `gpt-4o-mini`), otherwise OpenAI with `OPENAI_API_KEY` (model `gpt-4o-mini`).
- Cover-letter generation also has a deterministic template fallback if all LLM calls fail; AI interviews have safe default evaluation values.
- Job recommendations under `/api/ai` are algorithmic and do not need an LLM. Chatbot job recommendations do use the LLM.

---

## Running locally

Start the backend from `JobNexAI/backend`:

```bash
python app.py
```

It listens on `http://localhost:5000` by default. Verify with:

```bash
curl http://localhost:5000/api/health
```

Start the frontend from `JobNexAI/frontend` in another terminal:

```bash
npm start
```

Open <http://localhost:3000>. The CRA dev server proxies `/api` requests to port `5000`, so `REACT_APP_API_URL` can be omitted locally.

| URL | Purpose |
| --- | --- |
| <http://localhost:3000> | Frontend |
| <http://localhost:5000/api/health> | Backend health check |
| <http://localhost:5000/api/stats> | Live platform statistics |

Admin accounts are not available through public registration; set a user document's `role` to `admin` directly in Firestore if needed.

---

## How it works

### Resume analysis pipeline

1. `POST /api/ai/analyze-cv` receives a multipart upload (PDF only, up to 10 MB client-side).
2. Text is extracted using the first successful method in this chain: `pdfminer.six` → `pdfplumber` → `pypdf` → PyMuPDF page text → PyMuPDF text blocks → local Tesseract OCR (300 dpi) → AI vision OCR with `gpt-4o-mini` on the first three pages.
3. The first 4,000 characters are sent to the LLM for structured JSON extraction of experience, education, organizations, skills, achievements, and a professional summary.
4. Regex-based contact extraction, keyword skill detection, and regex fallbacks for experience and education supplement the AI output; NLTK provides word/sentence counts.
5. `calculate_general_ats_score` produces a 100-point score, per-category breakdown, and suggestions.
6. The analysis is stored in `ai_analysis`, and its ID is returned so the frontend can display results at `/cv-analysis?id=<id>`.

The ATS score components are: resume length (20), skills (25), experience (20), education (15), contact information (10), and achievements (10). The frontend also computes a separate profile completeness score.

### Job recommendations

Skill-based recommendations match a user's skills (from a saved analysis via `/api/ai/recommend-from-skills` or from the profile via `/api/ai/recommendations`) against up to 50 active jobs using case-insensitive substring matching. Results include matched skills, missing-skill gaps, and a match score. The frontend falls back to a generic job list with a generated match score if no recommendations are available.

### Chatbot

The floating assistant is available to signed-in users. It persists sessions and messages in Firestore, keeps the last 20 messages as context, prepends a career-assistant system prompt plus user context (name, skills, experience, education, goals, and the first 2,000 characters of a CV), and offers role-specific prompts for job seekers, recruiters, and admins.

### Caching and UX

The API client caches GET responses in memory (60 seconds by default; 45 seconds for jobs, 2 minutes for blogs), deduplicates in-flight requests, and supports request cancellation. Pages are lazy-loaded behind skeleton loaders, and below-the-fold sections render lazily via IntersectionObserver.

---

## API reference

All routes are mounted under `/api`. JSON is the default request/response format; upload endpoints use `multipart/form-data`. User identity is passed with the `X-User-Id` header.

### App-level

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Service health information. |
| GET | `/api/stats` | Users, analyses, active jobs, and distinct companies. |

### Authentication — `/api/auth`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/register` | Create an account (job seeker or recruiter). |
| POST | `/login` | Email/password login; returns the user profile. |
| GET | `/profile/<user_id>` | Get a profile. |
| PUT | `/profile/<user_id>` | Update a profile. |
| POST | `/change-password/<user_id>` | Change password. |
| DELETE | `/profile/<user_id>` | Delete an account. |

### Jobs — `/api/jobs`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Search/filter/paginate active jobs. |
| GET | `/<job_id>` | Job details, with saved flag for the current user. |
| POST | `/` | Create a job. |
| PUT | `/<job_id>` | Update a job. |
| DELETE | `/<job_id>` | Delete a job. |
| GET | `/recruiter/jobs` | Jobs belonging to the current recruiter. |
| GET | `/saved` | Saved jobs for the current user. |
| POST | `/<job_id>/save` | Toggle saved state. |

### Applications — `/api/applications`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/` | Submit an application. |
| GET | `/my` | Current user's applications. |
| GET | `/user/<applicant_id>` | Applications for an applicant. |
| GET | `/job/<job_id>` | Applicants for a job (recruiter only). |
| GET | `/recruiter/all` | All applications for a recruiter's jobs. |
| PUT | `/<app_id>` | Update an application. |
| PUT | `/<app_id>/status` | Update application status. |
| DELETE | `/<app_id>` | Delete an application. |

### AI — `/api/ai`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/analyze-cv` | Upload a PDF resume; returns a structured analysis and ATS score. |
| POST | `/analyze` | Store a precomputed analysis record. |
| GET | `/user/<user_id>` | All analyses for a user. |
| GET | `/<analysis_id>` | A single analysis. |
| POST | `/save-to-profile` | Copy analysis results into the user profile. |
| POST | `/recommend-from-skills` | Recommendations from supplied skills. |
| GET | `/recommendations` | Recommendations from profile skills. |
| POST | `/generate-cover-letter` | Generate a tailored cover letter. |
| POST | `/interview` | Mock interview: `start`, `answer`, or `evaluate`. |

### Uploads — `/api/upload`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/resume` | Upload a resume to Firebase Storage. |
| POST | `/profile` | Upload a profile image. |
| POST | `/application-resume` | Upload a resume for a job application. |

Accepted upload extensions: `pdf`, `png`, `jpg`, `jpeg`, `doc`, `docx`, `gif`, `webp`. The AI analysis endpoint accepts PDF only. Maximum request size is 16 MB; per-file limit is 10 MB.

### Blogs — `/api/blogs`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Published blogs (`?limit=6`). |
| GET | `/<blog_id>` | A published blog article. |

### Chatbot — `/api/chatbot`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/chat` | Send a chat message with session continuity. |
| GET | `/history` | Message history for a session. |
| GET | `/sessions` | Recent chat sessions. |
| POST | `/cv-analysis` | AI CV review with ATS score and rewrite suggestions. |
| POST | `/career-roadmap` | Short/mid/long-term career roadmap. |
| POST | `/interview-coach` | Generate interview questions or evaluate answers. |
| POST | `/job-recommendations` | LLM-based job matching. |

### Admin — `/api/admin`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/dashboard` | Platform statistics. |
| GET/PUT/DELETE | `/users`, `/users/<user_id>` | User management. |
| GET/POST | `/jobs` | List or create jobs. |
| PUT/DELETE | `/jobs/<job_id>` | Update or delete jobs. |
| GET | `/applications` | All applications with enriched details. |
| PUT | `/applications/<app_id>` | Update an application. |
| GET/POST | `/blogs` | List or create blogs. |
| PUT/DELETE | `/blogs/<blog_id>` | Update or delete blogs. |
| POST | `/upload` | Generic file upload. |

---

## Authentication and roles

- Roles: `job_seeker` (default), `recruiter`, and `admin`.
- Registration through the UI supports `job_seeker` and `recruiter`; recruiters must provide a company name. Admin accounts must be assigned in Firestore.
- Backend login uses email/password with Werkzeug password hashes stored in Firestore. Password reset in the frontend uses Firebase Authentication's `sendPasswordResetEmail`.
- Sessions are stored in `localStorage` when "remember me" is enabled, otherwise in `sessionStorage`.
- The frontend sends `X-User-Id` from browser storage with API requests and uses private/recruiter/admin route guards that redirect unauthorized users.
- Default post-login redirects: `admin → /admin`, `recruiter → /recruiter`, otherwise `/dashboard`.

---

## Usage limits

Daily AI usage is tracked per user and feature in Firestore (`daily_usage`), keyed by calendar day. Exceeding a limit returns HTTP 429 with `limit_exceeded: true`, and the frontend shows a toast. Admin accounts are exempt.

| Usage type | Limit | Applies to |
| --- | --- | --- |
| `cv_analysis` | 2 / day | AI resume analysis |
| `ai_other` | 5 / day | Storing analyses, cover letters |
| `interview` | 1 / day | Interview start and answer (evaluation is exempt) |
| `chat` | 10 / day | Chatbot messages |
| `chatbot_other` | 5 / day | CV review, roadmap, interview coach, job recommendations |

---

## Deployment

### Vercel (frontend + serverless API)

The root `vercel.json` builds the CRA app from `JobNexAI/frontend`, serves `JobNexAI/frontend/build`, and rewrites `/api/(.*)` to `/api/index`, where `api/index.py` imports the Flask app from `JobNexAI/backend`. All other paths are rewritten to `index.html` for client-side routing.

1. Import the repository into Vercel.
2. Set the frontend `REACT_APP_*` environment variables in the Vercel project.
3. Set the backend Firebase and AI environment variables as well (the serverless handler runs in the same project).
4. Deploy.

Alternate Vercel backend entry points also exist at `JobNexAI/api/handler.py` and under `JobNexAI/backend-deploy/` (`pyproject.toml` declares `api.handler:app` as the entry point).

### Render (standalone backend)

`render.yaml` defines a free-tier Python web service named `jobnex-ai-backend`:

- **Root directory:** `JobNexAI/backend`
- **Build:** `pip install -r requirements.txt`
- **Start:** `gunicorn app:app`
- **Region:** Oregon; **branch:** `master`
- **Python:** 3.11.11
- **Environment:** `FLASK_ENV=production`, `CORS_ORIGINS` set to the deployed Vercel URL and localhost

Add your Firebase and AI secrets as environment variables in the Render dashboard. Then set `REACT_APP_API_URL` in the frontend to `https://<your-app>.onrender.com/api`.

---

## Testing

```bash
# Frontend (Create React App test runner)
cd JobNexAI/frontend
npm test
```

No automated backend test suite is included. `JobNexAI/backend/check_blogs.py` is a small manual debug script for inspecting blog records.

Use `GET /api/health` for a quick backend smoke test after any deployment or configuration change.

---

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Frontend API calls fail locally | Ensure the backend is running on port 5000, or set `REACT_APP_API_URL` explicitly. Check `CORS_ORIGINS` includes `http://localhost:3000`. |
| `FirebaseError` / app fails to start | Verify service account credentials or the individual `FIREBASE_*` variables, and confirm Firestore and Storage are enabled. |
| "Only PDF files allowed" on analysis | `/api/ai/analyze-cv` accepts PDF only; other upload endpoints accept images and documents. |
| Scanned PDF yields no text | Install Tesseract OCR on the host (and `pytesseract`/`Pillow`), or configure an OpenAI/OpenRouter key for AI vision OCR. |
| "Daily limit exceeded" toast | Per-user AI limits were reached; limits reset the next calendar day (admins are exempt). |
| Build fails on Vercel | Confirm the root `vercel.json` build command and that all `REACT_APP_*` variables are set for the build environment. |
| 404 on client-side routes after deploy | Ensure the SPA rewrite to `/index.html` from `vercel.json` is active. |

---

## Security notes and limitations

- Credentials (`serviceAccountKey.json`, `.env`, `.env.local`) are secrets. They are excluded from `.gitignore`/`.vercelignore`, but you should still verify they are never committed or exposed in client bundles.
- User identity is currently taken from the plain `X-User-Id` header; the frontend does not send an ID token on API requests. Firebase ID-token verification helpers exist in the backend but are not applied to routes.
- Admin routes currently rely on client-side guards and do not verify the `admin` role server-side. Enforce token verification and role checks before exposing this project publicly.
- Uploaded files are made publicly readable via Firebase Storage download URLs. Use storage rules and signed URLs if private documents are required.
- The message shown with rate-limit errors says "after 12 hours", but limits are keyed by calendar day.

---

## License

Not specified in the repository. Contact the repository owner for reuse permissions.
