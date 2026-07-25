# TruthForge-AI Backend

Production-ready backend architecture for **TruthForge-AI**, an AI-powered research verification platform. Built with Node.js, Express.js, Supabase (PostgreSQL), and designed for modern deployment platforms like Render.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Security & Utilities**: `helmet`, `cors`, `compression`, `morgan`, `dotenv`
- **Development**: `nodemon`

## Folder Architecture

```text
backend/
├── src/
│   ├── config/
│   │     supabase.js       # Supabase client initialization
│   │     env.js            # Fail-fast environment variable validation
│   │
│   ├── routes/
│   │     health.routes.js  # Health check endpoints
│   │
│   ├── controllers/
│   │     health.controller.js # Health status logic
│   │
│   ├── services/           # Business logic layer (future expansion)
│   │
│   ├── repositories/       # Data access layer (future expansion)
│   │
│   ├── middleware/
│   │     error.middleware.js    # Centralized JSON error handling
│   │     notFound.middleware.js # 404 JSON fallback handler
│   │
│   ├── utils/              # Utility functions & helpers
│   │
│   ├── app.js              # Express app setup & middleware configuration
│   └── server.js           # Environment loader & HTTP server entry point
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Designed for Future Scalability

The clean layer separation (Controllers -> Services -> Repositories) easily supports future modules for:
- Query Analyzer
- Deterministic Domain Scraper
- Knowledge Normalizer
- Claim Verification Agent
- Source Authenticity Evaluator
- Evidence Lineage Tracker
- Report Generator

## Environment Variables

Copy `.env.example` to `.env` before running the server:

```bash
cp .env.example .env
```

Required variables:
- `PORT`: Port for the Express HTTP server (default: 5000)
- `NODE_ENV`: Environment mode (`development` | `production` | `test`)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous API key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role API key

> Note: The application uses fail-fast validation and will terminate on startup if any required environment variable is missing.

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Production Mode

```bash
npm run start
```

## API Endpoints

### Health Check

- **URL**: `GET /api/v1/health`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Backend is healthy",
    "timestamp": "2026-07-25T14:08:36.000Z",
    "uptime": "0h 0m 15s",
    "environment": "development",
    "version": "1.0.0"
  }
  ```
