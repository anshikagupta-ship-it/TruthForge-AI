# Phase 6 – Explainable Confidence Engine Overview

## Executive Summary

Phase 6 – **Explainable Confidence Engine** has been successfully architected and implemented for **TruthForge-AI**.

The engine computes a deterministic, explainable, and auditable confidence score for every verified claim using outputs from previous pipeline phases.

## Primary Responsibility

> **Compute a deterministic, explainable confidence score for every verified claim using outputs from previous phases.**

The confidence score answers:
> *"How much confidence should we place in this verified claim based on the available evidence and provenance?"*

(NOT *"How true is this claim?"* - truthfulness was established in Phase 3).

## Key Characteristics

- **100% Deterministic & Non-Probabilistic**: No LLM reasoning or random values. Identical inputs yield identical outputs.
- **Dynamic Policy Configuration**: Configurable weights (`weights.json`), penalties (`penalties.json`), and levels (`levels.json`).
- **Template-Based NLG Explanations**: Generates human-readable strengths, penalties, and summary reasons without AI text generation.
- **Fail-Safe Pipeline Continuity**: Degraded mode handling ensures one faulty claim never crashes the full pipeline.

## Implementation Deliverables

- Architectural Spec: `backend/src/modules/confidence/docs/explainable_confidence_architecture.md`
- Implementation Spec: `mds/explainable_confidence_implementation.md`
- Codebase Location: `backend/src/modules/confidence/`
- Test Suite: `backend/src/modules/confidence/test/confidenceEngine.test.js`
