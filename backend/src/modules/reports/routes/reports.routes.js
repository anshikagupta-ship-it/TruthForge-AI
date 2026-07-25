import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller.js';
import {
  validateCreateReport,
  validateUpdateReport,
  validateReportIdParam,
} from '../validators/reports.validator.js';

const router = Router();

router.post('/', validateCreateReport, reportsController.create);
router.get('/', reportsController.getAll);
router.get('/:id', validateReportIdParam, reportsController.getById);
router.patch('/:id', validateUpdateReport, reportsController.update);
router.delete('/:id', validateReportIdParam, reportsController.delete);

export default router;
