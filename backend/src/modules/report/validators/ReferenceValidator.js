export class ReferenceValidator {
  static validate(report) {
    const errors = [];
    const sec4 = (report.sections || []).find(s => s.order === 4);
    if (!sec4 || !sec4.content || !sec4.content.claims) return errors;

    const claimIds = new Set();
    sec4.content.claims.forEach(c => {
      if (claimIds.has(c.claimId)) {
        errors.push(`ERR_DUPLICATE_CLAIM: Duplicate claimId found "${c.claimId}"`);
      }
      claimIds.add(c.claimId);

      if (typeof c.confidence !== 'number' || c.confidence < 0 || c.confidence > 100) {
        errors.push(`ERR_INVALID_CONFIDENCE: Invalid score ${c.confidence} for claim ${c.claimId}`);
      }
    });

    return errors;
  }
}
