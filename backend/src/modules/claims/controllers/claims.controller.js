import { BaseController } from '../../../common/controllers/base.controller.js';
import { claimsService } from '../services/claims.service.js';

export class ClaimsController extends BaseController {
  constructor() {
    super(claimsService, 'Claim');
  }
}

export const claimsController = new ClaimsController();
