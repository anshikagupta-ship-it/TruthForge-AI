import { Router } from 'express';
import { queriesController } from '../controllers/queries.controller.js';
import {
  validateCreateQuery,
  validateUpdateQuery,
  validateQueryIdParam,
} from '../validators/queries.validator.js';

const router = Router();

router.post('/', validateCreateQuery, queriesController.create);
router.get('/', queriesController.getAll);
router.get('/:id', validateQueryIdParam, queriesController.getById);
router.patch('/:id', validateUpdateQuery, queriesController.update);
router.delete('/:id', validateQueryIdParam, queriesController.delete);

export default router;
