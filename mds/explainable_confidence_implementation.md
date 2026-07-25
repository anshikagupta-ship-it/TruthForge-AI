# Phase 6 – Explainable Confidence Engine Implementation Details

## Executive Summary

Phase 6 – **Explainable Confidence Engine** has been completely implemented in Node.js ES Modules under `backend/src/modules/confidence/`.

The module implements a **100% deterministic, non-probabilistic, and zero-LLM confidence scoring engine** that measures the reliability of the verification process for every claim statement based on outputs from preceding pipeline phases (`EvidenceBatch`, `EvidenceProfile`, `VerificationBatch`, `SourceAuthenticityBatch`, `EvidenceLineageBatch`).

---

## Directory & File Architecture

```text
backend/src/modules/confidence/
├── contracts/
│   ├── confidenceFactors.contract.js       # JSDoc type contracts for ConfidenceFactors
│   ├── confidenceExplanation.contract.js   # JSDoc type contracts for ConfidenceExplanation
│   ├── claimConfidence.contract.js         # JSDoc type contracts for ClaimConfidence
│   └── confidenceBatch.contract.js         # JSDoc type contracts for ConfidenceBatch
├── models/
│   ├── confidenceFactors.model.js          # Domain model for normalized factor breakdown
│   ├── confidenceExplanation.model.js      # Domain model for explanation vectors
│   ├── claimConfidence.model.js            # Domain model for claim confidence object
│   └── confidenceBatch.model.js            # Aggregate root container model
├── config/
│   ├── weights.json                        # Dynamic factor weights matrix
│   ├── penalties.json                      # Dynamic penalty deduction thresholds
│   ├── levels.json                         # Dynamic score-to-level mapping definitions
│   └── policyConfig.js                     # Policy loader & validator singleton
├── utils/
│   ├── mathUtils.js                        # Pure mathematical functions (clamp, ratio, weighted sum)
│   └── stringTemplates.js                  # Parameterized NLG explanation templates
├── validators/
│   └── confidenceValidator.js              # Safeguards for inputs, config, and output bounds
├── cache/
│   └── confidenceCache.js                  # In-memory map cache for evaluated claims
├── extractors/
│   └── featureExtractor.js                 # Pure feature extraction facade (13+ features)
├── calculators/
│   ├── factorCalculator.js                 # Transforms features into 8 sub-factors [0-100]
│   └── scoreCalculator.js                  # Computes weighted score, applies penalties & clamping
├── penalties/
│   └── penaltyEngine.js                    # Evaluates risk indicators and computes deductions
├── explainers/
│   └── explanationBuilder.js               # Assembles strengths, penalties, and summary reasons
├── services/
│   └── confidenceEngine.service.js         # Main pipeline orchestrator service
├── test/
│   └── confidenceEngine.test.js            # Verification & 100% determinism test suite
└── docs/
    └── explainable_confidence_architecture.md # Technical architectural specification
```

---

## Key Pipeline Components Implemented

### 1. Feature Extractor (`extractors/featureExtractor.js`)
Consumes raw input batches and extracts deterministic features:
- `verificationStatus`
- `supportingCount`, `contradictingCount`
- `avgSemanticScore`, `avgRetrievalScore`
- `avgSourceAuthenticityScore`
- `domainDiversityScore`, `sourceDiversityScore`
- `evidenceCoverageRatio`, `provenanceCompletenessRatio`, `evidenceAgreementRatio`
- `evidenceQualityScore`, `unknownDomainCount`

### 2. Factor Calculator (`calculators/factorCalculator.js`)
Computes 8 sub-factor scores $[0, 100]$:
1. `verificationStrength`: Mapped from status (`SUPPORTED` $= 100$, `PARTIALLY_SUPPORTED` $= 70$, `CONTRADICTED` $= 20$, `INSUFFICIENT_EVIDENCE` $= 10$, `UNVERIFIABLE` $= 0$).
2. `evidenceStrength`: Weighted combination of semantic score, retrieval score, and quality.
3. `sourceAuthenticity`: Average authenticity score from Phase 4 profiles.
4. `provenanceCompleteness`: Completeness ratio from Phase 5 graph validation.
5. `evidenceAgreement`: Source consensus ratio scaled by supporting evidence volume.
6. `evidenceCoverage`: Concept coverage ratio scaled to $[0, 100]$.
7. `contradictionPenalty`: Metric representing contradiction score buffer.
8. `retrievalQuality`: Retrieval similarity combined with domain diversity.

### 3. Penalty Engine (`penalties/penaltyEngine.js`)
Evaluates deductions from `config/penalties.json`:
- `contradictingEvidence`: Deducts $15$ points per contradicting source (max $45$).
- `lowSourceDiversity`: Deducts $15$ points if single-domain concentration detected.
- `brokenProvenance`: Deducts $25$ points if lineage graph is incomplete.
- `weakRetrieval`: Deducts $12$ points if semantic retrieval score $< 50$.
- `unknownSources`: Deducts $10$ points per unverified domain (max $30$).
- `missingEvidence`: Deducts $35$ points if claim lacks direct supporting evidence.

### 4. Score Calculator & Level Mapper (`calculators/scoreCalculator.js`)
Calculates final score:
$$\text{Score} = \text{clamp}\left( \sum (W_k \times F_k) - P_{\text{total}}, 0, 100 \right)$$
Maps final score to categorical confidence level (`VERY_HIGH`, `HIGH`, `MEDIUM`, `LOW`, `VERY_LOW`) via `config/levels.json`.

### 5. Explanation Builder (`explainers/explanationBuilder.js`)
Deterministically constructs `strengths`, `penalties`, and summary `reasons` string arrays using template replacement. **Zero LLMs used.**

---

## Verification & Determinism Results

Executed `node backend/src/modules/confidence/test/confidenceEngine.test.js`:
- Verified correct factor breakdown, score clamping, and natural language explanations.
- Successfully ran **10/10 consecutive executions producing 100% byte-identical output hashes**.
