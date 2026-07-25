/**
 * ClaimBatch Domain Model
 * Container entity for a collection of generated claims for a query.
 */
export class ClaimBatchModel {
  /**
   * @param {Object} params
   * @param {string} [params.batchId]
   * @param {string} params.queryId
   * @param {string} params.query
   * @param {Array} [params.claims]
   * @param {Object} [params.executionSummary]
   */
  constructor({
    batchId,
    queryId,
    query,
    claims = [],
    executionSummary = {},
  }) {
    this.batchId = batchId || `cb-${Math.random().toString(36).substring(2, 10)}`;
    this.queryId = queryId || 'q-unknown';
    this.query = query || '';
    this.claims = claims;
    this.totalClaims = claims.length;
    this.executionSummary = {
      completedAt: new Date().toISOString(),
      ...executionSummary,
    };
  }

  /**
   * Converts entity to plain JSON object matching ClaimBatch contract
   */
  toJSON() {
    return {
      batchId: this.batchId,
      queryId: this.queryId,
      query: this.query,
      totalClaims: this.totalClaims,
      claims: this.claims.map(c => (typeof c.toJSON === 'function' ? c.toJSON() : c)),
      executionSummary: this.executionSummary,
    };
  }
}
