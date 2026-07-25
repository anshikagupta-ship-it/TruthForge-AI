# TruthForge-AI Phase 6 – Explainable Confidence Engine Architecture & Specification

## 1. Executive Summary

This document details the production-grade architectural design, technical specification, data contracts, component responsibilities, mathematical scoring models, validation rules, error handling, logging strategy, sequence flows, and extensibility framework for **Phase 6 – Explainable Confidence Engine** of **TruthForge-AI**.

The **Explainable Confidence Engine** sits directly downstream of **Evidence Lineage Engine (Phase 5)** and upstream of **Report Generator (Phase 7)**. Its sole responsibility is to compute a **deterministic, explainable, and auditable confidence score** for every verified claim using structural and metadata outputs from previous pipeline phases.

The engine operates under a **strictly non-probabilistic, zero-LLM, and fully deterministic paradigm**. Given identical input batches (`EvidenceBatch`, `EvidenceProfile`, `VerificationBatch`, `SourceAuthenticityBatch`, and `EvidenceLineageBatch`), the engine produces 100% byte-identical confidence scores and natural-language explanations across execution environments.

---

## 2. Pipeline Position & Operational Scope

### 2.1 End-to-End System Context

```text
User Query
    │
    ▼
Query Analyzer
    │
    ▼
Deterministic Domain Scraper
    │
    ▼
Retrieval Model
    │
    ▼
Evidence Ingestion Module
    │
    ▼
Evidence Profiling Engine
    │
    ▼
Claim Generator (Phase 2)
    │
    ▼
Claim Verification (Phase 3)
    │
    ▼
Source Authenticity Evaluation (Phase 4)
    │
    ▼
Evidence Lineage Engine (Phase 5)
    │
    ▼
Explainable Confidence Engine (Phase 6)  <--- [ DESIGNED IN THIS SPECIFICATION ]
    │
    ▼
Report Generator (Phase 7)
```

### 2.2 Input/Output Interfacing

- **Inputs Consumed**:
  1. `EvidenceBatch`: Raw ingested evidence records, text snippets, original source URLs, and retrieval scores.
  2. `EvidenceProfile`: Semantic vector scores, text quality metrics, token coverage, and metadata.
  3. `VerificationBatch`: Verified claims containing verdict statuses (`SUPPORTED`, `PARTIALLY_SUPPORTED`, `CONTRADICTED`, `INSUFFICIENT_EVIDENCE`, `UNVERIFIABLE`), logic breakdown, and evidence references.
  4. `SourceAuthenticityBatch`: Source domain profiles, trust levels (`GOVERNMENT`, `ACADEMIC`, `MEDICAL`, `COMMERCIAL`, `UNKNOWN`), and authenticity scores (0–100).
  5. `EvidenceLineageBatch`: Immutable provenance graph structures, root hashes, and claim node linkage completeness from Phase 5.

- **Outputs Produced**:
  - `ConfidenceBatch`: Complete collection of deterministic `ClaimConfidence` objects containing score (0–100), categorical confidence level (`VERY_HIGH`, `HIGH`, `MEDIUM`, `LOW`, `VERY_LOW`), normalized sub-factor scores, template-generated explanations, and execution metadata.

---

## 3. Module Responsibilities & Operational Boundaries

### 3.1 Primary Responsibility

The Explainable Confidence Engine has **one and only one responsibility**:

> **Compute a deterministic, explainable confidence score for every verified claim using outputs from previous phases.**

### 3.2 Non-Responsibilities & Prohibitions

| Scope Category | Prohibited Operation | Correct Pipeline Owner |
| :--- | :--- | :--- |
| **Claim Verification** | Re-verify, re-evaluate, or check truthfulness of claim statements | Phase 3 (Claim Verification) |
| **Claim Modification** | Mutate, rewrite, split, or alter claim text or structure | Phase 2 / Phase 3 |
| **Evidence Rewriting** | Rewrite, summarize, or modify evidence snippets or profiles | Phase 1 (Evidence Ingestion) |
| **Credibility Evaluation** | Re-evaluate source authority, TLD tiers, or domain credibility | Phase 4 (Source Authenticity) |
| **Report Generation** | Synthesize final human-readable markdown report or PDF output | Phase 7 (Report Generator) |
| **LLM Reasoning** | Invoke LLMs, probabilistic models, or non-deterministic AI logic | Strictly Prohibited |

