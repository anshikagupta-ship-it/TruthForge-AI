# TruthForge-AI

AI-Powered Research Verification Platform.

## Architecture

This repository contains:
- `backend/`: Production-ready Node.js / Express / Supabase backend architecture.

## Deployment on Render

Render expects `package.json` either at the repository root or configured via **Root Directory**.

### Option 1: Zero-Config Deployment (Recommended)
This repository includes a root [package.json](file:///c:/TruthForge-AI/package.json) that automatically routes commands to the `backend/` directory:
- **Build Command**: `npm install` (triggers `postinstall` to install backend dependencies)
- **Start Command**: `npm start` (runs `cd backend && npm start`)

### Option 2: Render Dashboard Settings
If configuring directly in the Render Dashboard:
1. Go to your Web Service settings in **Render Dashboard**.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.

### Environment Variables on Render
Add the following Environment Variables in your Render Web Service settings:
- `PORT`: `5000` (or leave default for Render to assign)
- `NODE_ENV`: `production`
- `SUPABASE_URL`: `https://your-project.supabase.co`
- `SUPABASE_ANON_KEY`: `your-supabase-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY`: `your-supabase-service-role-key`

## Local Development

To run the backend locally:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Health check endpoint: `GET /api/v1/health`
