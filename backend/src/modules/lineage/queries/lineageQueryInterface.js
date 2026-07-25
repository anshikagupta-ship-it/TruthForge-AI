/**
 * LineageQueryInterface Base Abstract Contract
 */

export class LineageQueryInterface {
  /**
   * 1. Find all evidence supporting claim X
   * @param {string} claimId
   * @returns {Promise<import('../contracts/evidenceReference.contract.js').EvidenceReference[]>}
   */
  async findSupportingEvidence(claimId) {
    throw new Error('LineageQueryInterface.findSupportingEvidence must be implemented.');
  }

  /**
   * 2. Find all claims using source Y
   * @param {string} sourceIdOrUrl
   * @returns {Promise<import('../contracts/claimLineage.contract.js').ClaimLineage[]>}
   */
  async findClaimsBySource(sourceIdOrUrl) {
    throw new Error('LineageQueryInterface.findClaimsBySource must be implemented.');
  }

  /**
   * 3. Find all claims contradicted by source Z
   * @param {string} sourceIdOrUrl
   * @returns {Promise<import('../contracts/claimLineage.contract.js').ClaimLineage[]>}
   */
  async findClaimsContradictedBySource(sourceIdOrUrl) {
    throw new Error('LineageQueryInterface.findClaimsContradictedBySource must be implemented.');
  }

  /**
   * 4. Find complete provenance path of claim X
   * @param {string} claimId
   * @returns {Promise<{ claim: Object, evidence: Object[], sources: Object[], profiles: Object[], edges: Object[] }>}
   */
  async findCompleteProvenance(claimId) {
    throw new Error('LineageQueryInterface.findCompleteProvenance must be implemented.');
  }

  /**
   * 5. Find all claims using WHO sources
   * @param {string} authorityName
   * @returns {Promise<import('../contracts/claimLineage.contract.js').ClaimLineage[]>}
   */
  async findClaimsByAuthority(authorityName) {
    throw new Error('LineageQueryInterface.findClaimsByAuthority must be implemented.');
  }

  /**
   * 6. Find all evidence from Nature
   * @param {string} domain
   * @returns {Promise<Object[]>}
   */
  async findEvidenceByDomain(domain) {
    throw new Error('LineageQueryInterface.findEvidenceByDomain must be implemented.');
  }

  /**
   * 7. Find all claims with multiple supporting sources
   * @param {number} minSources
   * @returns {Promise<import('../contracts/claimLineage.contract.js').ClaimLineage[]>}
   */
  async findClaimsWithMultipleSources(minSources) {
    throw new Error('LineageQueryInterface.findClaimsWithMultipleSources must be implemented.');
  }
}