---

## 4. Core Philosophy & Design Principles

### 4.1 Confidence vs. Truthfulness

The confidence score answers the question:
> **"How reliable was the verification process for this claim based on available evidence and provenance?"**

It does **NOT** answer:
> *"How true is this claim?"*

Truthfulness is established during **Phase 3 (Claim Verification)**. Confidence measures the structural quality, source credibility, evidence agreement, retrieval strength, and lineage completeness supporting that verdict.

### 4.2 Architectural Design Principles

1. **Strict Determinism**: Two identical sets of inputs must produce identical scores and explanations down to the floating-point bit representation and text ordering.
2. **Zero LLM / Probabilistic Dependency**: Feature extraction, factor calculations, weighting, penalties, and explanations are performed using pure mathematical formulas and template strings.
3. **Fully Configurable Engine**: Weights, penalty multipliers, threshold levels, and factor rules are stored in external JSON files (`config/weights.json`, `config/penalties.json`, `config/levels.json`). No magic numbers in code.
4. **Complete Explainability & Auditability**: Every final score breaks down into constituent factor scores, applied penalties, and natural language explanations detailing *why* the score was given.
5. **Fail-Safe Pipeline Continuity**: If an individual claim is missing lineage or authenticity profiles, the engine computes a degraded score with an explicit missing-feature penalty rather than throwing an exception or crashing the pipeline.

---

## 5. Folder Structure

The module is housed under `backend/src/modules/confidence/`.

```text
backend/src/modules/confidence/
├── contracts/
│   ├── confidenceFactors.contract.js       # TypeScript / JSDoc interface for ConfidenceFactors
│   ├── confidenceExplanation.contract.js   # TypeScript / JSDoc interface for ConfidenceExplanation
│   ├── claimConfidence.contract.js         # TypeScript / JSDoc interface for ClaimConfidence
│   └── confidenceBatch.contract.js         # TypeScript / JSDoc interface for ConfidenceBatch
├── models/
│   ├── confidenceFactors.model.js          # Domain entity representing normalized factor values
│   ├── confidenceExplanation.model.js      # Domain entity representing explanation arrays
│   ├── claimConfidence.model.js            # Domain entity for individual claim confidence result
│   └── confidenceBatch.model.js            # Aggregate container for full batch results
├── services/
│   └── confidenceEngine.service.js         # Main pipeline orchestrator service for Phase 6
├── extractors/
│   ├── featureExtractor.js                 # Primary feature extraction facade
│   ├── verificationFeatureExtractor.js    # Extracts verdict counts and verification metrics
│   ├── evidenceFeatureExtractor.js        # Extracts semantic, retrieval, and coverage metrics
│   ├── sourceFeatureExtractor.js          # Extracts authenticity scores and domain diversity
│   └── lineageFeatureExtractor.js         # Extracts provenance graph completeness metrics
├── calculators/
│   ├── factorCalculator.js                 # Aggregates feature metrics into raw factor values
│   ├── verificationStrengthCalculator.js   # Calculates verification strength factor [0-100]
│   ├── evidenceStrengthCalculator.js       # Calculates evidence strength factor [0-100]
│   ├── sourceAuthenticityCalculator.js     # Calculates source authenticity factor [0-100]
│   ├── provenanceCompletenessCalculator.js # Calculates lineage completeness factor [0-100]
│   ├── evidenceAgreementCalculator.js      # Calculates source agreement factor [0-100]
│   ├── evidenceCoverageCalculator.js       # Calculates claim coverage factor [0-100]
│   └── retrievalQualityCalculator.js       # Calculates retrieval quality factor [0-100]
├── penalties/
│   ├── penaltyEngine.js                    # Primary penalty orchestrator
│   ├── contradictionPenaltyRule.js         # Evaluates penalties for conflicting evidence
│   ├── duplicateSourcePenaltyRule.js       # Evaluates penalties for redundant source domains
│   ├── lowDiversityPenaltyRule.js          # Evaluates penalties for single-domain concentration
│   ├── brokenProvenancePenaltyRule.js      # Evaluates penalties for incomplete lineage graph
│   ├── weakRetrievalPenaltyRule.js         # Evaluates penalties for low similarity retrieval
│   └── unknownSourcePenaltyRule.js         # Evaluates penalties for unclassified/unknown domains
├── explainers/
│   ├── explanationBuilder.js               # Main explanation coordinator
│   ├── strengthExplainer.js                # Generates positive strength bullet points
│   ├── penaltyExplainer.js                 # Generates penalty bullet points
│   └── reasonExplainer.js                  # Generates high-level summary reasons
├── validators/
│   ├── inputBatchValidator.js              # Validates input batches for required fields
│   ├── configValidator.js                  # Validates weights, penalties, and levels JSON schemas
│   └── outputConfidenceValidator.js        # Validates score bounds, factor ranges, non-NaN values
├── config/
│   ├── weights.json                        # Configurable weights for score aggregation
│   ├── penalties.json                      # Configurable penalty deduct values and thresholds
│   ├── levels.json                         # Configurable score range to level mappings
│   └── policyConfig.js                     # Config loader and validation singleton
├── cache/
│   ├── cacheProvider.js                    # Abstract cache interface
│   └── confidenceCache.js                  # In-memory cache for claim confidence evaluations
├── utils/
│   ├── mathUtils.js                        # Pure math functions (weighted sum, clamp, normalize)
│   └── stringTemplates.js                  # Templated strings for deterministic NLG explanations
└── docs/
    └── explainable_confidence_architecture.md # Technical architectural specification
```

