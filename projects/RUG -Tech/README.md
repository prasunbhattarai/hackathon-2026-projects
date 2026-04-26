# FundusAI

An AI-assisted retinal disease screening and clinical reporting platform built to support early detection in resource-constrained clinical environments.

---

## Team Members

| Name | GitHub Handle |
|------|---------------|
| *Prasun Bhattarai* | *prasunbhattarai* |
| *Bipin Subedi* | *BipinSubedi0608* |
| *Nirdesh Nepal* | *Nep34* |
| *Rakshak Sigdel* | *RakshakSigdel* |


---

## Problem Statement

Small clinics, especially in rural or under-resourced areas, lack access to ophthalmologists and specialized diagnostic tools. The result is delayed detection of vision-threatening retinal diseases like diabetic retinopathy, glaucoma, and hypertensive retinopathy. General practitioners face a high patient load with limited eye-care expertise, and expensive equipment makes routine screening impractical.

---

## Solution

FundusAI enables general practitioners to upload fundus (retinal) images and receive AI-generated risk assessments for three conditions:

- **Diabetic Retinopathy (DR)** - severity classification (No DR, Mild, Moderate, Severe, PDR)
- **Glaucoma** - binary risk classification (Low, Medium, High)
- **Hypertensive Retinopathy (HR)** - binary risk classification (Low, Medium, High)

The system works as follows:

1. A doctor logs in and creates or selects a patient profile.
2. A fundus image is uploaded and queued for asynchronous AI inference.
3. A ResNet18-based model analyzes the image and produces per-disease probability scores.
4. Grad-CAM heatmaps are generated to highlight regions of concern, supporting explainability.
5. Gemini LLM generates a structured clinical interpretation and a patient-friendly report.
6. Both report types (doctor-facing and patient-facing) are stored and available for PDF download.
7. A triage queue surfaces high-priority cases so critical findings are reviewed first.

FundusAI is not a diagnostic system. It is a support tool designed to assist clinicians in early detection and triage. All outputs include a clear disclaimer requiring qualified medical review before any clinical decision is made.

---

## Tech Stack

**AI / Machine Learning**
- Python
- PyTorch - ResNet18 transfer learning for DR, glaucoma, and hypertensive retinopathy classification
- OpenCV - image preprocessing and Grad-CAM heatmap generation
- Google Gemini API - LLM-assisted clinical interpretation and patient report generation

**Backend**
- Python 3.12
- FastAPI - REST API framework
- SQLAlchemy 2.x - ORM
- PostgreSQL - primary database
- Alembic - database migrations
- Celery + Redis - asynchronous task queue for AI inference
- Supabase - authentication (GoTrue JWT)
- Cloudinary - image and PDF storage
- WeasyPrint - PDF generation
- Docker

**Frontend**
- TypeScript
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Zustand - global state management
- TanStack Query v5 - server state and caching
- Framer Motion - animations
- Lucide React - icons

---

## Setup Instructions

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL
- Redis
- A Supabase project
- A Cloudinary account
- A Google Gemini API key

---

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

---

### 2. AI Layer

```bash
cd src/ai
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install torch torchvision opencv-python pillow google-generativeai python-dotenv
```

Create a `.env` file in `src/ai`:

```env
GOOGLE_API_KEY=your_gemini_api_key
```

Place trained model files in `src/ai/models/`:
- `dr.pth`
- `hypertensive_and_glaucoma_model.pth`

To train models from scratch, place datasets in `src/ai/pipeline/dataset/` and run:

```bash
python pipeline/dr_training.py
python pipeline/training.py
```

To run inference directly:

```bash
python inference/inference_service.py
```

---

### 3. Backend

```bash
cd src/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Required `.env` values:

```env
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/fundusai
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<jwt-secret>
REDIS_URL=redis://localhost:6379/0
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
```

Run database migrations:

```bash
alembic upgrade head
```

Seed development data (optional):

```bash
python seed.py
```

Start the API server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Start the Celery worker (in a separate terminal):

```bash
celery -A app.worker.celery_app worker --loglevel=info -Q analysis
```

API documentation is available at `http://localhost:8000/docs`.

---

### 4. Frontend

```bash
cd src/frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
# Set to "true" to use mock data without a running backend
NEXT_PUBLIC_USE_MOCK_API=false
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

To run with mock data only (no backend required):

```env
NEXT_PUBLIC_USE_MOCK_API=true
```

Login credentials for mock mode:
- Email: `dr.anita@sagarmathaeye.com`
- Password: `fundus-demo-123`

---

### 5. Docker (optional)

A `Dockerfile` is provided in `src/backend`. To run the backend in Docker:

```bash
cd src/backend
docker build -t fundusai-backend .
docker run -p 8000:8000 --env-file .env fundusai-backend
```

---

## Demo

- **Demo video**: *(Add link)*


---

## Architecture Overview

```
src/
  ai/          ResNet18 models, inference pipeline, Gemini report generation
  backend/     FastAPI REST API, Celery workers, PostgreSQL, Cloudinary
  frontend/    Next.js app, mock API layer, triage queue, report viewer
```

The backend orchestrates AI inference through a Celery task queue. After a fundus image is uploaded and stored in Cloudinary, a background worker runs the full AI pipeline, persists analysis results, and auto-generates doctor and patient reports as signed PDF URLs.

---

## Disclaimer

FundusAI is a prototype built for demonstration purposes. It is not clinically validated and must not be used for actual medical diagnosis. All predictions require review by a qualified medical professional before any clinical action is taken.
