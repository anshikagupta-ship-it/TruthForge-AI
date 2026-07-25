import { logger } from '../../../utils/logger.js';

/**
 * Calculates statistical metrics (min, max, median, standard deviation) for an array of numbers.
 * @param {number[]} values
 * @returns {{ minimum: number, maximum: number, median: number, standardDeviation: number }}
 */
function calculateScoreStatistics(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      minimum: 0,
      maximum: 0,
      median: 0,
      standardDeviation: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const minimum = sorted[0];
  const maximum = sorted[count - 1];

  let median = 0;
  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    median = sorted[mid];
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / count;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);

  return {
    minimum: Number(minimum.toFixed(4)),
    maximum: Number(maximum.toFixed(4)),
    median: Number(median.toFixed(4)),
    standardDeviation: Number(standardDeviation.toFixed(4)),
  };
}

/**
 * Service for profiling EvidenceBatch metrics, distributions, statistics, and anomalies.
 * Exposes descriptive, non-judicial health metrics without a composite quality score.
 */
export class EvidenceProfilingEngine {
  /**
   * Profiles an ingested EvidenceBatch and produces an EvidenceProfile.
   *
   * @param {Object} evidenceBatch - Normalized evidence batch returned by EvidenceProvider
   * @returns {{ healthMetrics: Object, distributions: Object, topDomains: Array, warnings: string[] }}
   */
  profile(evidenceBatch) {
    const startTime = Date.now();
    const {
      totalRows = 0,
      validRows = 0,
      duplicateRows = 0,
      skippedRows = 0,
      evidences = [],
    } = evidenceBatch || {};

    const warnings = [];
    const sourceSet = new Set();
    const domainMap = new Map();

    const semanticScores = [];
    const retrievalScores = [];

    const semanticScoreDistribution = {
      '0.00-0.25': 0,
      '0.25-0.50': 0,
      '0.50-0.75': 0,
      '0.75-1.00': 0,
    };

    const retrievalScoreDistribution = {
      '0.00-0.25': 0,
      '0.25-0.50': 0,
      '0.50-0.75': 0,
      '0.75-1.00': 0,
    };

    evidences.forEach((item) => {
      if (item.sourceUrl) {
        sourceSet.add(item.sourceUrl);
      }

      if (item.sourceDomain) {
        domainMap.set(item.sourceDomain, (domainMap.get(item.sourceDomain) || 0) + 1);
      }

      const semScore = Number(item.semanticScore) || 0;
      const retScore = Number(item.retrievalScore) || 0;

      semanticScores.push(semScore);
      retrievalScores.push(retScore);

      // Semantic Score Histogram Bins
      if (semScore >= 0 && semScore < 0.25) {
        semanticScoreDistribution['0.00-0.25']++;
      } else if (semScore >= 0.25 && semScore < 0.5) {
        semanticScoreDistribution['0.25-0.50']++;
      } else if (semScore >= 0.5 && semScore < 0.75) {
        semanticScoreDistribution['0.50-0.75']++;
      } else {
        semanticScoreDistribution['0.75-1.00']++;
      }

      // Retrieval Score Histogram Bins
      if (retScore >= 0 && retScore < 0.25) {
        retrievalScoreDistribution['0.00-0.25']++;
      } else if (retScore >= 0.25 && retScore < 0.5) {
        retrievalScoreDistribution['0.25-0.50']++;
      } else if (retScore >= 0.5 && retScore < 0.75) {
        retrievalScoreDistribution['0.50-0.75']++;
      } else {
        retrievalScoreDistribution['0.75-1.00']++;
      }
    });

    const uniqueDomainCount = domainMap.size;

    // Independent Health Metrics
    const validityRatio = totalRows > 0 ? Number((validRows / totalRows).toFixed(4)) : 0;
    const duplicateRatio = totalRows > 0 ? Number((duplicateRows / totalRows).toFixed(4)) : 0;

    const semanticStatsRaw = calculateScoreStatistics(semanticScores);
    const retrievalStatsRaw = calculateScoreStatistics(retrievalScores);

    const semanticStrength = semanticScores.length > 0
      ? Number((semanticScores.reduce((a, b) => a + b, 0) / semanticScores.length).toFixed(4))
      : 0;

    const retrievalStrength = retrievalScores.length > 0
      ? Number((retrievalScores.reduce((a, b) => a + b, 0) / retrievalScores.length).toFixed(4))
      : 0;

    const domainDiversity = validRows > 0 ? Number((uniqueDomainCount / validRows).toFixed(4)) : 0;

    const healthMetrics = {
      validityRatio,
      duplicateRatio,
      semanticStrength,
      retrievalStrength,
      domainDiversity,
    };

    const semanticStats = {
      minimumSemanticScore: semanticStatsRaw.minimum,
      maximumSemanticScore: semanticStatsRaw.maximum,
      medianSemanticScore: semanticStatsRaw.median,
      semanticScoreStandardDeviation: semanticStatsRaw.standardDeviation,
    };

    const retrievalStats = {
      minimumRetrievalScore: retrievalStatsRaw.minimum,
      maximumRetrievalScore: retrievalStatsRaw.maximum,
      medianRetrievalScore: retrievalStatsRaw.median,
      retrievalScoreStandardDeviation: retrievalStatsRaw.standardDeviation,
    };

    const topDomains = Array.from(domainMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Diagnostics & Warnings
    if (totalRows === 0) {
      warnings.push('Batch is completely empty (0 total rows processed)');
    } else if (validRows === 0) {
      warnings.push('No valid evidence rows parsed from the CSV batch');
    }

    if (totalRows > 0 && validityRatio < 0.7) {
      const validPct = (validityRatio * 100).toFixed(1);
      warnings.push(`Low batch validity ratio: only ${validPct}% of rows were valid`);
    }

    if (totalRows > 0 && duplicateRatio > 0.15) {
      const dupPct = (duplicateRatio * 100).toFixed(1);
      warnings.push(`High duplicate ratio: ${dupPct}% of rows were duplicate records`);
    }

    if (validRows >= 5 && semanticStrength < 0.4) {
      warnings.push(`Low semantic strength across batch: ${semanticStrength}`);
    }

    if (validRows >= 10 && domainDiversity < 0.1) {
      warnings.push(`Low domain diversity ratio: ${domainDiversity}`);
    }

    const executionTimeMs = Date.now() - startTime;

    logger.info('[Evidence Profiling Engine] Batch profiling completed', {
      stage: 'Evidence Profiling Engine',
      event: 'PROFILING_COMPLETED',
      validRows,
      totalRows,
      executionTimeMs,
      warningsCount: warnings.length,
    });

    return {
      healthMetrics,
      distributions: {
        semanticScoreDistribution,
        retrievalScoreDistribution,
        semanticStats,
        retrievalStats,
      },
      topDomains,
      warnings,
    };
  }
}
