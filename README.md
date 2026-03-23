# FinTrack — Expense Classification & Reporting Tool

A full-stack fintech application for uploading Indian bank statement CSV files, auto-classifying transactions using a 4-level ensemble ML classifier, and displaying an interactive dashboard with charts, filters, and export functionality.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                   │
│   React 18 + Vite + TypeScript + Tailwind CSS + Recharts          │
│   ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐      │
│   │  Login/   │  │ Dashboard │  │  Upload   │  │  Export  │      │
│   │ Register  │  │  Charts   │  │  CSV Drop │  │ CSV/PDF  │      │
│   └──────────┘  └───────────┘  └───────────┘  └──────────┘      │
│         ↕              ↕              ↕              ↕            │
│   ┌──────────────── Axios Client (JWT Interceptors) ─────────┐   │
└───┼──────────────────────────────────────────────────────────┼───┘
    ↕                                                          ↕
┌───┼────────────────── BACKEND API ──────────────────────────┼───┐
│   │  Express + TypeScript + Prisma ORM                      │   │
│   ├─────────────┬──────────────┬──────────────┬─────────────┤   │
│   │ Auth Module  │ Upload Module│ Transactions │ Export Module│  │
│   │ JWT + bcrypt │ Multer+Parse │ CRUD+Filter  │ PDF+CSV     │  │
│   └──────┬──────┴──────┬───────┴──────┬───────┴──────┬──────┘   │
│          ↕             ↕              ↕              ↕          │
│   ┌──── 4-Level Ensemble Classifier ────┐                      │
│   │ L1: Keyword → L2: Fuzzy → L3: Regex │ → L4: ML Service    │
│   └─────────────────────────────────────┘                      │
│          ↕                                      ↕              │
│   ┌──────────────┐                    ┌─────────────────┐      │
│   │  PostgreSQL  │                    │  Python FastAPI  │      │
│   │   (Prisma)   │                    │  sentence-BERT   │      │
│   └──────────────┘                    └─────────────────┘      │
└────────────────────────────────────────────────────────────────┘
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Zustand |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT (access 15min + refresh 7d), bcrypt |
| ML | sentence-transformers (all-MiniLM-L6-v2), FastAPI |
| File | Multer, PapaParse |
| Export | PDFKit, json2csv |
| Deploy | Docker, docker-compose |

## Prerequisites

- **Node.js** 20+
- **Python** 3.10+ (for ML service)
- **PostgreSQL** 15+
- **Docker** & Docker Compose (optional, for containerized deployment)

## Local Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd fintech-app

# Backend
cd backend
npm install
cp ../.env.example ../.env  # Edit with your values
npx prisma generate
npx prisma migrate dev --name init

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `.env` in the project root:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fintech_db
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
FRONTEND_URL=http://localhost:5173
```

### 3. Start Services

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev

# Terminal 3 — ML Service (optional)
cd ml-service
pip install -r requirements.txt
python main.py
```

### 4. Open App

Navigate to **http://localhost:5173**

## Docker Deployment

```bash
# Single command to start everything
docker-compose up --build

# This starts:
# - PostgreSQL on port 5432
# - Backend API on port 4000
# - ML Service on port 8000
# - Frontend on port 5173
```

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/refresh` | ❌ | Refresh token pair |
| POST | `/api/auth/logout` | ✅ | Revoke refresh token |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/upload` | ✅ | Upload CSV file (multipart/form-data) |
| GET | `/api/upload` | ✅ | List user uploads |
| GET | `/api/transactions` | ✅ | List transactions (paginated, filterable) |
| GET | `/api/transactions/summary` | ✅ | Get spending summary |
| GET | `/api/transactions/categories` | ✅ | Get unique categories |
| PATCH | `/api/transactions/:id/category` | ✅ | Update category manually |
| DELETE | `/api/transactions/:id` | ✅ | Delete transaction |
| GET | `/api/export/csv` | ✅ | Export transactions as CSV |
| GET | `/api/export/pdf` | ✅ | Export report as PDF |

### Request/Response Format

**Success:** `{ data: { ... } }`
**Error:** `{ error: "message", code?: "ERROR_CODE" }`
**Paginated:** `{ data: [...], total: number, page: number, totalPages: number }`

## CSV Format Guide

The parser auto-detects column names. Here are supported formats:

