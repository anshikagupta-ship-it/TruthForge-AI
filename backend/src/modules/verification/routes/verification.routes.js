/**
 * Verification Routes
 */

import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller.js';
import { validateVerifyClaimsRequest } from '../validators/verification.validator.js';

const router = Router();

router.post('/verify', validateVerifyClaimsRequest, (req, res, next) =>
  verificationController.verify(req, res, next)
);

export default router;
