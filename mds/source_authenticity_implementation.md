# TruthForge-AI Phase 4 Architecture & Implementation Report

## Overview

This report details the implementation of **Phase 4 – Source Authenticity Evaluation Engine** for **TruthForge-AI**. 

Phase 4 is responsible for determining the authenticity, institutional authority, and baseline credibility of every unique source referenced by verified claims in the pipeline.

---

## 1. What Was Accomplished

We designed and built the complete, production-ready backend module in `backend/src/modules/authenticity/`.

### Architecture & Implementation Files Created

```text
backend/src/modules/authenticity/
├── contracts/
│   ├── authenticityFactors.contract.js         # JSDoc type contract for 12 factors
│   ├── sourceAuthenticityProfile.contract.js   # Profile type contract & enum types
│   └── sourceAuthenticityBatch.contract.js     # Batch output type contract
├── models/
│   ├── sourceAuthenticityProfile.model.js      # Domain entity model with serialization
│   └── sourceAuthenticityBatch.model.js        # Aggregate container domain entity model
├── config/
│   ├── weights.config.json                     # Externalized factor weighting factors
│   ├── thresholds.config.json                  # Score boundaries for AuthenticityLevels
│   └── authenticityConfig.js                   # Configuration loader class
├── registry/
│   ├── government.json                         # NIH, CDC, NASA, FDA, NIST...
│   ├── medical.json                            # WHO, EMA, Lancet, NEJM, BMJ...
│   ├── academic.json                           # PubMed, Harvard, MIT, Oxford, Stanford...
│   ├── scientific.json                         # Nature, IEEE, ACM, Science, arXiv...
│   ├── international.json                      # UN, UNICEF, World Bank, OECD...
│   ├── standards.json                          # ISO, W3C, IETF...
│   ├── news.json                               # BBC, Reuters, AP...
│   └── registryLoader.js                       # Authority JSON dataset merger & indexer
├── normalizers/
│   └── urlNormalizer.js                        # Protocol removal, www stripping, domain parser
├── resolvers/
│   └── sourceResolver.js                       # Deduplicates unique source URLs from batches
├── classifiers/
│   ├── tldClassifier.js                        # TLD tier classifier (.gov, .edu, .int...)
│   └── domainClassifier.js                     # Domain category router (15 categories)
├── rules/
│   ├── baseRule.js                             # Abstract base rule class
│   ├── registryMatchRule.js                    # Matches domain against Authority Registry
│   ├── tldTrustRule.js                         # Evaluates TLD trust tier score
│   ├── securityRule.js                         # Evaluates transport security (HTTPS = 100)
│   ├── publisherTypeRule.js                    # Evaluates publisher classification weight
│   ├── peerReviewRule.js                       # Evaluates peer-review status indicator
│   └── ruleRegistry.js                         # Container managing rule instances
├── scorers/
│   └── scoreCalculator.js                      # Aggregates rules & applies configured weights
├── validators/
│   ├── urlValidator.js                         # Validates URL syntax and protocol
│   └── registryValidator.js                    # Validates JSON registry schema integrity
├── cache/
│   ├── cacheProvider.js                        # Abstract cache interface
│   ├── inMemoryCache.js                        # Local LRU memory cache
│   └── redisCache.js                           # Redis adapter with memory fallback
├── services/
│   ├── authorityRegistry.service.js            # Service indexing authority entities
│   └── sourceAuthenticity.service.js           # Primary orchestrator entrypoint service
├── utils/
│   └── domainUtils.js                          # Helpers for domain extraction & SHA256 IDs
├── docs/
│   └── source_authenticity_architecture.md     # Production architectural specification
└── scripts/
    └── testAuthenticityEngine.js               # Verification execution script
```

---

## 2. Key Architecture Design Principles Achieved

1. **Strictly Deterministic (Zero LLM)**:
   - Evaluates sources using pure functions, regex matching, public suffix parsing, domain classification rules, authority registries, and weighted factor scoring.
   - 100% reproducible and byte-identical output profiles for identical inputs.

2. **Decoupled Pipeline Scope**:
   - Primary responsibility: Evaluate source credibility ("How trustworthy is this source?").
   - Explicitly does NOT verify claims, rewrite evidence, alter claim text, calculate confidence scores, or generate reports.

3. **12 Independent Authenticity Factors**:
   - `institutionRecognition` (0–100)
   - `topLevelDomainTrust` (0–100)
   - `securityProtocol` (0 or 100)
   - `authorityRegistryMatch` (0–100)
   - `publisherTypeWeight` (0–100)
   - `peerReviewedStatus` (0 or 100)
   - `isResearchRepository` (Boolean)
   - `isGovernmentOwned` (Boolean)
   - `isMedicalAuthority` (Boolean)
   - `isEducationalInstitution` (Boolean)
   - `isStandardsOrganization` (Boolean)
   - `isInternationalOrganization` (Boolean)

4. **Externalized Factor Weights & Level Thresholds**:
   - Formula: $\text{RawScore} = \sum (\text{FactorScore}_f \times \text{Weight}_f)$, normalized to $0–100$.
   - Scores map to 5 levels: `VERY_HIGH` (90–100), `HIGH` (75–89), `MEDIUM` (55–74), `LOW` (30–54), `UNKNOWN` (0–29).

5. **Two-Tier Resilient Caching**:
   - In-memory LRU map + Redis cache adapter.
   - Evaluates each unique domain once per query/batch; served from cache in 0ms on subsequent requests.

6. **Fault Tolerance & Resilience**:
   - Malformed URLs or unknown TLDs fall back gracefully to `UNKNOWN` level (Score 0–12) without throwing uncaught exceptions or interrupting pipeline execution.

---

## 3. Empirical Verification Summary

The module was tested using `node src/scripts/testAuthenticityEngine.js`:

| Source Domain | Source Type | Authenticity Score | Authenticity Level | HTTPS | Registry Match |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `nih.gov` | `Government` | **100** | `VERY_HIGH` | YES | YES |
| `nature.com` | `Academic Journal` | **91** | `VERY_HIGH` | YES | YES |
| `cdc.gov` | `Government` | **90** | `VERY_HIGH` | YES | YES |
| `who.int` | `International Organization` | **89** | `HIGH` | YES | YES |
| `some-random-untrusted-blog.com` | `Commercial` | **10** | `UNKNOWN` | NO | NO |
| `htps://malformed-url...` | `Unknown` | **12** | `UNKNOWN` | YES | NO (Handled gracefully) |

### Performance Metrics
- **First Evaluation Run (Cache Miss)**: Evaluated 6 unique sources in **7ms**.
- **Second Evaluation Run (Cache Hit)**: Evaluated 6 unique sources in **0ms** (**100% Cache Hit Ratio**).
