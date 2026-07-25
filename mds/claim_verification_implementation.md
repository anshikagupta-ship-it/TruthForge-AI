# TruthForge-AI Phase 3 – Claim Verification Implementation Record

## Executive Summary

This document details the completed backend implementation for **Phase 3 – Claim Verification** of **TruthForge-AI**.

The Claim Verification module consumes an `EvidenceBatch`, an optional `EvidenceProfile`, and a `ClaimBatch`. Its sole responsibility is to evaluate whether every atomic claim statement is supported, partially supported, contradicted, insufficient, or unverifiable based **strictly and exclusively** on the supplied evidence context.

The implementation follows **Clean Architecture**, **Domain Driven Design**, **ES Modules**, and includes multi-level validation, automatic retry repair prompts, hallucination detection, structured JSON logging, Express route mounting, and a complete unit/integration test suite.

---

## 1. Directory & File Structure

The implementation is located under `backend/src/modules/verification/`:

```text
backend/src/modules/verification/
├── contracts/
│   ├── verificationBatch.contract.js   # VerificationBatch JSDoc contract definition
│   └── verifiedClaim.contract.js       # VerifiedClaim JSDoc contract definition
├── models/
│   ├── verifiedClaim.model.js          # VerifiedClaim domain entity class & fallback factory
│   └── verificationBatch.model.js     # VerificationBatch container entity class
├── resolvers/
│   ├── evidenceResolver.js             # Filters & cleans evidence snippets and extracts domains
│   └── verificationContextBuilder.js  # Formats token-efficient context blocks
├── prompts/
│   ├── systemPrompts.js                # Base, Medical, Legal, Scientific system prompts
│   ├── userPrompts.js                  # Dynamic user prompt generator with required JSON schema
│   └── promptRegistry.js               # Domain prompt router
├── parsers/
│   └── jsonResponseParser.js           # Sanitizes & parses raw LLM text/markdown JSON output
├── validators/
│   ├── schemaValidator.js              # Structural schema validator & status Enum check
│   ├── evidenceValidator.js            # Evidence reference validator & hallucinated ID detector
│   ├── contentValidator.js             # Explanation non-emptiness & length bounds check
│   └── verification.validator.js       # HTTP request middleware payload validator
├── utils/
│   ├── verificationLogger.js           # Structured JSON event logger
│   └── retryPolicy.js                  # Automatic retry policy & repair prompt generator
├── services/
│   └── claimVerification.service.js   # Core orchestrator service with Promise.allSettled isolation
├── controllers/
│   └── verification.controller.js      # Express Controller mapping HTTP requests
├── routes/
│   └── verification.routes.js          # Express Router for /api/v1/verification/verify
└── docs/
    └── claim_verification_architecture.md # Architectural specification document
```

---

## 2. Core Components Implementation Breakdown

### 2.1 Contracts & Domain Entities
- **`VerifiedClaimModel` (`models/verifiedClaim.model.js`)**: Encapsulates single claim evaluation results, frozen arrays for immutability (`supportingEvidenceIds`, `contradictingEvidenceIds`, `matchedEvidence`), execution metadata, and a static `createFallback` method for graceful degradation.
- **`VerificationBatchModel` (`models/verificationBatch.model.js`)**: Container entity computing batch totals (`supportedCount`, `partiallySupportedCount`, `contradictedCount`, `insufficientCount`, `unverifiableCount`).

### 2.2 Evidence Resolvers & Context Builder
- **`EvidenceResolver` (`resolvers/evidenceResolver.js`)**: Resolves target evidence items by ID, strips HTML, truncates long snippets (max 1000 chars), and extracts source domain hostnames automatically.
- **`VerificationContextBuilder` (`resolvers/verificationContextBuilder.js`)**: Builds clean prompt context blocks formatting evidence ID, domain, retrieval score, and snippet.

### 2.3 Prompts & Domain Selection
- **`PromptRegistry` (`prompts/promptRegistry.js`)**: Routes domain system prompts:
  - `general`: Enforces closed-world evidence boundary rule.
  - `medical`: Enforces dosage, study type (in-vitro vs clinical trial), and p-value precision.
  - `legal`: Enforces jurisdiction, court hierarchy, and operative dates.
  - `scientific`: Enforces correlation vs. causation distinction.

### 2.4 Parsers & Multi-Level Validators
- **`JsonResponseParser` (`parsers/jsonResponseParser.js`)**: Sanitizes markdown code fences (````json ... ````), cleans trailing commas, and extracts JSON objects safely.
- **`SchemaValidator` (`validators/schemaValidator.js`)**: Validates presence of `status`, `reason`, and array properties against the 5 allowed status Enums (`SUPPORTED`, `PARTIALLY_SUPPORTED`, `CONTRADICTED`, `INSUFFICIENT_EVIDENCE`, `UNVERIFIABLE`).
- **`EvidenceValidator` (`validators/evidenceValidator.js`)**: Verifies that every evidence ID returned by the LLM exists within the input `EvidenceBatch`. Flags unknown IDs as hallucinations.
- **`ContentValidator` (`validators/contentValidator.js`)**: Enforces explanation length bounds (10 to 1500 characters).

