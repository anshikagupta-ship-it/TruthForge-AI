/**
 * Evidence Validator
 * Validates referential integrity of evidence IDs referenced by LLM outputs against input batch manifest.
 */

export class EvidenceValidator {
  /**
   * Validates that all referenced evidence IDs exist within the input EvidenceBatch
   * @param {Object} parsedPayload - Parsed LLM verification response object
   * @param {Object|Array} evidenceBatch - Original EvidenceBatch or array of evidences
   * @returns {{isValid: boolean, invalidIds: string[], cleanedSupporting: string[], cleanedContradicting: string[], errors: string[]}}
   */
  static validate(parsedPayload, evidenceBatch) {
    const errors = [];
    const invalidIds = [];

    const evidences = Array.isArray(evidenceBatch) ? evidenceBatch : (evidenceBatch?.evidences || []);
    const validEvidenceIds = new Set(evidences.map(e => e.evidenceId || e.id).filter(Boolean));

    const supportingRaw = parsedPayload?.supportingEvidenceIds || [];
    const contradictingRaw = parsedPayload?.contradictingEvidenceIds || [];

    // Filter non-string items and deduplicate
    const supportingList = Array.isArray(supportingRaw) ? [...new Set(supportingRaw.map(String))] : [];
    const contradictingList = Array.isArray(contradictingRaw) ? [...new Set(contradictingRaw.map(String))] : [];

    // 1. Check referential existence of supporting evidence IDs
    const cleanedSupporting = supportingList.filter(id => {
      if (!validEvidenceIds.has(id)) {
        invalidIds.push(id);
        errors.push(`Referenced supporting evidence ID '${id}' does not exist in input EvidenceBatch.`);
        return false;
      }
      return true;
    });

    // 2. Check referential existence of contradicting evidence IDs
    const cleanedContradicting = contradictingList.filter(id => {
      if (!validEvidenceIds.has(id)) {
        invalidIds.push(id);
        errors.push(`Referenced contradicting evidence ID '${id}' does not exist in input EvidenceBatch.`);
        return false;
      }
      return true;
    });

    // 3. Check for conflict: evidence ID listed as both supporting and contradicting
    const conflictingIds = cleanedSupporting.filter(id => cleanedContradicting.includes(id));
    if (conflictingIds.length > 0) {
      errors.push(`Evidence ID(s) [${conflictingIds.join(', ')}] marked as both supporting and contradicting.`);
    }

    return {
      isValid: invalidIds.length === 0 && conflictingIds.length === 0,
      invalidIds: [...new Set(invalidIds)],
      cleanedSupporting,
      cleanedContradicting,
      errors,
    };
  }
}
