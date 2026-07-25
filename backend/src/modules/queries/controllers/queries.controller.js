import { BaseController } from '../../../common/controllers/base.controller.js';
import { queriesService } from '../services/queries.service.js';

export class QueriesController extends BaseController {
  constructor() {
    super(queriesService, 'Query');
  }
}

export const queriesController = new QueriesController();
