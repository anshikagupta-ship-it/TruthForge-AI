import { TextNormalizer } from './textNormalizer.js';
import { ClaimModel } from '../models/claim.model.js';
import { logger } from '../../../utils/logger.js';

export class ClaimDeduplicator {
  /**
   * Merges semantically identical claims, unioning evidence IDs and source domains
   * @param {Array<ClaimModel>} claims 
   * @param {number} [similarityThreshold=0.85] 
   * @returns {{ deduplicatedClaims: ClaimModel[], mergedCount: number }}
   */
  static deduplicate(claims, similarityThreshold = 0.85) {
    if (!Array.isArray(claims) || claims.length <= 1) {
      return { deduplicatedClaims: claims || [], mergedCount: 0 };
    }

    const result = [];
    let mergedCount = 0;

    for (const currentClaim of claims) {
      let isDuplicate = false;

      for (const existingClaim of result) {
        const similarity = TextNormalizer.calculateJaccardSimilarity(
          currentClaim.statement,
          existingClaim.statement
        );

        if (similarity >= similarityThreshold) {
          isDuplicate = true;
          mergedCount++;

          // Union supporting evidence IDs
          const combinedEvidenceIds = Array.from(
            new Set([...existingClaim.supportingEvidenceIds, ...currentClaim.supportingEvidenceIds])
          );

          // Union source domains
          const combinedSourceDomains = Array.from(
            new Set([...existingClaim.sourceDomains, ...currentClaim.sourceDomains])
          );

          // Update existing merged claim
          existingClaim.supportingEvidenceIds = combinedEvidenceIds;
          existingClaim.sourceDomains = combinedSourceDomains;
          existingClaim.metadata.evidenceCount = combinedEvidenceIds.length;
          existingClaim.metadata.sourceCount = combinedSourceDomains.length;
          existingClaim.metadata.deduplicatedFromCount = (existingClaim.metadata.deduplicatedFromCount || 1) + 1;

          if (!existingClaim.metadata.originalStatements) {
            existingClaim.metadata.originalStatements = [existingClaim.statement];
          }
          existingClaim.metadata.originalStatements.push(currentClaim.statement);

          logger.debug(
            `[ClaimDeduplicator] Merged duplicate claim candidate (sim: ${similarity.toFixed(2)}) into claim [${existingClaim.claimId}]`
          );
          break;
        }
      }

      if (!isDuplicate) {
        result.push(currentClaim);
      }
    }

    return {
      deduplicatedClaims: result,
      mergedCount,
    };
  }
}
