/**
 * Domain Utilities
 * Helpers for domain parsing, hash creation, and public suffix parsing.
 */

import crypto from 'crypto';

export class DomainUtils {
  /**
   * Compute a deterministic MD5/SHA256 source hash ID for a URL or domain
   * @param {string} input - Normalized URL or domain
   * @returns {string} Hash string ID
   */
  static generateSourceId(input) {
    if (!input || typeof input !== 'string') {
      return 'src_unknown_hash';
    }
    return 'src_' + crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex').substring(0, 16);
  }

  /**
   * Extract root registered domain from hostname (simple public suffix fallback)
   * e.g., 'subdomain.news.bbc.co.uk' -> 'bbc.co.uk' or 'subdomain.ox.ac.uk' -> 'ox.ac.uk'
   * @param {string} hostname
   * @returns {string}
   */
  static extractRegisteredDomain(hostname) {
    if (!hostname || typeof hostname !== 'string') return '';
    const cleanHost = hostname.toLowerCase().trim();
    const parts = cleanHost.split('.');

    if (parts.length <= 2) {
      return cleanHost;
    }

    // Common multi-part TLD suffixes
    const multiPartTlds = ['co.uk', 'ac.uk', 'gov.uk', 'org.uk', 'com.au', 'edu.au', 'gov.au', 'co.jp', 'europa.eu'];
    const lastTwo = parts.slice(-2).join('.');

    if (multiPartTlds.includes(lastTwo) && parts.length >= 3) {
      return parts.slice(-3).join('.');
    }

    return parts.slice(-2).join('.');
  }
}
