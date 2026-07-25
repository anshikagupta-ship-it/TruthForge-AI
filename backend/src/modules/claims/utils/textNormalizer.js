import crypto from 'crypto';

export class TextNormalizer {
  /**
   * Canonicalizes string by lowercasing, stripping punctuation, and trimming extra spaces.
   * @param {string} text 
   * @returns {string}
   */
  static canonicalize(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generates SHA-256 hash of canonicalized string
   * @param {string} text 
   * @returns {string}
   */
  static hash(text) {
    const canonical = this.canonicalize(text);
    return crypto.createHash('sha256').update(canonical).digest('hex');
  }

  /**
   * Calculates Jaccard Similarity between two strings using character 3-grams
   * @param {string} strA 
   * @param {string} strB 
   * @returns {number} Similarity score [0.0 - 1.0]
   */
  static calculateJaccardSimilarity(strA, strB) {
    const normA = this.canonicalize(strA);
    const normB = this.canonicalize(strB);

    if (normA === normB) return 1.0;
    if (!normA || !normB) return 0.0;

    const getNGrams = (str, n = 3) => {
      const nGrams = new Set();
      for (let i = 0; i <= str.length - n; i++) {
        nGrams.add(str.substring(i, i + n));
      }
      return nGrams;
    };

    const setA = getNGrams(normA);
    const setB = getNGrams(normB);

    if (setA.size === 0 || setB.size === 0) return 0.0;

    let intersection = 0;
    for (const item of setA) {
      if (setB.has(item)) intersection++;
    }

    const union = setA.size + setB.size - intersection;
    return union > 0 ? intersection / union : 0.0;
  }
}
