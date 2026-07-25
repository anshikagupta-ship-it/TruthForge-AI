# Render Deployment Guide & Troubleshooting Log

## Deployment Summary

- **Live URL**: `https://truthforge-ai-eza4.onrender.com`
- **Health Check Endpoint**: `https://truthforge-ai-eza4.onrender.com/api/v1/health`
- **Status**: Live and Operational

---

## Technical Deployment Challenges & Solutions

### Issue 1: Missing Root `package.json`
- **Symptom**: Render failed during initial build step with:
  ```text
  error Couldn't find a package.json file in "/opt/render/project/src"
  ```
- **Root Cause**: Render defaults to searching the repository root for `package.json`. The codebase was structured under `backend/`.
- **Solution**: Created a root `package.json` file delegating npm commands:
  ```json
  {
    "name": "truthforge-ai",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "scripts": {
      "postinstall": "cd backend && npm install",
      "start": "cd backend && npm start",
      "dev": "cd backend && npm run dev"
    }
  }
  ```

### Issue 2: Fail-Fast Missing Environment Variables
- **Symptom**: Render deployment failed with log:
  ```text
  [FATAL] Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
  ```
- **Root Cause**: The application requires Supabase configuration to run and fails fast when undefined.
- **Solution**: Configured environment secrets in Render Dashboard:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NODE_ENV` = `production`

### Issue 3: Dynamic Port and Host Binding
- **Solution Applied**:
  - Bound Express listener to `0.0.0.0` in `server.js` (`app.listen(env.port, '0.0.0.0', ...)`).
  - Dynamically parsed `process.env.PORT` in `config/env.js`.

---

## Render Deployment Options

### Method A: Root Package Proxy (Current Active Setup)
Deploy directly from Git. Render automatically runs `npm install` (which triggers `postinstall` into `backend/`) and `npm start` (which executes `cd backend && npm start`).

### Method B: Render Dashboard Root Directory Setting
Alternatively, in Render Service Settings:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

---

## How to Test Live Deployment

### Via cURL (Bash / Linux / macOS)
```bash
curl -s https://truthforge-ai-eza4.onrender.com/api/v1/health
```

### Via PowerShell
```powershell
(Invoke-WebRequest -Uri "https://truthforge-ai-eza4.onrender.com/api/v1/health").Content
```

### Via Browser
Visit: [https://truthforge-ai-eza4.onrender.com/api/v1/health](https://truthforge-ai-eza4.onrender.com/api/v1/health)
