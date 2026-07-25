import { Router } from 'express';
import { sourcesController } from '../controllers/sources.controller.js';
import {
  validateCreateSource,
  validateUpdateSource,
  validateSourceIdParam,
} from '../validators/sources.validator.js';

const router = Router();

router.post('/', validateCreateSource, sourcesController.create);
router.get('/', sourcesController.getAll);
router.get('/:id', validateSourceIdParam, sourcesController.getById);
router.patch('/:id', validateUpdateSource, sourcesController.update);
router.delete('/:id', validateSourceIdParam, sourcesController.delete);

export default router;
