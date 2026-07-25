/**
 * Source Resolver
 * Links evidence source URLs and source IDs to SourceAuthenticityProfile records in SourceAuthenticityBatch
 */

import crypto from 'crypto';

export class SourceResolver {
  /**
   * @param {Object} sourceAuthenticityBatch - SourceAuthenticityBatch object
   */
  constructor(sourceAuthenticityBatch = {}) {
    this.profileMap = new Map(); // Maps canonical URL or profileId to profile
    this.urlToIdMap = new Map();  // Maps URL to deterministic sourceId

    const profiles = sourceAuthenticityBatch.evaluatedSources || sourceAuthenticityBatch.profiles || (Array.isArray(sourceAuthenticityBatch) ? sourceAuthenticityBatch : []);

    profiles.forEach((profile) => {
      const url = profile.sourceUrl || profile.url || profile.domain;
      const profileId = profile.profileId || profile.id || (url ? 'prof_' + crypto.createHash('sha256').update(url).digest('hex').substring(0, 10) : null);

      if (profileId) {
        this.profileMap.set(profileId, profile);
      }
      if (url) {
        const cleanUrl = String(url).trim().toLowerCase();
        this.profileMap.set(cleanUrl, profile);

        const sourceId = profile.sourceId || 'src_' + crypto.createHash('sha256').update(cleanUrl).digest('hex').substring(0, 10);
        this.urlToIdMap.set(cleanUrl, sourceId);
      }
    });
  }

  /**
   * Resolve Source ID for a canonical source URL
   * @param {string} sourceUrl
   * @returns {string}
   */
  resolveSourceId(sourceUrl) {
    if (!sourceUrl) return 'src_unknown';
    const cleanUrl = String(sourceUrl).trim().toLowerCase();
    if (this.urlToIdMap.has(cleanUrl)) {
      return this.urlToIdMap.get(cleanUrl);
    }
    const derivedId = 'src_' + crypto.createHash('sha256').update(cleanUrl).digest('hex').substring(0, 10);
    this.urlToIdMap.set(cleanUrl, derivedId);
    return derivedId;
  }

  /**
   * Resolve SourceAuthenticityProfile for a source URL or profile ID
   * @param {string} urlOrProfileId
   * @returns {Object|null}
   */
  resolveProfile(urlOrProfileId) {
    if (!urlOrProfileId) return null;
    const cleanKey = String(urlOrProfileId).trim().toLowerCase();
    return this.profileMap.get(cleanKey) || this.profileMap.get(urlOrProfileId) || null;
  }
}
