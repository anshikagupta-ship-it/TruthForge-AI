/**
 * PolicyConfig loader & validator singleton
 */

import weightsConfig from './weights.json' with { type: 'json' };
import penaltiesConfig from './penalties.json' with { type: 'json' };
import levelsConfig from './levels.json' with { type: 'json' };

export class PolicyConfig {
  constructor() {
    this.weights = weightsConfig.weights;
    this.weightVersion = weightsConfig.version || '1.0.0';
    this.policyProfile = weightsConfig.profile || 'default';

    this.penalties = penaltiesConfig.penalties;
    this.penaltyVersion = penaltiesConfig.version || '1.0.0';

    this.levels = levelsConfig.levels;
    this.levelVersion = levelsConfig.version || '1.0.0';

    this.validateConfig();
  }

  /**
   * Validate integrity of configuration parameters
   */
  validateConfig() {
    // Validate weight sum
    const weightSum = Object.values(this.weights).reduce((acc, val) => acc + val, 0);
    if (Math.abs(weightSum - 1.0) > 0.001) {
      throw new Error(`Invalid Policy Config: Weights sum to ${weightSum}, must equal 1.0`);
    }

    // Validate levels coverage
    if (!Array.isArray(this.levels) || this.levels.length === 0) {
      throw new Error('Invalid Policy Config: Levels array must not be empty');
    }
  }

  /**
   * Map numerical score (0-100) to categorical level
   * @param {number} score
   * @returns {'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW'}
   */
  mapScoreToLevel(score) {
    const clampedScore = Math.max(0, Math.min(100, score));
    for (const entry of this.levels) {
      if (clampedScore >= entry.min && clampedScore <= entry.max) {
        return entry.level;
      }
    }
    return 'VERY_LOW';
  }
}

export const defaultPolicyConfig = new PolicyConfig();
