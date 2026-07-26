import { Router } from 'express';
import { pipelineController } from '../controllers/pipeline.controller.js';
import {
  validateCreatePipelineRun,
  validateUpdatePipelineRun,
  validatePipelineIdParam,
} from '../validators/pipeline.validator.js';

const router = Router();

router.post('/execute-full-verification', (req, res, next) => pipelineController.executeFullVerification(req, res, next));
router.post('/', validateCreatePipelineRun, pipelineController.create);
router.get('/', pipelineController.getAll);
router.get('/:id', validatePipelineIdParam, pipelineController.getById);
router.patch('/:id', validateUpdatePipelineRun, pipelineController.update);
router.delete('/:id', validatePipelineIdParam, pipelineController.delete);

export default router;
