# TruthForge-AI Backend Foundational CRUD Architecture

## Executive Summary

This document details the complete foundational backend implementation for **TruthForge-AI**. The backend provides a production-ready, reusable CRUD foundation built with **Node.js**, **Express**, **Supabase (PostgreSQL)**, and **ES Modules** following **Clean Architecture**, **Repository Pattern**, **Service Layer**, **Controller Layer**, and **Validation Layer** principles.

---

## Technical Stack & Architecture

- **Runtime Environment**: Node.js (ES Modules `"type": "module"`)
- **Web Framework**: Express.js
- **Database**: Supabase / PostgreSQL
- **Design Patterns**:
  - **Clean Architecture & Separation of Concerns**
  - **Generic Repository Pattern** (`BaseRepository`)
  - **Generic Service Layer** (`BaseService`)
  - **Generic Controller Layer & Response Utilities** (`BaseController`)
  - **Validation Middleware Layer** (`validatePayload`)
  - **Strict Domain Isolation** (`src/modules/*`)

---

## Directory & File Structure

```text
backend/src/
├── app.js                              # Express app configuration & module route mounting
├── server.js                           # HTTP server listener & graceful shutdown
├── config/
│   ├── env.js                          # Environment variable validation
│   └── supabase.js                     # Supabase client & admin client configuration
├── utils/
│   ├── errors.js                       # AppError, NotFoundError, BadRequestError, ConflictError, ValidationError
│   ├── response.js                     # Standardized sendSuccess & sendError response utilities
│   ├── logger.js                       # HTTP request & CRUD operation execution time loggers
│   └── validator.util.js               # Payload validation & UUID checks
├── middleware/
│   ├── error.middleware.js             # Centralized JSON error handler (400, 404, 409, 500)
│   ├── logger.middleware.js            # HTTP request duration logging middleware
│   └── notFound.middleware.js          # Standard 404 fallback middleware
├── common/
│   ├── repositories/
│   │   └── base.repository.js          # BaseRepository (findById, findAll, create, update, delete, exists, paginate)
│   ├── services/
│   │   └── base.service.js             # BaseService (create, update, delete, findOne, findMany, timing logs)
│   └── controllers/
│       └── base.controller.js          # BaseController (create, getAll, getById, update, delete)
├── modules/
│   ├── queries/                        # Isolated Queries Module
│   │   ├── dto/ (create-query.dto.js, update-query.dto.js)
│   │   ├── validators/ (queries.validator.js)
│   │   ├── repositories/ (queries.repository.js)
│   │   ├── services/ (queries.service.js)
│   │   ├── controllers/ (queries.controller.js)
│   │   └── routes/ (queries.routes.js)
│   ├── reports/                        # Isolated Reports Module
│   │   ├── dto/ (create-report.dto.js, update-report.dto.js)
│   │   ├── validators/ (reports.validator.js)
│   │   ├── repositories/ (reports.repository.js)
│   │   ├── services/ (reports.service.js)
│   │   ├── controllers/ (reports.controller.js)
│   │   └── routes/ (reports.routes.js)
│   ├── claims/                         # Isolated Claims Module
│   │   ├── dto/ (create-claim.dto.js, update-claim.dto.js)
│   │   ├── validators/ (claims.validator.js)
│   │   ├── repositories/ (claims.repository.js)
│   │   ├── services/ (claims.service.js)
│   │   ├── controllers/ (claims.controller.js)
│   │   └── routes/ (claims.routes.js)
│   ├── sources/                        # Isolated Sources Module
│   │   ├── dto/ (create-source.dto.js, update-source.dto.js)
│   │   ├── validators/ (sources.validator.js)
│   │   ├── repositories/ (sources.repository.js)
│   │   ├── services/ (sources.service.js)
│   │   ├── controllers/ (sources.controller.js)
│   │   └── routes/ (sources.routes.js)
│   └── pipeline/                       # Isolated Pipeline Module
│       ├── dto/ (create-pipeline-run.dto.js, update-pipeline-run.dto.js)
│       ├── validators/ (pipeline.validator.js)
│       ├── repositories/ (pipeline.repository.js)
│       ├── services/ (pipeline.service.js)
│       ├── controllers/ (pipeline.controller.js)
│       └── routes/ (pipeline.routes.js)
└── scripts/
    ├── verify_backend_crud.js          # API Integration verification test script
    └── test_unit_crud.js               # Offline unit test suite for all layers
```

---

## Core Infrastructure Features

### 1. Database Schema & Migration Setup
- **`supabase/migrations/000001_initial_schema.sql`**: Initial tables (`queries`, `reports`, `claims`, `sources`, `claim_sources`, `evidence_lineage`).
- **`supabase/migrations/000002_create_pipeline_runs_table.sql`**: Added `pipeline_runs` table for automated verification execution tracking.
- **`supabase/full_schema_and_seed.sql`**: Consolidated SQL script for one-click deployment via Supabase Web SQL Editor.

