/**
 * Source Authenticity Service
 * Main entrypoint and orchestrator service for Phase 4 – Source Authenticity Evaluation Engine.
 */

import { SourceResolver } from '../resolvers/sourceResolver.js';
import { UrlNormalizer } from '../normalizers/urlNormalizer.js';
import { DomainClassifier } from '../classifiers/domainClassifier.js';
import { authorityRegistryService } from './authorityRegistry.service.js';
import { ScoreCalculator } from '../scorers/scoreCalculator.js';
import { InMemoryCache } from '../cache/inMemoryCache.js';
import { RedisCache } from '../cache/redisCache.js';
import { SourceAuthenticityProfileModel } from '../models/sourceAuthenticityProfile.model.js';
import { SourceAuthenticityBatchModel } from '../models/sourceAuthenticityBatch.model.js';
import { AuthenticityConfig } from '../config/authenticityConfig.js';
import { logger } from '../../../utils/logger.js';

export class SourceAuthenticityService {
  /**
   * Initialize cache provider (defaults to RedisCache with InMemory fallback)
   * @param {import('../cache/cacheProvider.js').CacheProvider} [cacheProvider]
   */
  constructor(cacheProvider = null) {
    this.cache = cacheProvider || new RedisCache();
  }

  /**
   * Main Entrypoint: Evaluates authenticity of all unique sources in input batches
   * @param {Object} params
   * @param {Object} [params.verificationBatch] - VerificationBatch payload from Phase 3
   * @param {Object} [params.evidenceBatch] - EvidenceBatch payload from Phase 1
   * @param {string} [params.query] - User query string
   * @param {Object} [options]
   * @param {boolean} [options.bypassCache=false] - Force re-evaluation bypassing cache
   * @returns {Promise<import('../contracts/sourceAuthenticityBatch.contract.js').SourceAuthenticityBatch>}
   */
  async evaluateBatch({ verificationBatch = null, evidenceBatch = null, query = '' }, options = {}) {
    const startTime = Date.now();
    const batchQuery = query || verificationBatch?.query || evidenceBatch?.query || '';
    const bypassCache = options.bypassCache || false;

    logger.info(`[SourceAuthenticityService] Starting source evaluation for query: '${batchQuery}'`);

    // 1. Extract and deduplicate unique sources
    const { uniqueSources } = SourceResolver.extractUniqueSources({
      verificationBatch,
      evidenceBatch,
    });

    if (uniqueSources.length === 0) {
      logger.info('[SourceAuthenticityService] Zero unique sources found. Returning empty SourceAuthenticityBatch.');
      return new SourceAuthenticityBatchModel({
        query: batchQuery,
        totalSources: 0,
        evaluatedSources: [],
        executionSummary: {
          totalExecutionTimeMs: Date.now() - startTime,
          cacheHitRatio: 0.0,
          failedEvaluations: 0,
        },
      }).toJSON();
    }

    const evaluatedSources = [];
    let cacheHits = 0;
    let failedEvaluations = 0;

    // 2. Evaluate each unique source in parallel using Promise.all
    const evalPromises = uniqueSources.map(async (source) => {
      const itemStart = Date.now();
      const cacheKey = source.domain || source.normalizedUrl || source.rawUrl;

      // Check Cache unless bypassed
      if (!bypassCache) {
        try {
          const cachedProfile = await this.cache.get(cacheKey);
          if (cachedProfile) {
            cacheHits++;
            return new SourceAuthenticityProfileModel({
              ...cachedProfile,
              metadata: {
                ...cachedProfile.metadata,
                cacheHit: true,
                executionTimeMs: Date.now() - itemStart,
              },
            }).toJSON();
          }
        } catch (cacheErr) {
          logger.warn(`[SourceAuthenticityService] Cache lookup error for ${cacheKey}: ${cacheErr.message}`);
        }
      }

      // Perform fresh evaluation
      try {
        const norm = UrlNormalizer.normalize(source.rawUrl);
        const registryMatch = authorityRegistryService.matchDomain(norm.domain);
        const sourceType = DomainClassifier.classifyDomain(norm.domain, registryMatch);

        const calculation = ScoreCalculator.calculate({
          domain: norm.domain,
          protocol: norm.protocol,
          registryMatch,
          sourceType,
        });

        const profileModel = new SourceAuthenticityProfileModel({
          sourceUrl: source.rawUrl,
          normalizedUrl: norm.normalizedUrl,
          domain: norm.domain,
          sourceType,
          authenticityScore: calculation.score,
          authenticityLevel: calculation.level,
          evaluationFactors: calculation.factors,
          metadata: {
            evaluatedAt: new Date().toISOString(),
            evaluatorVersion: AuthenticityConfig.getEvaluatorVersion(),
            registryVersion: authorityRegistryService.getRegistryVersion(),
            rulesApplied: calculation.rulesApplied,
            cacheHit: false,
            executionTimeMs: Date.now() - itemStart,
          },
        });

        const jsonProfile = profileModel.toJSON();

        // Asynchronously update cache
        this.cache.set(cacheKey, jsonProfile).catch(err => {
          logger.warn(`[SourceAuthenticityService] Failed to cache profile for ${cacheKey}: ${err.message}`);
        });

        logger.info({
          stage: 'Source Authenticity',
          event: 'SOURCE_EVALUATED',
          domain: norm.domain,
          score: calculation.score,
          level: calculation.level,
          classification: sourceType,
          executionTimeMs: Date.now() - itemStart,
        });

        return jsonProfile;
      } catch (evalErr) {
        failedEvaluations++;
        logger.error(`[SourceAuthenticityService] Error evaluating source '${source.rawUrl}': ${evalErr.message}`);

        // Graceful degradation to UNKNOWN profile
        return new SourceAuthenticityProfileModel({
          sourceUrl: source.rawUrl,
          normalizedUrl: source.normalizedUrl || source.rawUrl,
          domain: source.domain || 'unknown',
          sourceType: 'Unknown',
          authenticityScore: 0,
          authenticityLevel: 'UNKNOWN',
          metadata: {
            evaluatedAt: new Date().toISOString(),
            evaluatorVersion: AuthenticityConfig.getEvaluatorVersion(),
            registryVersion: authorityRegistryService.getRegistryVersion(),
            rulesApplied: [],
            cacheHit: false,
            executionTimeMs: Date.now() - itemStart,
            error: evalErr.message,
          },
        }).toJSON();
      }
    });

    const results = await Promise.all(evalPromises);
    evaluatedSources.push(...results);

    const totalExecutionTimeMs = Date.now() - startTime;
    const cacheHitRatio = uniqueSources.length > 0 ? parseFloat((cacheHits / uniqueSources.length).toFixed(2)) : 0.0;

    logger.info(`[SourceAuthenticityService] Evaluated ${evaluatedSources.length} sources in ${totalExecutionTimeMs}ms (Cache Hit Ratio: ${cacheHitRatio * 100}%).`);

    return new SourceAuthenticityBatchModel({
      query: batchQuery,
      totalSources: evaluatedSources.length,
      evaluatedSources,
      executionSummary: {
        totalExecutionTimeMs,
        cacheHitRatio,
        failedEvaluations,
      },
    }).toJSON();
  }
}

// Export singleton instance
export const sourceAuthenticityService = new SourceAuthenticityService();
