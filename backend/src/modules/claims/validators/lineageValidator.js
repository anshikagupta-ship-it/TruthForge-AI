import { logger } from '../../../utils/logger.js';

export class LineageValidator {
  /**
   * Cross-references referenced evidence IDs against input EvidenceBatch to filter out hallucinated IDs.
   * @param {string[]} referencedIds 
   * @param {Map<string, Object> | Set<string>} validEvidenceIdSet 
   * @returns {{ validIds: string[], strippedCount: number }}
   */
  static validateEvidenceLineage(referencedIds, validEvidenceIdSet) {
    const validIds = [];
    let strippedCount = 0;

    for (const id of referencedIds) {
      const exists = validEvidenceIdSet instanceof Set
        ? validEvidenceIdSet.has(id)
        : validEvidenceIdSet.has ? validEvidenceIdSet.has(id) : Boolean(validEvidenceIdSet[id]);

      if (exists) {
        validIds.push(id);
      } else {
        strippedCount++;
        logger.warn(`[LineageValidator] Stripped non-existent evidence ID reference: "${id}"`);
      }
    }

    return {
      validIds: Array.from(new Set(validIds)),
      strippedCount,
    };
  }
}