### Detailed Subdirectory Descriptions

- **`contracts/`**: Formal JavaScript / TypeScript data contract interface definitions.
- **`models/`**: Domain entity representations and immutability wrappers.
- **`services/`**: High-level orchestration service `ConfidenceEngineService`.
- **`extractors/`**: Pure functions extracting quantitative features from raw input batches.
- **`calculators/`**: Pure mathematical modules computing 8 normalized factor values.
- **`penalties/`**: Rule suite applying deductive penalties based on risk indicators.
- **`explainers/`**: Template-driven string generators constructing human-readable explanations.
- **`validators/`**: Comprehensive input, config, and output validation safeguards.
- **`config/`**: Externalized configuration JSON files defining weights, penalties, and levels.
- **`cache/`**: Caching abstractions for evaluated confidence scores.
- **`utils/`**: Shared mathematical helpers and text template registries.
- **`docs/`**: Complete module documentation and operational references.

---

## 6. Component Responsibilities Matrix

| Component Directory | Main Module / Class | Primary Responsibility |
| :--- | :--- | :--- |
| **services/** | `ConfidenceEngineService` | Orchestrates step-by-step confidence computation across extractors, calculators, weight engine, penalty engine, and explainer. |
| **extractors/** | `FeatureExtractor` | Consumes 5 input batches and extracts 13 normalized raw features without applying scoring logic. |
| **calculators/** | `FactorCalculator` | Transforms raw features into 8 normalized sub-factor scores ($0–100$) using factor-specific mathematical equations. |
| **config/** | `PolicyConfig` | Loads, parses, and validates `weights.json`, `penalties.json`, and `levels.json`. Ensures sum of weights equals 1.0. |
| **penalties/** | `PenaltyEngine` | Evaluates penalty rules against extracted features and outputs individual deduct values and cumulative contradiction penalties. |
| **scorers/** | `ScoreCalculator` | Computes weighted average of sub-factors, subtracts penalties, normalizes, clamps to $[0, 100]$, and maps to `ConfidenceLevel`. |
| **explainers/** | `ExplanationBuilder` | Assembles deterministic strength, penalty, and summary reason string arrays using parameterized message templates. |
| **validators/** | `OutputConfidenceValidator` | Checks final output contracts to guarantee no `NaN`, nulls, broken bounds ($<0$ or $>100$), or missing fields exist. |

---

## 7. Data Contracts Specification

### 7.1 `ConfidenceFactors` Contract

```typescript
/**
 * Sub-factor numerical scores ranging strictly from 0 to 100.
 */
export interface ConfidenceFactors {
  /** Score derived from verification verdict status (SUPPORTED = 100, CONTRADICTED = 20, etc.) */
  verificationStrength: number;

  /** Aggregate score derived from semantic relevance, retrieval score, and text quality */
  evidenceStrength: number;

  /** Average source authenticity score derived from Phase 4 authority profiles */
  sourceAuthenticity: number;

  /** Lineage graph completeness score derived from Phase 5 provenance nodes */
  provenanceCompleteness: number;

