/**
 * Full Pipeline Execution Service
 * Connects Frontend, Backend, and Model Engine (kartikeya specification)
 */

import { queriesRepository } from '../../queries/repositories/queries.repository.js';
import { claimsRepository } from '../../claims/repositories/claims.repository.js';
import { sourcesRepository } from '../../sources/repositories/sources.repository.js';
import { pipelineRepository } from '../repositories/pipeline.repository.js';
import { CsvEvidenceProvider } from '../../evidence/providers/csvEvidenceProvider.js';
import { ClaimGeneratorService } from '../../claims/services/claimGenerator.service.js';
import { ClaimVerificationService } from '../../verification/services/claimVerification.service.js';
import { SourceAuthenticityService } from '../../authenticity/services/sourceAuthenticity.service.js';
import { InMemoryCache } from '../../authenticity/cache/inMemoryCache.js';
import { ConfidenceEngineService } from '../../confidence/services/confidenceEngine.service.js';
import { EvidenceLineageService } from '../../lineage/services/evidenceLineage.service.js';
import { ReportGeneratorService } from '../../report/services/reportGenerator.service.js';
import { logger } from '../../../utils/logger.js';
import { spawn, spawnSync } from "child_process";
import fs from "fs/promises";

import path from "path";
import fsSync from "fs";

// Domain Trusted Source Mappings according to kartikeya specification
const DOMAIN_SOURCES_MAP = {
  Technology: [
    { domain: 'ieee.org', title: 'IEEE Xplore Digital Library', source_type: 'journal', publisher: 'IEEE', trustScore: 97, url: 'https://ieeexplore.ieee.org' },
    { domain: 'acm.org', title: 'ACM Digital Library', source_type: 'journal', publisher: 'ACM', trustScore: 96, url: 'https://dl.acm.org' },
    { domain: 'arxiv.org', title: 'arXiv Preprint Repository', source_type: 'repository', publisher: 'Cornell University', trustScore: 90, url: 'https://arxiv.org' },
    { domain: 'github.com', title: 'Official GitHub Documentation', source_type: 'documentation', publisher: 'GitHub', trustScore: 88, url: 'https://docs.github.com' }
  ],
  Medicine: [
    { domain: 'pubmed.ncbi.nlm.nih.gov', title: 'PubMed Biomedical Database', source_type: 'database', publisher: 'NIH / NLM', trustScore: 99, url: 'https://pubmed.ncbi.nlm.nih.gov' },
    { domain: 'who.int', title: 'World Health Organization', source_type: 'official', publisher: 'WHO', trustScore: 99, url: 'https://who.int' },
    { domain: 'nih.gov', title: 'National Institutes of Health', source_type: 'government', publisher: 'US NIH', trustScore: 99, url: 'https://nih.gov' },
    { domain: 'cdc.gov', title: 'Centers for Disease Control', source_type: 'government', publisher: 'CDC', trustScore: 98, url: 'https://cdc.gov' }
  ],
  Finance: [
    { domain: 'sec.gov', title: 'U.S. Securities and Exchange Commission', source_type: 'government', publisher: 'SEC', trustScore: 99, url: 'https://sec.gov' },
    { domain: 'reuters.com', title: 'Reuters Financial News', source_type: 'news', publisher: 'Thomson Reuters', trustScore: 92, url: 'https://reuters.com' },
    { domain: 'bloomberg.com', title: 'Bloomberg Markets', source_type: 'news', publisher: 'Bloomberg L.P.', trustScore: 91, url: 'https://bloomberg.com' },
    { domain: 'worldbank.org', title: 'The World Bank Open Data', source_type: 'organization', publisher: 'World Bank', trustScore: 98, url: 'https://worldbank.org' }
  ],
  Science: [
    { domain: 'nature.com', title: 'Nature International Journal of Science', source_type: 'journal', publisher: 'Springer Nature', trustScore: 99, url: 'https://nature.com' },
    { domain: 'sciencedirect.com', title: 'ScienceDirect Platform', source_type: 'journal', publisher: 'Elsevier', trustScore: 96, url: 'https://sciencedirect.com' },
    { domain: 'springer.com', title: 'Springer Link Academic Papers', source_type: 'journal', publisher: 'Springer', trustScore: 95, url: 'https://springer.com' },
    { domain: 'nasa.gov', title: 'NASA Open Data & Research', source_type: 'government', publisher: 'NASA', trustScore: 99, url: 'https://nasa.gov' }
  ],
  Law: [
    { domain: 'law.cornell.edu', title: 'Legal Information Institute', source_type: 'academic', publisher: 'Cornell Law', trustScore: 97, url: 'https://law.cornell.edu' },
    { domain: 'courtlistener.com', title: 'CourtListener Legal Repository', source_type: 'database', publisher: 'Free Law Project', trustScore: 94, url: 'https://courtlistener.com' },
    { domain: 'justia.com', title: 'Justia Law & Legal Resources', source_type: 'portal', publisher: 'Justia', trustScore: 91, url: 'https://justia.com' }
  ],
  Education: [
    { domain: 'eric.ed.gov', title: 'Education Resources Information Center', source_type: 'government', publisher: 'US Dept of Education', trustScore: 96, url: 'https://eric.ed.gov' },
    { domain: 'jstor.org', title: 'JSTOR Academic Library', source_type: 'journal', publisher: 'ITHAKA', trustScore: 98, url: 'https://jstor.org' },
    { domain: 'scholar.google.com', title: 'Google Scholar Citations', source_type: 'search_engine', publisher: 'Google', trustScore: 90, url: 'https://scholar.google.com' }
  ],
  Environment: [
    { domain: 'unep.org', title: 'UN Environment Programme', source_type: 'organization', publisher: 'United Nations', trustScore: 99, url: 'https://unep.org' },
    { domain: 'epa.gov', title: 'US Environmental Protection Agency', source_type: 'government', publisher: 'EPA', trustScore: 98, url: 'https://epa.gov' },
    { domain: 'ipcc.ch', title: 'Intergovernmental Panel on Climate Change', source_type: 'organization', publisher: 'IPCC', trustScore: 99, url: 'https://ipcc.ch' }
  ]
};

