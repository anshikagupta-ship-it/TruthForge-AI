export class ExecutiveSummary {
  constructor({
    overallVerdict = 'INSUFFICIENT_EVIDENCE',
    overallConfidence = 0,
    verifiedClaims = 0,
    supportedClaims = 0,
    contradictedClaims = 0,
    insufficientClaims = 0,
    totalEvidenceItems = 0,
    uniqueSourcesUsed = 0,
    highestAuthoritySources = []
  } = {}) {
    this.overallVerdict = overallVerdict;
    this.overallConfidence = overallConfidence;
    this.verifiedClaims = verifiedClaims;
    this.supportedClaims = supportedClaims;
    this.contradictedClaims = contradictedClaims;
    this.insufficientClaims = insufficientClaims;
    this.totalEvidenceItems = totalEvidenceItems;
    this.uniqueSourcesUsed = uniqueSourcesUsed;
    this.highestAuthoritySources = highestAuthoritySources;
  }

  toJSON() {
    return {
      overallVerdict: this.overallVerdict,
      overallConfidence: this.overallConfidence,
      verifiedClaims: this.verifiedClaims,
      supportedClaims: this.supportedClaims,
      contradictedClaims: this.contradictedClaims,
      insufficientClaims: this.insufficientClaims,
      totalEvidenceItems: this.totalEvidenceItems,
      uniqueSourcesUsed: this.uniqueSourcesUsed,
      highestAuthoritySources: this.highestAuthoritySources
    };
  }
}
