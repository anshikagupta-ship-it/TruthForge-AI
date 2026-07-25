/**
 * Verification Controller
 * Exposes Claim Verification pipeline execution over HTTP
 */

import { ClaimVerificationService } from '../services/claimVerification.service.js';
import { sendSuccess, sendError } from '../../../utils/response.js';

export class VerificationController {
  /**
   * POST /api/v1/verification/verify
   * Triggers claim verification over supplied evidenceBatch and claimBatch
   */
  async verify(req, res, next) {
    try {
      const { evidenceBatch, evidenceProfile, claimBatch, domain, maxRetries } = req.body;

      const verificationBatch = await ClaimVerificationService.verifyClaims(
        { evidenceBatch, evidenceProfile, claimBatch },
        { domain, maxRetries }
      );

      return sendSuccess(res, verificationBatch, 'Claims verified successfully.', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const verificationController = new VerificationController();