  /** Degree of agreement among independent evidence sources */
  evidenceAgreement: number;

  /** Proportion of claim key concepts supported by evidence */
  evidenceCoverage: number;

  /** Total penalty points deducted due to contradicting evidence and risk factors */
  contradictionPenalty: number;

  /** Score representing retrieval model relevance and evidence profile quality */
  retrievalQuality: number;
}
```

### 7.2 `ConfidenceExplanation` Contract

```typescript
/**
 * Deterministic natural language explanation vectors.
 */
export interface ConfidenceExplanation {
  /** Array of summary sentences explaining why the claim achieved its confidence level */
  reasons: string[];

  /** Array of specific penalty descriptions explaining deductions */
  penalties: string[];

  /** Array of specific positive factors contributing to high confidence */
  strengths: string[];
}
```

### 7.3 `ClaimConfidence` Contract

```typescript
export type ConfidenceLevel =
  | "VERY_HIGH"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "VERY_LOW";

export interface ClaimConfidenceMetadata {
  /** ISO 8601 timestamp of evaluation */
  evaluatedAt: string;

  /** Engine software version */
  engineVersion: string;

  /** Hash or version tag of weights.json */
  weightVersion: string;

  /** Hash or version tag of penalties.json */
  penaltyVersion: string;

  /** Total execution time for this claim in milliseconds */
  executionTimeMs: number;

  /** Optional trace tags or policy identifiers */
  [key: string]: any;
}

export interface ClaimConfidence {
  /** Unique ID of the claim evaluated */
  claimId: string;

  /** Final normalized and clamped confidence score [0 - 100] */
  confidenceScore: number;

  /** Categorical label corresponding to the score range */
  confidenceLevel: ConfidenceLevel;

  /** Breakdown of individual factor scores */
  confidenceFactors: ConfidenceFactors;

  /** Deterministic explanation vectors */
  explanation: ConfidenceExplanation;

  /** Execution and policy metadata */
  metadata: ClaimConfidenceMetadata;
}
```

### 7.4 `ConfidenceBatch` Contract

```typescript
export interface ConfidenceBatchMetadata {
  /** ISO 8601 timestamp of batch processing completion */
  processedAt: string;

  /** Policy configuration profile applied (e.g. "default", "medical_strict") */
  policyProfile: string;

  /** Total time taken to compute batch in milliseconds */
  totalExecutionTimeMs: number;

  /** Engine semver identifier */
  engineVersion: string;
}

export interface ConfidenceBatch {
  /** Unique identifier for this batch run */
  batchId: string;

  /** Original research query statement */
  query: string;

  /** Total count of claims evaluated in this batch */
  totalClaims: number;

  /** Collection of confidence results per claim */
  claims: ClaimConfidence[];

