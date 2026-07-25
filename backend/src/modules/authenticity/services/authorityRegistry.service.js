/**
 * Authority Registry Service
 * Manages loading, caching, versioning, and querying of authority registry datasets.
 */

import { RegistryLoader } from '../registry/registryLoader.js';
import { logger } from '../../../utils/logger.js';

export class AuthorityRegistryService {
  constructor() {
    this.domainIndex = new Map();
    this.registryVersion = '2026.07.01';
    this.isInitialized = false;
  }

  /**
   * Initialize or refresh the authority registry index
   */
  initialize() {
    try {
      const res = RegistryLoader.loadAllRegistries();
      this.domainIndex = res.domainIndex;
      this.registryVersion = res.registryVersion;
      this.isInitialized = true;
      logger.info(`[AuthorityRegistryService] Initialized with version ${this.registryVersion}.`);
    } catch (err) {
      logger.error(`[AuthorityRegistryService] Error initializing authority registry: ${err.message}`);
    }
  }

  /**
   * Match domain against authority registry
   * @param {string} domain
   * @returns {Object|null}
   */
  matchDomain(domain) {
    if (!this.isInitialized) {
      this.initialize();
    }
    if (!domain || typeof domain !== 'string') return null;

    const clean = domain.toLowerCase().trim();

    // 1. Direct domain match
    if (this.domainIndex.has(clean)) {
      return this.domainIndex.get(clean);
    }

    // 2. Try prefix stripping or subdomain matching
    const parts = clean.split('.');
    if (parts.length > 2) {
      const parentDomain = parts.slice(1).join('.');
      if (this.domainIndex.has(parentDomain)) {
        return this.domainIndex.get(parentDomain);
      }
    }

    return null;
  }

  getRegistryVersion() {
    return this.registryVersion;
  }
}

// Export singleton instance
export const authorityRegistryService = new AuthorityRegistryService();
