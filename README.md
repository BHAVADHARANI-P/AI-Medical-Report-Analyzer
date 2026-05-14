# MedSENSE AI 🏥

An intelligent AI-powered medical report analyzer with severity classification and email delivery, built with React + Node.js + Gemini AI.

## Features
- 🔐 **Secure Auth** — JWT-based login & registration
- 📄 **AI Report Analysis** — Upload PDF/images for instant Gemini AI analysis
- 🚨 **Severity Classification** — Auto-classifies as NORMAL, MID, or EMERGENCY
- 👨‍⚕️ **Doctor Referral** — Emergency cases show a 1-line urgent message with specialist recommendation
- 📧 **Email Delivery** — Analysis emailed with severity badge
- 💬 **AI Chatbot** — Medical assistant powered by Gemini

## Tech Stack
- **Frontend**: React + Vite, Lucide Icons
- **Backend**: Node.js, Express, SQLite, JWT, bcrypt
- **AI**: Google Gemini 2.5 Flash API
- **Email**: Nodemailer + Gmail

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/BHAVADHARANI-P/AI-Medical-Report-Analyzer
cd AI-Medical-Report-Analyzer
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your credentials in .env
node server.js
```

### 3. Frontend setup
```bash
cd client
npm install
npm run dev
```

### 4. Or use the start script (Windows)
```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

## Environment Variables
See `backend/.env.example` for required variables.

## Usage
1. Register/Login at `http://localhost:5173`
2. Upload a medical report (PDF or image)
3. View AI analysis with severity badge
4. Check your email for the formatted report