  /** Batch level execution metadata */
  metadata: ConfidenceBatchMetadata;
}
```

---

## 8. Feature Extraction Strategy

The `FeatureExtractor` module converts raw input batches into a structured `ExtractedFeatures` domain object. All extractions are pure functions.

```typescript
export interface ExtractedFeatures {
  verificationStatus: "SUPPORTED" | "PARTIALLY_SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT_EVIDENCE" | "UNVERIFIABLE";
  supportingCount: number;
  contradictingCount: number;
  avgSemanticScore: number;
  avgRetrievalScore: number;
  avgSourceAuthenticityScore: number;
  evidenceDiversityScore: number;
  sourceDiversityScore: number;
  domainDiversityScore: number;
  evidenceCoverageRatio: number;
  provenanceCompletenessRatio: number;
  evidenceAgreementRatio: number;
  evidenceQualityScore: number;
}
```

### Feature Extraction Formulas & Logic

1. **Verification Status**: Direct lookup from `VerificationBatch.claims[claimId].status`.
2. **Supporting & Contradicting Counts**: `supportingCount = claim.supportingEvidenceIds.length`, `contradictingCount = claim.contradictingEvidenceIds.length`.
3. **Average Semantic Score**:
   $$\text{avgSemanticScore} = \frac{1}{N} \sum_{i=1}^{N} \text{EvidenceProfile}[e_i].\text{semanticScore}$$
4. **Average Retrieval Score**:
   $$\text{avgRetrievalScore} = \frac{1}{N} \sum_{i=1}^{N} \text{EvidenceBatch}[e_i].\text{retrievalScore}$$
5. **Average Source Authenticity Score**:
   $$\text{avgSourceAuthenticityScore} = \frac{1}{S} \sum_{j=1}^{S} \text{SourceAuthenticityBatch}[s_j].\text{authenticityScore}$$
6. **Domain Diversity Score**:
   $$\text{domainDiversityScore} = \min\left(1.0, \frac{\text{Count of unique registered domain names}}{\text{Total Evidence Count}}\right)$$
7. **Provenance Completeness Ratio**:
   $$\text{provenanceCompletenessRatio} = \frac{\text{Valid Linked Lineage Nodes}}{\text{Expected Lineage Nodes}}$$
   - Complete lineage (Claim $\rightarrow$ Evidence $\rightarrow$ Source $\rightarrow$ Authenticity Profile): $1.0$ ($100\%$)
   - Missing Profile (Claim $\rightarrow$ Evidence $\rightarrow$ Source $\rightarrow$ Missing Profile): $0.75$ ($75\%$)
   - Broken Lineage (Orphan Evidence or broken edge): $0.25$ ($25\%$)
8. **Evidence Agreement Ratio**:
   $$\text{evidenceAgreementRatio} = \frac{\text{supportingCount}}{\text{supportingCount} + \text{contradictingCount}}$$

---

## 9. Confidence Factor Design

Each factor calculator computes a normalized value in $[0, 100]$.

### 9.1 Verification Strength ($F_1$)

Derived directly from verdict classification:
- `SUPPORTED`: 100
- `PARTIALLY_SUPPORTED`: 70
- `CONTRADICTED`: 20
- `INSUFFICIENT_EVIDENCE`: 10
- `UNVERIFIABLE`: 0

### 9.2 Evidence Strength ($F_2$)

Combines semantic relevance score, retrieval score, and text quality:
$$F_2 = (0.45 \times \text{avgSemanticScore}) + (0.35 \times \text{avgRetrievalScore}) + (0.20 \times \text{evidenceQualityScore})$$

### 9.3 Source Authenticity ($F_3$)

Directly mapped from Phase 4 authenticity profiles:
$$F_3 = \text{avgSourceAuthenticityScore}$$

### 9.4 Provenance Completeness ($F_4$)

Mapped directly from Phase 5 graph validation:
$$F_4 = \text{provenanceCompletenessRatio} \times 100$$

### 9.5 Evidence Agreement ($F_5$)

Measures consensus across independent sources:
$$F_5 = \text{evidenceAgreementRatio} \times 100 \times \min\left(1.0, \frac{\text{supportingCount}}{3}\right)$$

### 9.6 Evidence Coverage ($F_6$)

Measures degree to which claims are fully answered:
$$F_6 = \text{evidenceCoverageRatio} \times 100$$

### 9.7 Contradiction Penalty Factor ($F_7$)

Measures contradiction weight before raw penalty application:
$$F_7 = \max\left(0, 100 - (\text{contradictingCount} \times 35)\right)$$

### 9.8 Retrieval Quality ($F_8$)

Evaluates retrieval pipeline metrics:
$$F_8 = (0.60 \times \text{avgRetrievalScore}) + (0.40 \times \text{domainDiversityScore} \times 100)$$

---

## 10. Weight Engine

The `WeightEngine` applies dynamic weights loaded from `config/weights.json`. Weights must sum to exactly $1.0$.

### 10.1 Default Weights Matrix (`config/weights.json`)

```json
{
  "version": "1.0.0",
  "weights": {
    "verificationStrength": 0.25,
    "evidenceStrength": 0.20,
    "sourceAuthenticity": 0.20,
    "provenanceCompleteness": 0.15,
    "evidenceAgreement": 0.10,
    "evidenceCoverage": 0.05,
    "retrievalQuality": 0.05
  }
}
```

### 10.2 Weighted Score Calculation Formula

$$\text{RawWeightedScore} = \sum_{k=1}^{7} (W_k \times F_k)$$

---

## 11. Penalty Engine

The `PenaltyEngine` evaluates explicit risk indicators and computes cumulative penalty deductions using values in `config/penalties.json`.

### 11.1 Default Penalty Rules (`config/penalties.json`)

```json
{
  "version": "1.0.0",
  "penalties": {
    "contradictingEvidence": {
      "baseDeductionPerItem": 15,
      "maxDeduction": 45
    },
    "duplicateSources": {
      "deduction": 10
    },
    "lowSourceDiversity": {
      "threshold": 1,
      "deduction": 15
    },
    "brokenProvenance": {
      "deduction": 25
    },
    "weakRetrieval": {
      "threshold": 50,
      "deduction": 12
    },
    "unknownSources": {
      "deductionPerUnknown": 10,
      "maxDeduction": 30
    },
    "missingEvidence": {
      "deduction": 35
    }
  }
}
```

### 11.2 Penalty Computation Logic

1. **Contradicting Evidence Penalty** ($P_1$):
   $$P_1 = \min(45, \text{contradictingCount} \times 15)$$
2. **Low Source Diversity Penalty** ($P_2$):
   If unique domains $\le 1$ and supporting count $> 1 \implies P_2 = 15$, else $0$.
3. **Broken Provenance Penalty** ($P_3$):
   If `provenanceCompletenessRatio` $< 0.75 \implies P_3 = 25$, else $0$.
4. **Weak Retrieval Penalty** ($P_4$):
   If `avgRetrievalScore` $< 50 \implies P_4 = 12$, else $0$.
5. **Unknown Sources Penalty** ($P_5$):
   $$P_5 = \min(30, \text{unknownDomainCount} \times 10)$$
6. **Total Deduction**:
   $$P_{\text{total}} = \sum_{i=1}^{N} P_i$$

---

## 12. Score Calculator & Level Mapping

### 12.1 Execution Pipeline

```text
Weighted Factors Sum (RawWeightedScore)
        │
        ▼
