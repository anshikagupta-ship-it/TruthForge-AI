/**
 * ConfidenceExplanation Domain Model
 */

export class ConfidenceExplanationModel {
  /**
   * @param {Partial<import('../contracts/confidenceExplanation.contract.js').ConfidenceExplanation>} [data={}]
   */
  constructor(data = {}) {
    this.reasons = Array.isArray(data.reasons) ? [...data.reasons] : [];
    this.penalties = Array.isArray(data.penalties) ? [...data.penalties] : [];
    this.strengths = Array.isArray(data.strengths) ? [...data.strengths] : [];
  }

  toJSON() {
    return {
      reasons: [...this.reasons],
      penalties: [...this.penalties],
      strengths: [...this.strengths],
    };
  }
}
