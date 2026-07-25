/**
 * SourceAuthenticityProfile Domain Model Class
 */

import { DomainUtils } from '../utils/domainUtils.js';

export class SourceAuthenticityProfileModel {
  /**
   * @param {Partial<import('../contracts/sourceAuthenticityProfile.contract.js').SourceAuthenticityProfile>} data
   */
  constructor(data = {}) {
    this.sourceUrl = data.sourceUrl || '';
    this.normalizedUrl = data.normalizedUrl || '';
    this.domain = data.domain || '';
    this.sourceId = data.sourceId || DomainUtils.generateSourceId(this.domain || this.normalizedUrl || this.sourceUrl);
    this.sourceType = data.sourceType || 'Unknown';
    this.authenticityScore = typeof data.authenticityScore === 'number' ? data.authenticityScore : 0;
    this.authenticityLevel = data.authenticityLevel || 'UNKNOWN';

    this.evaluationFactors = data.evaluationFactors || {
      institutionRecognition: 0,
      topLevelDomainTrust: 0,
      securityProtocol: 0,
      authorityRegistryMatch: 0,
      publisherTypeWeight: 0,
      peerReviewedStatus: 0,
      isResearchRepository: false,
      isGovernmentOwned: false,
      isMedicalAuthority: false,
      isEducationalInstitution: false,
      isStandardsOrganization: false,
      isInternationalOrganization: false,
    };

    this.metadata = data.metadata || {
      evaluatedAt: new Date().toISOString(),
      evaluatorVersion: '1.0.0',
      registryVersion: '2026.07.01',
      rulesApplied: [],
      cacheHit: false,
      executionTimeMs: 0,
    };
  }

  toJSON() {
    return {
      sourceId: this.sourceId,
      sourceUrl: this.sourceUrl,
      normalizedUrl: this.normalizedUrl,
      domain: this.domain,
      sourceType: this.sourceType,
      authenticityScore: this.authenticityScore,
      authenticityLevel: this.authenticityLevel,
      evaluationFactors: this.evaluationFactors,
      metadata: this.metadata,
    };
  }
}