Subtract Total Penalties (RawWeightedScore - P_total)
        │
        ▼
Linear Normalization & Clamping [0, 100]
        │
        ▼
Final Confidence Score
        │
        ▼
Map to Categorical Level (config/levels.json)
```

### 12.2 Score Formula

$$\text{ConfidenceScore} = \text{clamp}\left( \text{RawWeightedScore} - P_{\text{total}}, 0, 100 \right)$$

### 12.3 Confidence Levels Mapping (`config/levels.json`)

```json
{
  "version": "1.0.0",
  "levels": [
    { "level": "VERY_HIGH", "min": 90, "max": 100 },
    { "level": "HIGH", "min": 75, "max": 89 },
    { "level": "MEDIUM", "min": 55, "max": 74 },
    { "level": "LOW", "min": 35, "max": 54 },
    { "level": "VERY_LOW", "min": 0, "max": 34 }
  ]
}
```

---

## 13. Explanation Builder

The `ExplanationBuilder` uses deterministic string templates without LLMs.

### 13.1 Template Rules

1. **Strengths**:
   - If `sourceAuthenticity` $\ge 85$: `"Supported by high-authority institutional sources (e.g., WHO, CDC, PubMed)."`
   - If `supportingCount` $\ge 5$: `"Supported by {{supportingCount}} independent evidence sources."`
   - If `provenanceCompleteness` $= 100$: `"Complete lineage graph with verified cryptographic provenance."`
   - If `evidenceAgreement` $\ge 90$: `"High degree of consensus among independent sources."`

2. **Penalties**:
   - If `contradictingCount` $> 0$: `"Confidence reduced by {{contradictingCount}} conflicting evidence source(s)."`
   - If `domainDiversityScore` $< 0.5$: `"Low source diversity; evidence relies heavily on a single domain."`
   - If `provenanceCompleteness` $< 75$: `"Incomplete provenance lineage detected."`
   - If `unknownDomainCount` $> 0$: `"Evidence includes unverified or unknown domains."`

3. **Reasons**:
   - High score ($\ge 75$): `"High confidence due to strong institutional source agreement and full provenance."`
   - Medium score ($55–74$): `"Moderate confidence due to partial evidence coverage or single-domain reliance."`
   - Low score ($< 55$): `"Low confidence due to conflicting evidence, weak retrieval scores, or unverified sources."`

---

## 14. Validation Strategy

1. **Division by Zero Protection**:
   - All ratio calculations explicitly check denominators: `totalCount > 0 ? value / totalCount : 0`.
2. **Missing Input Attributes**:
   - Fallback defaults provided for missing profiles (e.g., default authenticity $= 30$, default provenance ratio $= 0.25$).
3. **Config Validation**:
   - Sum of weights in `weights.json` validated to equal $1.0 \pm 0.0001$.
   - Ranges in `levels.json` verified to cover $[0, 100]$ continuously without gaps or overlaps.
4. **NaN and Infinity Protection**:
   - `Number.isNaN()` and `!Number.isFinite()` guards sanitize all factor scores.

---

## 15. Configuration Strategy

Config files are stored in `backend/src/modules/confidence/config/`.

- `weights.json`: Weight allocations per factor.
- `penalties.json`: Penalty thresholds and points.
- `levels.json`: Confidence level score boundaries.

All configs are read via `PolicyConfig` singleton and validated upon system startup.

---

## 16. Error Handling & Fault Tolerance

```typescript
try {
  return await computeClaimConfidence(claim, inputs);
} catch (error) {
  logger.error("Confidence computation fallback invoked", { claimId: claim.id, error: error.message });
  return createDegradedClaimConfidence(claim, error);
}
```

- If a claim fails during feature extraction or calculator execution, the engine logs a structured warning and returns a `VERY_LOW` confidence profile with score `0` and penalty tag `"ENGINE_COMPUTATION_DEGRADED"`.
- **Pipeline Continuity Guaranteed**: One broken claim never halts the processing of remaining claims in the batch.

---

## 17. Structured Logging Strategy

Logs are formatted in JSON and emitted via standard logger.

```json
{
  "timestamp": "2026-07-26T01:26:07.000Z",
  "stage": "Confidence Engine",
  "event": "CONFIDENCE_COMPUTED",
  "batchId": "batch_98124",
  "claimId": "claim_001",
  "score": 98,
  "level": "VERY_HIGH",
  "factors": {
    "verificationStrength": 100,
    "evidenceStrength": 95,
    "sourceAuthenticity": 98,
    "provenanceCompleteness": 100,
    "evidenceAgreement": 100,
    "evidenceCoverage": 90,
    "contradictionPenalty": 0,
    "retrievalQuality": 92
  },
  "executionTimeMs": 2
}
```

---

## 18. Sequence Diagram

```text
VerificationBatch  EvidenceBatch  EvidenceProfile  SourceAuthenticityBatch  EvidenceLineageBatch
        │                │              │                     │                      │
        └────────────────┴──────────────┼─────────────────────┴──────────────────────┘
                                        │
                                        ▼
                               Feature Extractor
                                        │
                                        ▼
                                Factor Calculator
                                        │
                                        ▼
                                  Weight Engine ◄──── config/weights.json
                                        │
                                        ▼
                                 Penalty Engine ◄──── config/penalties.json
                                        │
                                        ▼
                                Score Calculator ◄─── config/levels.json
                                        │
                                        ▼
                               Explanation Builder
                                        │
                                        ▼
                                 ConfidenceBatch
