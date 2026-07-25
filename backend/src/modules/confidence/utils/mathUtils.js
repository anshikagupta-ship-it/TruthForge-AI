/**
 * Pure mathematical utilities for confidence engine
 */

export class MathUtils {
  /**
   * Clamp a numerical value between min and max bounds
   * @param {number} val
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  static clamp(val, min = 0, max = 100) {
    if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
      return min;
    }
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Safely calculate average of a numerical array
   * @param {number[]} numbers
   * @param {number} [fallback=0]
   * @returns {number}
   */
  static safeAverage(numbers, fallback = 0) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return fallback;
    }
    const validNums = numbers.filter((n) => typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n));
    if (validNums.length === 0) return fallback;
    const sum = validNums.reduce((acc, curr) => acc + curr, 0);
    return sum / validNums.length;
  }

  /**
   * Safely calculate ratio (numerator / denominator)
   * @param {number} num
   * @param {number} den
   * @param {number} [fallback=0]
   * @returns {number}
   */
  static safeRatio(num, den, fallback = 0) {
    if (typeof den !== 'number' || den <= 0 || Number.isNaN(den)) {
      return fallback;
    }
    const result = num / den;
    if (Number.isNaN(result) || !Number.isFinite(result)) {
      return fallback;
    }
    return result;
  }

  /**
   * Calculate weighted sum given factors object and weights map
   * @param {Record<string, number>} factors
   * @param {Record<string, number>} weights
   * @returns {number}
   */
  static calculateWeightedSum(factors, weights) {
    let sum = 0;
    for (const [key, weight] of Object.entries(weights)) {
      const factorValue = typeof factors[key] === 'number' ? factors[key] : 0;
      sum += factorValue * weight;
    }
    return sum;
  }
}
