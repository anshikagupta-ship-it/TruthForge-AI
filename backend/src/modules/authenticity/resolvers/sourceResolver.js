/**
 * Source Resolver
 * Traverses VerificationBatch & EvidenceBatch to extract and deduplicate unique source URLs.
 */

import { UrlNormalizer } from '../normalizers/urlNormalizer.js';
import { UrlValidator } from '../validators/urlValidator.js';
import { logger } from '../../../utils/logger.js';

export class SourceResolver {
  /**
   * Extract all unique source URLs referenced in verified claims or evidence batch
   * @param {Object} params
   * @param {Object} [params.verificationBatch] - Verified claims batch from Phase 3
   * @param {Object} [params.evidenceBatch] - Raw ingested evidence batch from Phase 1
   * @returns {{ uniqueSources: Array<{ rawUrl: string, normalizedUrl: string, domain: string, protocol: string, isMalformed: boolean }>, totalExtracted: number }}
   */
  static extractUniqueSources({ verificationBatch, evidenceBatch }) {
    const rawUrlMap = new Map();

    // 1. Extract from EvidenceBatch items
    const evidenceItems = evidenceBatch?.evidence || (Array.isArray(evidenceBatch) ? evidenceBatch : []);
    for (const item of evidenceItems) {
      const url = item.sourceUrl || item.url || item.source;
      if (url && typeof url === 'string') {
        rawUrlMap.set(url.trim(), url.trim());
      }
    }

    // 2. Extract from VerificationBatch verified claims
    const verifiedClaims = verificationBatch?.verifiedClaims || (Array.isArray(verificationBatch) ? verificationBatch : []);
    for (const claim of verifiedClaims) {
      if (Array.isArray(claim.matchedEvidence)) {
        for (const ev of claim.matchedEvidence) {
          const url = ev.sourceUrl || ev.url || ev.source;
          if (url && typeof url === 'string') {
            rawUrlMap.set(url.trim(), url.trim());
          }
        }
      }
    }

    // 3. Normalize and deduplicate by normalizedUrl or domain
    const uniqueSourcesMap = new Map();
    let malformedCount = 0;

    for (const rawUrl of rawUrlMap.values()) {
      const valResult = UrlValidator.validateUrl(rawUrl);
      const normalized = UrlNormalizer.normalize(rawUrl);

      const sourceEntry = {
        rawUrl,
        normalizedUrl: normalized.normalizedUrl,
        domain: normalized.domain,
        protocol: normalized.protocol,
        isMalformed: !valResult.isValid,
      };

      if (!valResult.isValid) {
        malformedCount++;
        logger.warn(`[SourceResolver] Detected malformed URL: '${rawUrl}'. Reason: ${valResult.error}`);
      }

      // Key by normalizedUrl (or domain if URL has no path)
      const key = normalized.normalizedUrl || normalized.domain || rawUrl;
      if (!uniqueSourcesMap.has(key)) {
        uniqueSourcesMap.set(key, sourceEntry);
      }
    }

    const uniqueSources = Array.from(uniqueSourcesMap.values());
    logger.info(`[SourceResolver] Extracted ${uniqueSources.length} unique sources from ${rawUrlMap.size} raw URL references (${malformedCount} malformed).`);

    return {
      uniqueSources,
      totalExtracted: uniqueSources.length,
    };
  }
}