```

---

## 19. Future Extensibility & Policy Plugins

1. **Domain-Specific Confidence Rules**:
   - Medical policy (`medical_strict`): Increases weight of `sourceAuthenticity` to $0.35$ and requires peer-reviewed sources.
   - Legal policy (`legal_strict`): Requires $100\%$ provenance completeness or applies a $50$-point penalty.
2. **Policy Versioning**:
   - `weightVersion` and `penaltyVersion` embedded in every `ClaimConfidence` object for full historical auditing.
3. **A/B Testing**:
   - Dynamic loading of policy profiles per tenant or experiment flag (`policyProfile: "experimental_weights_v2"`).

---

## 20. Testing & Verification Strategy

### 20.1 Unit Tests
- Feature extraction functions for known batch inputs.
- Factor calculators against edge values ($0, 50, 100$).
- Weight normalization and clamping limits.
- Penalty deduction limits.
- Template string interpolation logic.

### 20.2 Integration Tests
- End-to-end processing of mock 5-claim batches.
- Handling missing lineage nodes and unknown source profiles.
- Validating output structure against `ConfidenceBatch` JSON schema.

### 20.3 Manual Determinism Verification Procedure
Run the engine 100 consecutive times on identical input fixture files:
```bash
node scripts/verify_confidence_determinism.js --fixture test/fixtures/sample_pipeline_output.json
```
Verify that `crypto.createHash('sha256').update(JSON.stringify(output)).digest('hex')` returns the exact same hash across all 100 runs.