### HDFC Bank
```csv
Date,Narration,Debit,Credit,Balance
01/01/2024,SWIGGY ORDER 12345,250.00,,5000.00
```

### SBI Bank
```csv
Txn Date,Description,Withdrawal,Deposit
15/03/2024,UPI/UBER/RIDE,350.00,
```

### ICICI Bank
```csv
Transaction Date,Transaction Details,Amount
2024-01-15,AMAZON PURCHASE,-1500.00
```

### Axis Bank
```csv
Date,Particulars,Dr,Cr
01-01-2024,NEFT/SALARY,,75000.00
```

### Kotak Bank
```csv
Posting Date,Description,Debit Amount,Credit Amount
01/01/24,POS NETFLIX IND,499.00,
```

**Supported column names:**
- **Date:** date, txn date, transaction date, value date, posting date
- **Description:** description, narration, particulars, remarks, transaction details
- **Amount:** amount, debit, credit, withdrawal, deposit, dr, cr

## 4-Level Ensemble Classifier

```
Input: "UPI/SWGY*OrderXYZ/REF123"

Level 1 — Keyword Match
  ├─ Search 100+ Indian merchant keywords
  ├─ Result: Food (confidence: 1.0) ✅

Level 2 — Fuzzy Match
  ├─ Use fuzzysort for typo tolerance
  ├─ Result: Food (confidence: 0.85) ✅

Level 3 — Regex Extract
  ├─ Extract "SWGY" from UPI pattern
  ├─ Re-match extracted merchant
  ├─ Result: Food (confidence: 0.85) ✅

Level 4 — ML (sentence-transformers)
  ├─ Only called if confidence < 0.7
  ├─ Cosine similarity vs category embeddings
  └─ Result: skipped (L1 already high confidence)

Ensemble Voting:
  Food: 1.0×1.0 + 0.85×0.85 + 0.85×0.80 = 2.40
  Winner: Food (confidence: 1.0, level: 1)
```

## Edge Cases Handled

- ✅ Multiple date formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD/MM/YY)
- ✅ Currency symbols and commas in amounts (₹1,500.00)
- ✅ Separate debit/credit columns or single amount column
- ✅ Duplicate transaction detection via SHA256 hash
- ✅ Suspiciously large amounts (>₹1 crore) flagged and skipped
- ✅ Malformed rows skipped with error reporting
- ✅ Empty/missing fields handled gracefully
- ✅ JWT refresh token rotation with reuse detection
- ✅ Rate limiting on auth and upload endpoints
- ✅ ML service graceful degradation (works without Python service)

## Running Tests

```bash
# Backend tests
cd backend
npm test

# Specific test suite
npx jest tests/classifier.test.ts
npx jest tests/auth.test.ts
npx jest tests/upload.test.ts
```

## Deployment to Render.com

### 1. Database
- Create a PostgreSQL instance on Render
- Copy the External Database URL

### 2. Backend
- Create a Web Service → Connect GitHub repo
- **Root Directory:** `backend`
- **Build Command:** `npm ci && npx prisma generate && npx prisma migrate deploy`
- **Start Command:** `npx tsx src/server.ts`
- Add environment variables from `.env.example`

### 3. ML Service
- Create a Web Service → Connect GitHub repo
- **Root Directory:** `ml-service`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 4. Frontend
- Create a Static Site → Connect GitHub repo
- **Root Directory:** `frontend`
- **Build Command:** `npm ci && npm run build`
- **Publish Directory:** `dist`
- Set `VITE_API_URL` to backend URL

## Design Decisions & Trade-offs

1. **4-level classifier over single ML:** The ensemble approach ensures fast classification for common transactions (L1 keyword is instant) while having ML as a fallback. This reduces latency and cost while maintaining accuracy.

2. **Refresh token rotation:** Each refresh token can only be used once. If a revoked token is reused, ALL tokens for that user are invalidated — detection of token theft.

3. **SHA256 dedup hash:** Using `userId + date + amount + description` prevents duplicate imports while allowing the same transaction description across different users.

4. **Batch processing (100 at a time):** Large CSV files are processed in batches to prevent memory exhaustion and provide incremental progress.

5. **ML service as optional:** The ML microservice is separate and the system works without it, making local development easier and the deployment footprint smaller.

6. **PostgreSQL over MongoDB:** Structured financial data with relationships (user → uploads → transactions) benefits from relational schema and Prisma's type-safe queries.
