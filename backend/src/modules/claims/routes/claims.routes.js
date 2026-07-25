import { Router } from 'express';
import { claimsController } from '../controllers/claims.controller.js';
import {
  validateCreateClaim,
  validateUpdateClaim,
  validateClaimIdParam,
} from '../validators/claims.validator.js';

const router = Router();

router.post('/', validateCreateClaim, claimsController.create);
router.get('/', claimsController.getAll);
router.get('/:id', validateClaimIdParam, claimsController.getById);
router.patch('/:id', validateUpdateClaim, claimsController.update);
router.delete('/:id', validateClaimIdParam, claimsController.delete);

export default router;
