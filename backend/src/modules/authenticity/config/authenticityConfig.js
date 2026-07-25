/**
 * Authenticity Config Loader
 * Loads and exposes external weights and threshold configurations.
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const weightsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'weights.config.json'), 'utf8'));
const thresholdsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'thresholds.config.json'), 'utf8'));

export class AuthenticityConfig {
  static getWeights() {
    return weightsConfig.weights;
  }

  static getThresholds() {
    return thresholdsConfig.thresholds;
  }

  static getEvaluatorVersion() {
    return '1.0.0';
  }

  /**
   * Map numeric score (0-100) to AuthenticityLevel string
   * @param {number} score
   * @returns {import('../contracts/sourceAuthenticityProfile.contract.js').AuthenticityLevel}
   */
  static mapScoreToLevel(score) {
    const roundedScore = Math.min(100, Math.max(0, Math.round(score)));
    const thresholds = AuthenticityConfig.getThresholds();

    for (const t of thresholds) {
      if (roundedScore >= t.minScore && roundedScore <= t.maxScore) {
        return t.level;
      }
    }
    return 'UNKNOWN';
  }
}
