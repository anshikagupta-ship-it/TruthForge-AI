/**
 * Verification HTTP Payload Validator
 */

import { sendError } from '../../../utils/response.js';

export function validateVerifyClaimsRequest(req, res, next) {
  const { evidenceBatch, claimBatch } = req.body || {};

  if (!evidenceBatch || typeof evidenceBatch !== 'object') {
    return sendError(res, "Missing or invalid 'evidenceBatch' in request body.", 400);
  }

  if (!claimBatch || (typeof claimBatch !== 'object' && !Array.isArray(claimBatch))) {
    return sendError(res, "Missing or invalid 'claimBatch' in request body.", 400);
  }

  next();
}
