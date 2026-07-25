/**
 * ClaimLineage Domain Model
 */

export class ClaimLineageModel {
  /**
   * @param {Object} params
   * @param {string} params.claimId
   * @param {import('../contracts/evidenceReference.contract.js').EvidenceReference[]} [params.supportingEvidence]
   * @param {import('../contracts/evidenceReference.contract.js').EvidenceReference[]} [params.contradictingEvidence]
   * @param {string[]} [params.sourceProfiles]
   */
  constructor({ claimId, supportingEvidence = [], contradictingEvidence = [], sourceProfiles = [] }) {
    if (!claimId) {
      throw new Error('ClaimLineageModel requires claimId');
    }
    this.claimId = claimId;
    this.supportingEvidence = supportingEvidence;
    this.contradictingEvidence = contradictingEvidence;
    this.sourceProfiles = sourceProfiles;
  }

  toJSON() {
    return {
      claimId: this.claimId,
      supportingEvidence: this.supportingEvidence,
      contradictingEvidence: this.contradictingEvidence,
      sourceProfiles: this.sourceProfiles,
    };
  }
}
