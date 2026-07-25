/**
 * ConfidenceFactors Domain Model
 */

export class ConfidenceFactorsModel {
  /**
   * @param {Partial<import('../contracts/confidenceFactors.contract.js').ConfidenceFactors>} [data={}]
   */
  constructor(data = {}) {
    this.verificationStrength = typeof data.verificationStrength === 'number' ? data.verificationStrength : 0;
    this.evidenceStrength = typeof data.evidenceStrength === 'number' ? data.evidenceStrength : 0;
    this.sourceAuthenticity = typeof data.sourceAuthenticity === 'number' ? data.sourceAuthenticity : 0;
    this.provenanceCompleteness = typeof data.provenanceCompleteness === 'number' ? data.provenanceCompleteness : 0;
    this.evidenceAgreement = typeof data.evidenceAgreement === 'number' ? data.evidenceAgreement : 0;
    this.evidenceCoverage = typeof data.evidenceCoverage === 'number' ? data.evidenceCoverage : 0;
    this.contradictionPenalty = typeof data.contradictionPenalty === 'number' ? data.contradictionPenalty : 0;
    this.retrievalQuality = typeof data.retrievalQuality === 'number' ? data.retrievalQuality : 0;
  }

  toJSON() {
    return {
      verificationStrength: this.verificationStrength,
      evidenceStrength: this.evidenceStrength,
      sourceAuthenticity: this.sourceAuthenticity,
      provenanceCompleteness: this.provenanceCompleteness,
      evidenceAgreement: this.evidenceAgreement,
      evidenceCoverage: this.evidenceCoverage,
      contradictionPenalty: this.contradictionPenalty,
      retrievalQuality: this.retrievalQuality,
    };
  }
}
