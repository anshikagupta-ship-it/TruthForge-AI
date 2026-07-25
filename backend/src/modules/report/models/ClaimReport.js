export class ClaimReport {
  constructor({
    claimId = '',
    claim = '',
    verificationStatus = 'UNVERIFIABLE',
    confidence = 0,
    confidenceLevel = 'VERY_LOW',
    supportingEvidence = [],
    contradictingEvidence = [],
    sourceProfiles = [],
    explanation = [],
    provenancePath = [],
    penaltyCount = 0
  } = {}) {
    this.claimId = claimId;
    this.claim = claim;
    this.verificationStatus = verificationStatus;
    this.confidence = confidence;
    this.confidenceLevel = confidenceLevel;
    this.supportingEvidence = supportingEvidence;
    this.contradictingEvidence = contradictingEvidence;
    this.sourceProfiles = sourceProfiles;
    this.explanation = explanation;
    this.provenancePath = provenancePath;
    this.penaltyCount = penaltyCount;
  }

  toJSON() {
    return {
      claimId: this.claimId,
      claim: this.claim,
      verificationStatus: this.verificationStatus,
      confidence: this.confidence,
      confidenceLevel: this.confidenceLevel,
      supportingEvidence: this.supportingEvidence,
      contradictingEvidence: this.contradictingEvidence,
      sourceProfiles: this.sourceProfiles,
      explanation: this.explanation,
      provenancePath: this.provenancePath,
      penaltyCount: this.penaltyCount
    };
  }
}
