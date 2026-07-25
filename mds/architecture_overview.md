# TruthForge-AI Backend Architecture Overview

## Executive Summary

This document provides a comprehensive technical reference for the production-ready backend boilerplate built for **TruthForge-AI**, an AI-powered research verification platform.

The backend is built with Node.js and Express using modern ES Modules (`import`/`export`), structured following clean architecture principles, and configured for Supabase (PostgreSQL) and Render deployment.

---

## Tech Stack & Core Libraries

- **Runtime Environment**: Node.js (v18+)
- **Module System**: ES Modules (`"type": "module"` in `package.json`)
- **Web Framework**: Express.js (`v4.21.2`)
- **Database Client**: `@supabase/supabase-js` (`v2.48.1`)
- **Environment Management**: `dotenv` (`v16.4.7`)
- **Security & Utilities**:
  - `helmet`: HTTP headers security
  - `cors`: Cross-Origin Resource Sharing handling
  - `compression`: Gzip response compression
  - `morgan`: Request HTTP logging
- **Development Tooling**: `nodemon` (`v3.1.9`)

---

## Directory & File Structure

```text
c:\TruthForge-AI\
├── package.json                    # Root proxy package for Render deployment
├── README.md                       # Root documentation & Render guide
├── mds/                            # Documentation & context handover directory
│   ├── architecture_overview.md    # Architecture & implementation details
│   ├── deployment_guide.md         # Deployment & Render troubleshooting log
│   └── future_roadmap_context.md   # Modular expansion guide for future AI components
└── backend/                        # Primary backend service workspace
    ├── package.json                # Main application dependencies & scripts
    ├── .env.example                # Environment variables template
    ├── .env                        # Local development environment configuration
    ├── .gitignore                  # Git exclusions for dependencies, logs, & secrets
    ├── README.md                   # Backend specific overview & usage
    └── src/
        ├── config/
        │     env.js                # Fail-fast environment variable validation
        │     supabase.js           # Supabase client & admin client initialization
        ├── controllers/
        │     health.controller.js  # Controller returning system status & uptime
        ├── routes/
        │     health.routes.js      # Express router mapping /api/v1/health
        ├── middleware/
        │     error.middleware.js   # Centralized JSON error handler
        │     notFound.middleware.js# Standard 404 JSON fallback middleware
        ├── services/
        │     .gitkeep              # Service layer placeholder for business logic
        ├── repositories/
        │     .gitkeep              # Data access layer placeholder for DB queries
        ├── utils/
        │     .gitkeep              # Utility helper functions placeholder
        ├── app.js                  # Express app setup, middleware, & route mounting
        └── server.js               # HTTP listener, host binding (0.0.0.0), & graceful shutdown
```

---

## Core Components Breakdown

### 1. Fail-Fast Environment Validation (`src/config/env.js`)
Validates mandatory variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) upon initial module load. If any secret is missing, it logs a fatal error and terminates the process immediately (`process.exit(1)`).
Dynamic port resolution (`process.env.PORT || 5000`) guarantees zero-config compatibility on Render and containerized hosts.

### 2. Database Integration Setup (`src/config/supabase.js`)
Initializes standard client (`supabase`) and elevated administrative client (`supabaseAdmin`) using the validated configuration from `env.js`.

### 3. Application Assembly (`src/app.js`)
Constructs the Express instance with middleware stack executed in strict order:
1. `helmet()` - Secure headers
2. `cors()` - Cross-Origin enablement
3. `compression()` - Response compression
4. `morgan()` - Request logging
5. `express.json()` & `express.urlencoded()` - Body parsing
6. Routes mounting (`/api/v1/health`)
7. `notFoundMiddleware` - Catch-all 404 handler
8. `errorMiddleware` - Centralized error handler

### 4. HTTP Server Core (`src/server.js`)
Starts listener bound to `0.0.0.0` host and attaches `SIGTERM` / `SIGINT` graceful shutdown event listeners.

---

## Health Check API Specification

- **Endpoint**: `GET /api/v1/health`
- **Response Status**: `200 OK`
- **Payload Schema**:
  ```json
  {
    "success": true,
    "message": "Backend is healthy",
    "timestamp": "2026-07-25T11:42:45.454Z",
    "uptime": "0h 1m 9s",
    "environment": "production",
    "version": "1.0.0"
  }
  ```
