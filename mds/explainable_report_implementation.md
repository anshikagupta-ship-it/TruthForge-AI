# Phase 7 – Explainable Report Generation Engine Implementation Details

## Directory Layout

All implementation components reside under `backend/src/modules/report/`:

```text
backend/src/modules/report/
├── config/
│   ├── sections.json
│   ├── templates.json
│   ├── formats.json
│   └── rules.json
├── contracts/
│   ├── reportInput.contract.js
│   ├── canonicalReport.contract.js
│   └── reportPackage.contract.js
├── models/
│   ├── TruthForgeReport.js
│   ├── ExecutiveSummary.js
│   ├── ClaimReport.js
│   ├── ReportSection.js
│   └── ReportMetadata.js
├── aggregators/
│   ├── ReportAggregator.js
│   ├── ClaimEvidenceJoiner.js
│   └── MetricsAggregator.js
├── builders/
│   ├── SectionBuilderFactory.js
│   ├── ExecutiveSummaryBuilder.js
│   ├── QueryContextBuilder.js
│   ├── OverallVerdictBuilder.js
│   ├── ClaimVerificationBuilder.js
│   ├── ConfidenceAnalysisBuilder.js
│   ├── EvidenceSummaryBuilder.js
│   ├── SourceAuthenticityBuilder.js
│   ├── ProvenanceSummaryBuilder.js
│   ├── LimitationsBuilder.js
│   └── AppendixBuilder.js
├── templates/
│   ├── TemplateRegistry.js
│   └── TemplateInterpolator.js
├── formatters/
│   ├── FormatterFactory.js
│   ├── JSONFormatter.js
│   ├── MarkdownFormatter.js
│   ├── HTMLFormatter.js
│   ├── PDFFormatter.js
│   └── TextFormatter.js
├── renderers/
│   ├── RendererFactory.js
│   ├── JSONRenderer.js
│   ├── MarkdownRenderer.js
│   ├── HTMLRenderer.js
│   ├── PDFRenderer.js
│   └── TextRenderer.js
├── validators/
│   ├── ReportValidator.js
│   ├── SectionIntegrityValidator.js
│   ├── ReferenceValidator.js
│   └── MetadataValidator.js
├── exporters/
│   ├── ExportManager.js
│   └── ZipExporter.js
├── ai/
│   └── AiEnhancementAdapter.js
├── utils/
│   ├── deterministicHasher.js
│   └── formattingHelpers.js
└── services/
    └── reportGenerator.service.js
```

## Testing & Verification

Run automated test suite:
```bash
node backend/src/scripts/testReportEngine.js
```

### Verification Criteria Passed:
- **10/10 Sections Verified**: Executive Summary through Appendix created deterministically.
- **100/100 Runs Byte-Identical**: 100 consecutive executions on identical mock inputs produced SHA-256 matched outputs.
- **Zero-LLM Presentation**: Operating strictly via template parameters (`{{supportingCount}}`, `{{avgAuthenticity}}`).