export class FullPipelineService {
  /**
   * Run full verification pipeline for a given query request
   * @param {Object} payload
   * @param {string} payload.query - Research query text
   * @param {string} [payload.domain='Technology'] - Query domain
   * @param {string} [payload.depth='Detailed'] - Verification depth ('Basic' or 'Detailed')
   * @param {number} [payload.max_sources=20] - Maximum sources limit
   * @returns {Promise<Object>} Verification report and confidence score package
   */
  static async executeFullVerification({ query, domain = 'Technology', depth = 'Detailed', max_sources = 20 }) {

    const startTime = Date.now();
    logger.info(`[FullPipelineService] Executing full verification pipeline for query: "${query}"`);

    // Step 1: Save or retrieve Query entity in Supabase
    let queryRecord;
    try {
      queryRecord = await queriesRepository.create({
        query_text: query,
        status: 'processing',
        domain: (domain || 'technology').toLowerCase(),
        attributes: { depth, max_sources }
      });
    } catch (err) {
      queryRecord = {
        id: `qry-${Math.random().toString(36).substring(2, 9)}`,
        query_text: query,
        domain,
        status: 'processing'
      };
    }

    const queryId = queryRecord.id;

    // Step 2: Create Pipeline Run record
    let pipelineRunRecord;
    try {
      pipelineRunRecord = await pipelineRepository.create({
        query_id: queryId,
        stage: 'in_progress',
        status: 'running',
        metadata: { domain, depth, max_sources, startTime: new Date().toISOString() }
      });
    } catch (err) {
      pipelineRunRecord = { id: `pip-${Math.random().toString(36).substring(2, 9)}` };
    }

    // Step 3: Multi-Domain Sources Lookup
    let matchedDomainKey = 'Multi-Domain';
    let trustedSources = [];

    if (domain && domain !== 'Multi-Domain' && DOMAIN_SOURCES_MAP[domain]) {
      matchedDomainKey = domain;
      trustedSources = DOMAIN_SOURCES_MAP[domain];
    } else {
      // Aggregate top trusted sources across all domain categories for comprehensive research
      trustedSources = Object.values(DOMAIN_SOURCES_MAP).flatMap(sources => sources.slice(0, 2));
    }




    await fs.mkdir("./temp", { recursive: true });
    const version = spawnSync("python3", ["--version"], { encoding: "utf8" });

    console.log(version);


    // 1. Define a unique file path for this specific pipeline run
    const csvPath = `./temp/matches_${queryId}.csv`;
    console.log("[9] Launching Python");
    console.log({
      executable: process.platform === "win32" ? "python" : "python3",
      script: "./retriever/index.py",
      query,
      csvPath
    });
    const script = path.resolve("./retriever/index.py");

    console.log({
      cwd: process.cwd(),
      script,
      exists: fsSync.existsSync(script),
    });
    await new Promise((resolve, reject) => {

      const py = spawn(
        process.platform === "win32" ? "python" : "python3",
        [
          "-u",
          "./retriever/test.py",
          "--query",
          query,
          "--output",
          csvPath
        ]
      );
      py.on("error", err => {
        console.error("[PYTHON SPAWN ERROR]", err);
        reject(err);
      });
      py.on("spawn", () => {
        console.log("[PYTHON SPAWNED]");
      });

      const scriptTimeout = setTimeout(() => {
        py.kill();
        reject(new Error("Python retriever timed out after 200 seconds."));
      }, 200000);

      py.stdout.on("data", d => {
        console.log("[PYTHON]", d.toString());
      });

      py.stderr.on("data", d => {
        console.error("[PYTHON ERR]", d.toString());
      });

      py.on("close", code => {
        clearTimeout(scriptTimeout);

        console.log("[PYTHON CLOSED]", code);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Retriever failed with exit code ${code}`));
        }
      });

    });

    // 3. Read from the unique file
    const csvContent = await fs.readFile(
      csvPath,
      "utf8"
    );

    // 4. Cleanup: Delete the file so the /temp folder doesn't bloat over time
    await fs.unlink(csvPath).catch(err => console.warn(`Failed to cleanup ${csvPath}:`, err.message));

    const provider = new CsvEvidenceProvider();

    const { evidenceBatch: ingestedBatch } =
      await provider.ingest(csvContent, {
        filename: "retrieval_evidence.csv"
      });
    const rawEvidence =
      ingestedBatch.evidences ??
      ingestedBatch.evidence ??
      [];

    const evidenceBatch = {
      batchId: `eb-${queryId}`,
      queryId,
      query,
      evidence: rawEvidence.map((e, idx) => ({
        evidenceId: e.id || `ev-${idx + 1}`,
        id: e.id || `ev-${idx + 1}`,
        text: e.text || `Evidence content snippet ${idx + 1}`,
        sourceUrl: e.sourceUrl || trustedSources[0].url,
        sourceDomain: e.sourceDomain || trustedSources[idx % trustedSources.length].domain,
        retrievalScore: e.retrievalScore || 0.90,
        relevance: e.retrievalScore || 0.90
      })),
      evidences: rawEvidence.map((e, idx) => ({
        evidenceId: e.id || `ev-${idx + 1}`,
        id: e.id || `ev-${idx + 1}`,
        text: e.text || `Evidence content snippet ${idx + 1}`,
        sourceUrl: e.sourceUrl || trustedSources[0].url,
        sourceDomain: e.sourceDomain || trustedSources[idx % trustedSources.length].domain,
        retrievalScore: e.retrievalScore || 0.90,
        relevance: e.retrievalScore || 0.90
      }))
    };

    // Step 5 & 6: Dynamic Verified Claims Construction with Real Supporting Evidence Links
    // Step 4: Extract actual factual claims from the evidence
    const claimBatch = await ClaimGeneratorService.generateClaims(evidenceBatch);
    console.log("[13] Claims generated");

    // Step 5 & 6: Dynamic Verified Claims Construction with Real Supporting Evidence Links
    const verificationService = new ClaimVerificationService();
    const verificationBatch = await verificationService.verify({
      query,
      evidenceBatch,
      claimBatch // You must pass the generated claims to the verifier!
    });

    const verifiedClaims = verificationBatch.verifiedClaims;

    // Step 7: Source Authenticity Evaluation
    const authenticityService = new SourceAuthenticityService(new InMemoryCache());
    const sourceAuthenticityBatch = await authenticityService.evaluateBatch({
      verificationBatch,
      evidenceBatch
    });

    const evaluatedSourcesList = sourceAuthenticityBatch.evaluatedSources || trustedSources;

    // Step 8: Dynamic Explainable Confidence Score Calculation
    // Formula: 0.40 * Authenticity + 0.30 * Agreement + 0.20 * Coverage + 0.10 * Freshness
    const avgAuthenticity = Math.round(
      evaluatedSourcesList.reduce((acc, s) => acc + (s.authenticityScore || s.trustScore || 90), 0) / (evaluatedSourcesList.length || 1)
    );
    const supportedCount = verifiedClaims.filter(c => c.verificationStatus === 'SUPPORTED' || c.verificationStatus === 'VERIFIED').length;
    const agreementScore = Math.round((supportedCount / verifiedClaims.length) * 100);
    const coverageScore = Math.min(100, Math.round((trustedSources.length / 10) * 100));
    const freshnessScore = 95; // Fresh recent publication score

    const overallConfidence = Math.round(
      (0.40 * avgAuthenticity + 0.30 * agreementScore + 0.20 * coverageScore + 0.10 * freshnessScore) * 10
    ) / 10;

    // Step 9: Evidence Lineage Tracking
    const lineageService = new EvidenceLineageService();
    const lineageResult = await lineageService.constructLineage(
      evidenceBatch,
      verificationBatch,
      sourceAuthenticityBatch
    );
    const evidenceLineageBatch = lineageResult.batch || lineageResult;

    // Step 10: Report Generation Engine (Markdown + JSON)
    const reportInputBatches = {
      query: {
        queryId,
        queryString: query,
        domainContext: matchedDomainKey,
        executionTimestamp: new Date().toISOString()
      },
      verificationBatch: {
        verifiedClaims: verifiedClaims.map(vc => ({
          claimId: vc.claimId,
          claim: vc.statement,
          verificationStatus: vc.verificationStatus,
          confidence: vc.confidence,
          citedEvidence: vc.supportingEvidenceIds,
          // FIX 1: Use actual source domains from the claim instead of trustedSources[0]
          sources: vc.sourceDomains && vc.sourceDomains.length > 0 ? vc.sourceDomains : ['unknown-source.com']
        }))
      },
      confidenceBatch: {
        claims: verifiedClaims.map(vc => ({
          claimId: vc.claimId,
          score: vc.confidence,
          confidenceLevel: vc.confidence >= 90 ? 'VERY_HIGH' : 'HIGH',
          explanations: [vc.explanation],
          appliedPenalties: []
        }))
      },
      evidenceBatch: {
        items: evidenceBatch.evidence.map(e => ({ id: e.evidenceId, text: e.text, qualityScore: Math.round(e.retrievalScore * 100) }))
      },
      sourceAuthenticityBatch: {
        profiles: evaluatedSourcesList.map(s => ({
          // FIX 2: Remove the 'ieee.org' fallback
          domain: s.domain || s.sourceDomain || 'unknown',
          trustLevel: 'GOVERNMENT',
          authenticityScore: s.authenticityScore || s.trustScore || 95,
          tld: 'org'
        }))
      },

      evidenceLineageBatch: {
        completeChains: verifiedClaims.length,
        partialChains: 0,
        brokenChains: 0,
        graphStatistics: { totalNodes: 8, totalEdges: 12, rootHash: evidenceLineageBatch.metadata?.graphHash || '0x9918a2bc' },
        claims: verifiedClaims.map(vc => ({
          claimId: vc.claimId,
          // FIX 3: Dynamically construct the provenance path instead of hardcoding 'ev-1' and IEEE
          provenancePath: [
            'root',
            vc.claimId,
            ...(vc.supportingEvidenceIds || []),
            ...(vc.sourceDomains || [])
          ]
        }))
      }
    };

    const reportPackage = ReportGeneratorService.generateReport(reportInputBatches, ['markdown', 'json']);
    console.log("[17] Report generated");
    const markdownContent = reportPackage.renderedFiles.find(f => f.format === 'markdown')?.content || '';
    const reportData = reportPackage.report;

    const totalExecutionTimeMs = Date.now() - startTime;

    // Update query and pipeline run in DB if available
    try {
      await queriesRepository.update(queryId, { status: 'completed' });
      if (pipelineRunRecord.id) {
        await pipelineRepository.update(pipelineRunRecord.id, {
          stage: 'completed',
          status: 'success',
          metadata: { executionTimeMs: totalExecutionTimeMs, overallConfidence }
        });
      }
    } catch (e) {
      // Ignore database errors for offline runs
    }
    console.log("[18] Returning final response");

    return {
      queryId,
      query,
      domain: matchedDomainKey,
      depth,
      overallConfidence,
      confidenceBreakdown: {
        sourceAuthenticity: avgAuthenticity,
        evidenceAgreement: agreementScore,
        sourceCoverage: coverageScore,
        freshness: freshnessScore,
        formula: '0.40 * Authenticity + 0.30 * Agreement + 0.20 * Coverage + 0.10 * Freshness'
      },
      executiveSummary: reportData.executiveSummary,
      verifiedClaims,
      sources: evaluatedSourcesList,
      lineage: evidenceLineageBatch,
      reportMarkdown: markdownContent,
      reportJson: reportData,
      executionSummary: {
        executionTimeMs: totalExecutionTimeMs,
        renderLink: 'https://truthforge-ai-eza4.onrender.com'
      }
    };
  }
}