### 2.5 Retry Policy & Repair Handler
- **`RetryPolicy` (`utils/retryPolicy.js`)**: Implements automatic retry loop (up to 2 retries). If validation fails, it constructs a targeted **Repair Prompt** feeding back the previous failed raw response and validation error trace to guide the LLM to self-correct.

### 2.6 Service Orchestrator
- **`ClaimVerificationService` (`services/claimVerification.service.js`)**: Asynchronously processes all claims in parallel using `Promise.allSettled`. If an individual claim verification fails after retries, it degrades gracefully into a fallback `UNVERIFIABLE` entity without breaking the rest of the batch.

---

## 3. HTTP API Specification

### Endpoint: `POST /api/v1/verification/verify`

#### Request Payload Schema
```json
{
  "domain": "general",
  "maxRetries": 2,
  "evidenceBatch": {
    "batchId": "eb-101",
    "queryId": "q-101",
    "query": "Is contaminated water dangerous to human health?",
    "evidences": [
      {
        "evidenceId": "ev-1",
        "contentSnippet": "Contaminated drinking water leads to cholera outbreaks.",
        "sourceUrl": "https://who.int/water",
        "retrievalScore": 0.95
      }
    ]
  },
  "claimBatch": {
    "batchId": "cb-101",
    "queryId": "q-101",
    "query": "Is contaminated water dangerous to human health?",
    "totalClaims": 1,
    "claims": [
      {
        "claimId": "clm-1",
        "statement": "Contaminated drinking water spreads infectious diseases.",
        "supportingEvidenceIds": ["ev-1"]
      }
    ]
  }
}
```

#### Response Payload Schema (`200 OK`)
```json
{
  "success": true,
  "message": "Claims verified successfully.",
  "data": {
    "query": "Is contaminated water dangerous to human health?",
    "totalClaims": 1,
    "verifiedClaims": [
      {
        "claimId": "clm-1",
        "statement": "Contaminated drinking water spreads infectious diseases.",
        "verificationStatus": "SUPPORTED",
        "supportingEvidenceIds": ["ev-1"],
        "contradictingEvidenceIds": [],
        "explanation": "The evidence explicitly states that contaminated drinking water leads to cholera outbreaks.",
        "matchedEvidence": [
          {
            "evidenceId": "ev-1",
            "relevance": 0.95,
            "notes": "Direct match"
          }
        ],
        "metadata": {
          "verifiedAt": "2026-07-25T19:34:41.388Z",
          "verifier": "TruthForge-LLMVerifier (openai/gpt-4o)",
          "verifierVersion": "v3.1.0",
          "promptVersion": "v1.2.0",
          "executionTimeMs": 142,
          "retryCount": 0,
          "isFallback": false
        }
      }
    ],
    "executionSummary": {
      "executionTimeMs": 145,
      "supportedCount": 1,
      "partiallySupportedCount": 0,
      "contradictedCount": 0,
      "insufficientCount": 0,
      "unverifiableCount": 0,
      "provider": "openai/gpt-4o",
      "domain": "general"
    }
  }
}
```

---

## 4. Test Verification Suite Output

The module was verified via `backend/src/scripts/test_claim_verification.js`:

```text
====================================================
TRUTHFORGE-AI: PHASE 3 CLAIM VERIFICATION TEST SUITE
====================================================

--- TEST 1: EvidenceResolver ---
  ✓ Resolved exactly 2 matching evidence items
  ✓ First resolved evidence ID is ev-1
  ✓ Extracted domain correctly from URL

--- TEST 2: VerificationContextBuilder ---
  ✓ Contains formatted evidence block
  ✓ Contains snippet text

--- TEST 3: PromptRegistry Domain Routing ---
  ✓ General prompt enforces closed-world rule
  ✓ Medical prompt includes clinical trial precision rules

--- TEST 4: JsonResponseParser ---
  ✓ Stripped markdown fence and parsed JSON

--- TEST 5: Multi-Level Validators & Hallucination Detection ---
  ✓ SchemaValidator approves valid payload
  ✓ SchemaValidator rejects invalid enum status
  ✓ EvidenceValidator rejects hallucinated ID ev-999
  ✓ Identifies invalid ID ev-999
  ✓ Kept valid ID ev-1
  ✓ ContentValidator approves valid reason length

--- TEST 6: ClaimVerificationService End-to-End Execution ---
  ✓ Batch contains 3 verified claims
  ✓ Claim 1 verified as SUPPORTED
  ✓ Claim 2 verified as SUPPORTED
  ✓ Claim 3 verified as UNVERIFIABLE
  ✓ Execution summary counts 2 SUPPORTED claims
  ✓ Execution summary counts 1 UNVERIFIABLE claim

====================================================
✅ ALL TEST SUITES PASSED SUCCESSFULLY!
====================================================
```
