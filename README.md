# Campus Placement Portal

An internal tool for a college's placement cell to manage end-to-end campus recruitment. Built with Next.js 14 (App Router), Node.js + Express, MongoDB Atlas, OpenRouter AI, and Brevo SMTP.

## Tech Stack

- **Frontend:** Next.js 14 (App Router, Client-side only), Tailwind CSS, Recharts, jsPDF, react-hot-toast
- **Backend:** Node.js + Express, MongoDB Atlas (Mongoose), JWT Auth, Multer, Nodemailer
- **AI:** OpenRouter API (`openai/gpt-oss-120b`)
- **Email:** Brevo SMTP (Nodemailer)

## Project Structure

```
placement-portal/
├── frontend/          # Next.js 14 App Router (JS only)
│   ├── app/           # Pages organized by role
│   ├── components/    # UI, layout, role-specific components
│   ├── context/       # AuthContext
│   └── lib/           # API client, auth helpers
├── backend/           # Express API
│   ├── src/
│   │   ├── config/    # DB & env config
│   │   ├── models/    # Mongoose schemas
│   │   ├── routes/    # API routes
│   │   ├── middleware/ # Auth & role guards
│   │   ├── services/  # Email & AI services
│   │   └── utils/     # Eligibility checker
│   └── uploads/       # Resume file storage
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free M0 cluster)
- Brevo account (free SMTP plan)
- OpenRouter account (free credits)

### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/placementportal
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your@gmail.com
BREVO_SMTP_PASS=your_brevo_smtp_key
FROM_EMAIL=your@gmail.com
FROM_NAME=Placement Cell

OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxx
OPENROUTER_MODEL=openai/gpt-oss-120b
FRONTEND_URL=http://localhost:3000
UPLOAD_PATH=./uploads
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Seed Admin Account

```bash
cd backend
npm run seed
```

This creates: `admin@college.edu` / `admin@123`

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit: http://localhost:3000

## User Roles & Demo Flow

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@college.edu | admin@123 | Seeded account |
| Student | Register on portal | Self-set | Pending admin approval |
| Company | Register on portal | Self-set | Pending admin approval |
| Faculty | Created by admin | Set by admin | Pre-approved |

### Best Demo Flow
1. Login as **admin** → approve pending students/companies
2. Login as **student** → fill profile → upload resume → browse jobs
3. Login as **company** → post job → view applicants → shortlist
4. Login as **student** → see application status update → notification
5. Login as **admin** → view reports → AI insights → export PDF

## Key Features

- **Role-based access:** Student, Company, Admin, Faculty with separate dashboards
- **Eligibility auto-filter:** Students only see jobs they qualify for (CGPA, branch)
- **AI integration:** Job matching, profile review, JD generation, placement insights via OpenRouter
- **Bulk CSV import:** Client-side preview (papaparse) → server-side processing
- **Notifications:** In-app + email (Brevo SMTP) for approvals, applications, shortlisting
- **Reports & Analytics:** Charts (Recharts), PDF export (jsPDF + html2canvas)
- **Resume management:** Upload, download (role-restricted), Multer storage

## API Routes

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Register, login, me |
| `/api/students` | Profile, resume, jobs, applications, notifications |
| `/api/companies` | Company profile |
| `/api/jobs` | Job CRUD, apply, applicants |
| `/api/applications` | Status updates, resume download |
| `/api/drives` | Placement drives (admin) |
| `/api/interviews` | Schedule & manage interviews |
| `/api/announcements` | Post & manage announcements (admin) |
| `/api/notifications` | User notifications |
| `/api/reports` | Analytics endpoints |
| `/api/admin` | Approvals, bulk import, faculty creation |
| `/api/ai` | OpenRouter AI features |

## External Services Setup

### MongoDB Atlas
1. Create free M0 cluster
2. Create database user
3. Whitelist `0.0.0.0/0` for dev
4. Get connection string → set as `MONGODB_URI`

### Brevo SMTP
1. Sign up at brevo.com
2. Go to SMTP & API → SMTP keys
3. Generate SMTP key
4. Use `smtp-relay.brevo.com:587` with your Gmail as sender

### OpenRouter
1. Sign up at openrouter.ai
2. API Keys → Create key
3. Set model: `openai/gpt-oss-120b`
