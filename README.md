# Complete Microservices Project Setup

This project uses a modern microservices architecture with:
- **Frontend**: Next.js + Vercel (React, TypeScript)
- **Backend**: ASP.NET Core Web API (C#)
- **AI Service**: Python FastAPI
- **Database**: Supabase (PostgreSQL)

## Project Structure
- `/frontend`: Next.js web application.
- `/backend`: ASP.NET Core API.
- `/ai_service`: Python FastAPI for AI tasks.

## Prerequisites
- [Node.js](https://nodejs.org/) & [npm](https://www.npmjs.com/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Python 3.11+](https://www.python.org/downloads/)
- [Docker & Docker Compose](https://www.docker.com/)

## Local Development (Docker)
1. Copy `.env.example` to `.env` and fill in your Supabase variables.
2. Run the application suite:
   ```bash
   docker-compose up --build
   ```
3. Access points:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - AI Service: `http://localhost:8000`

## Manual Development
### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
dotnet restore
dotnet run
```

### AI Service
```bash
cd ai_service
pip install -r requirements.txt
uvicorn main:app --reload
```

## Placeholders
- **AI Service Logic**: See `ai_service/main.py`.
- **Database Connection**: Use Supabase libraries in the Backend or Frontend based on your architecture. Ensure you add `SUPABASE_URL` and `SUPABASE_KEY` to the appropriate `.env` files.
