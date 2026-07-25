import { BaseController } from '../../../common/controllers/base.controller.js';
import { reportsService } from '../services/reports.service.js';

export class ReportsController extends BaseController {
  constructor() {
    super(reportsService, 'Report');
  }
}

export const reportsController = new ReportsController();
