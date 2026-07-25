# TruthForge-AI Phase 4 Architecture Summary: Source Authenticity Evaluation Engine

## Executive Overview

This summary details the architecture designed for **Phase 4 – Source Authenticity Evaluation Engine** of **TruthForge-AI**. 

Phase 4 receives verified claim records from **Phase 3 (Claim Verification)** and evaluates the intrinsic authority, credibility, institutional backing, and security posture of every unique source domain referenced in the evidence pipeline.

---

## What Was Accomplished

1. **Complete Architectural Specification**:
   Created production-grade architectural documents at:
   - [source_authenticity_architecture.md](file:///c:/TruthForge-AI/mds/source_authenticity_architecture.md)
   - [source_authenticity_architecture.md](file:///c:/TruthForge-AI/backend/src/modules/authenticity/docs/source_authenticity_architecture.md)

2. **Core Responsibility & Boundaries Defined**:
   - **Sole Purpose**: Evaluate source domain trust ("How trustworthy is this source?").
   - **Strict Non-Responsibilities**: The engine does NOT verify claims, rewrite evidence, modify claim statements, calculate claim confidence scores, or generate human-readable reports.

3. **Pure Deterministic Design (Zero LLM)**:
   - Evaluates sources using pure functions, regex matching, public suffix parsing, domain classification rules, authority registries, and weighted factor scoring.
   - Identical inputs (`EvidenceBatch` + `VerificationBatch`) guarantee 100% byte-identical, reproducible outputs (`SourceAuthenticityBatch`).

4. **12 Independent Authenticity Factors**:
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

5. **Externalized Authority Registries**:
   - Modular JSON database files for WHO, NIH, CDC, NASA, NIST, PubMed, Nature, IEEE, ACM, UN, UNICEF, World Bank, FDA, EMA, etc.
   - Dynamic hot-reloading with fallback on registry file corruption.

6. **Deterministic Scoring & Threshold Mapping**:
   - Formula: $\text{RawScore} = \sum (\text{FactorScore}_f \times \text{Weight}_f)$ normalized to $0–100$.
   - Mapped to 5 levels:
     - `90–100`: `VERY_HIGH`
     - `75–89`: `HIGH`
     - `55–74`: `MEDIUM`
     - `30–54`: `LOW`
     - `0–29`: `UNKNOWN`

7. **Resilient Two-Tier Caching**:
   - In-memory LRU map for sub-millisecond evaluation latency.
   - Redis cache adapter for distributed node scaling.

8. **Sequence Diagram & Extensibility**:
   - Included full sequence flow diagrams (Mermaid & ASCII).
   - Designed extension points for country-specific registries, org-specific custom rule sets, offline registry sync scripts, and optional ML-assisted scoring plugins.

9. **Comprehensive Testing Strategy**:
   - Unit test suites for normalizers, classifiers, scorers, and rules.
   - Integration test suites for full batch processing and cache hit/miss behavior.
   - Manual verification protocol against 40 curated domain test sets.
