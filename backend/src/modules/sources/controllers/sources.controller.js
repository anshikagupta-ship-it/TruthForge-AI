import { BaseController } from '../../../common/controllers/base.controller.js';
import { sourcesService } from '../services/sources.service.js';

export class SourcesController extends BaseController {
  constructor() {
    super(sourcesService, 'Source');
  }
}

export const sourcesController = new SourcesController();
