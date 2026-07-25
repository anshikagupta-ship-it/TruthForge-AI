# TruthForge-AI Future Roadmap & Developer Handover Context

## Purpose

This document serves as the developer context handover guide for adding business logic and AI-driven modules to the **TruthForge-AI** backend.

The architecture was explicitly designed to accommodate the core AI verification pipeline without requiring breaking structural changes.

---

## Architectural Principles for Future Modules

1. **Layered Separation of Concerns**:
   - `routes/`: Define API endpoints and apply route-specific middleware (auth, rate limiting, validation).
   - `controllers/`: Handle HTTP request validation, extract parameters, invoke services, and return JSON responses.
   - `services/`: Encapsulate business logic, orchestrate AI workflows, and external API calls.
   - `repositories/`: Database abstraction layer using Supabase clients (`supabase` or `supabaseAdmin`).
   - `utils/`: Reusable helper functions, formatting, and text processing.

2. **Standard Response Payload Format**:
   All API responses should strictly follow the standard JSON schema:
   ```json
   // Success Response
   {
     "success": true,
     "message": "Operation description",
     "data": {}
   }

   // Error Response
   {
     "success": false,
     "message": "Error description",
     "errors": []
   }
   ```

---

## Planned Platform Modules Roadmap

### 1. Query Analyzer Module
- **Purpose**: Parse user research queries, extract core claims, and identify key verification dimensions.
- **Placement**:
  - `src/services/queryAnalyzer.service.js`
  - `src/controllers/queryAnalyzer.controller.js`
  - `src/routes/queryAnalyzer.routes.js`

### 2. Deterministic Domain Scraper
- **Purpose**: Fetch content from vetted research domains and publications while handling rate-limits and robots.txt.
- **Placement**:
  - `src/services/scraper.service.js`
  - `src/utils/domParser.util.js`

### 3. Knowledge Normalizer
- **Purpose**: Clean scraped content, generate vector embeddings, and format unified knowledge chunks.
- **Placement**:
  - `src/services/knowledgeNormalizer.service.js`
  - `src/repositories/knowledge.repository.js` (Supabase vector store operations)

### 4. Claim Verification Agent
- **Purpose**: Execute multi-step LLM reasoning against normalized knowledge chunks to score claim accuracy.
- **Placement**:
  - `src/services/claimVerification.service.js`
  - `src/controllers/claimVerification.controller.js`

### 5. Source Authenticity Evaluator
- **Purpose**: Evaluate domain authority, journal impact factors, bias metrics, and publication credibility.
- **Placement**:
  - `src/services/sourceEvaluator.service.js`
  - `src/repositories/sources.repository.js`

### 6. Evidence Lineage Tracker
- **Purpose**: Track quote origin, document citation chains, and maintain cryptographic or hash-based lineage records.
- **Placement**:
  - `src/services/lineageTracker.service.js`

### 7. Report Generator
- **Purpose**: Synthesize verification findings, evidence graphs, confidence scores, and citation lists into structured JSON / PDF reports.
- **Placement**:
  - `src/services/reportGenerator.service.js`
  - `src/controllers/report.controller.js`
  - `src/routes/report.routes.js`

---

## Database Connection Context

Supabase clients are initialized in `src/config/supabase.js`:
- Use `supabase` for user-scoped or public RLS queries.
- Use `supabaseAdmin` (service role) only for background services, scrapers, and administrative operations.
