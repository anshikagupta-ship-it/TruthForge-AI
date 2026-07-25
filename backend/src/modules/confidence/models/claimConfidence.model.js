/**
 * ClaimConfidence Domain Model
 */

import { ConfidenceFactorsModel } from './confidenceFactors.model.js';
import { ConfidenceExplanationModel } from './confidenceExplanation.model.js';

export class ClaimConfidenceModel {
  /**
   * @param {Partial<import('../contracts/claimConfidence.contract.js').ClaimConfidence>} [data={}]
   */
  constructor(data = {}) {
    this.claimId = data.claimId || '';
    this.confidenceScore = typeof data.confidenceScore === 'number' ? data.confidenceScore : 0;
    this.confidenceLevel = data.confidenceLevel || 'VERY_LOW';
    this.confidenceFactors = new ConfidenceFactorsModel(data.confidenceFactors).toJSON();
    this.explanation = new ConfidenceExplanationModel(data.explanation).toJSON();
    
    this.metadata = {
      evaluatedAt: (data.metadata && data.metadata.evaluatedAt) || new Date().toISOString(),
      engineVersion: (data.metadata && data.metadata.engineVersion) || '1.0.0',
      weightVersion: (data.metadata && data.metadata.weightVersion) || '1.0.0',
      penaltyVersion: (data.metadata && data.metadata.penaltyVersion) || '1.0.0',
      executionTimeMs: (data.metadata && data.metadata.executionTimeMs) || 0,
      ...(data.metadata || {}),
    };
  }

  toJSON() {
    return {
      claimId: this.claimId,
      confidenceScore: this.confidenceScore,
      confidenceLevel: this.confidenceLevel,
      confidenceFactors: this.confidenceFactors,
      explanation: this.explanation,
      metadata: this.metadata,
    };
  }
}