### 2. Base Repository (`base.repository.js`)
Generic data access layer supporting:
- `findById(id)`
- `findAll(options)` / `paginate(options)`
- `create(data)`
- `update(id, data)`
- `delete(id)`
- `exists(criteria)`
- **PostgreSQL ILIKE Search**: Global keyword search via `?q=term`.
- **Dynamic Filtering**: Target entity columns (e.g. `status`, `detected_domain`, `verification_status`, `publisher`, `source_type`, `trust_score`, `stage`).
- **Pagination & Sorting**: Offset/limit calculation (`page`, `limit`) and dynamic ordering (`sort`, `order`).

### 3. Base Service (`base.service.js`)
Business logic layer wrapping repositories:
- Enforces entity retrieval checks throwing `NotFoundError` (404) when resources are missing.
- Automatically measures and logs execution time:
  `[CRUD] Entity: <EntityName> | Operation: <Op> | Execution Time: <ms>`

### 4. Controller Layer & Response Standard
All HTTP responses strictly adhere to uniform JSON contracts:
- **Success (200 OK / 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Query created successfully",
    "data": {}
  }
  ```
- **Error (400 / 404 / 409 / 500)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": ["Field 'query_text' is required"]
  }
  ```

### 5. Validation Layer (`validator.util.js`)
Rejects invalid request payloads before reaching services, returning HTTP 400 with detailed field error messages. Enforces data types, required fields, enum bounds, URL syntax, and UUID format checks.

---

## API Endpoints Reference

### 1. Queries Module (`/api/v1/queries`)
- `POST /api/v1/queries` - Create query
- `GET /api/v1/queries` - List queries (Pagination: `?page=1&limit=20`, Filter: `?status=pending&domain=biomedical`, Search: `?q=mRNA`)
- `GET /api/v1/queries/:id` - Fetch query by UUID
- `PATCH /api/v1/queries/:id` - Update query
- `DELETE /api/v1/queries/:id` - Delete query

### 2. Reports Module (`/api/v1/reports`)
- `POST /api/v1/reports` - Create verification report
- `GET /api/v1/reports` - List reports (Filter: `?status=completed`, Search: `?q=clinical`)
- `GET /api/v1/reports/:id` - Fetch report by UUID
- `PATCH /api/v1/reports/:id` - Update report
- `DELETE /api/v1/reports/:id` - Delete report

### 3. Claims Module (`/api/v1/claims`)
- `POST /api/v1/claims` - Create claim
- `GET /api/v1/claims` - List claims (Filter: `?verification_status=verified&confidence=0.9`, Search: `?q=cell`)
- `GET /api/v1/claims/:id` - Fetch claim by UUID
- `PATCH /api/v1/claims/:id` - Update claim
- `DELETE /api/v1/claims/:id` - Delete claim

### 4. Sources Module (`/api/v1/sources`)
- `POST /api/v1/sources` - Create evidence source
- `GET /api/v1/sources` - List sources (Filter: `?source_type=journal&publisher=Nature`, Search: `?q=vaccine`)
- `GET /api/v1/sources/:id` - Fetch source by UUID
- `PATCH /api/v1/sources/:id` - Update source
- `DELETE /api/v1/sources/:id` - Delete source

### 5. Pipeline Module (`/api/v1/pipeline`)
- `POST /api/v1/pipeline` - Create pipeline run
- `GET /api/v1/pipeline` - List pipeline runs (Filter: `?status=in_progress&stage=scraped`, Search: `?q=error`)
- `GET /api/v1/pipeline/:id` - Fetch pipeline run by UUID
- `PATCH /api/v1/pipeline/:id` - Update pipeline run
- `DELETE /api/v1/pipeline/:id` - Delete pipeline run

---

## Future Compatibility

The CRUD foundation is built for seamless future integration of AI modules:
- **Query Analyzer**: Extends `QueriesService` to invoke claim extraction services without altering CRUD routes.
- **Domain Scraper & Knowledge Normalizer**: Writes output directly via `SourcesRepository` & vector stores.
- **Claim Verifier & Source Evaluator**: Updates claim `confidence_score` and `verification_status` via existing DTOs/Services.
- **Report Generator**: Synthesizes verified claims into `reports` entities using `ReportsService`.

---

## Verification & Testing Log

1. **Node Compilation**:
   Ran `node --check` across all JavaScript modules — zero syntax errors.
2. **Foundational Unit Test Suite** (`node src/scripts/test_unit_crud.js`):
   - Verified DTO instantiation & field mappings.
   - Verified UUID checks & payload validation rules.
   - Verified HTTP status mapping (400, 404, 409, 500).
   - Verified `BaseRepository`, `BaseService`, and `BaseController` execution timing and logic.
