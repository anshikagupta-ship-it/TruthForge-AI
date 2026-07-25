import { BaseService } from '../../../common/services/base.service.js';
import { claimsRepository } from '../repositories/claims.repository.js';
import { CreateClaimDto } from '../dto/create-claim.dto.js';
import { UpdateClaimDto } from '../dto/update-claim.dto.js';

export class ClaimsService extends BaseService {
  constructor() {
    super(claimsRepository, 'Claim');
  }

  async create(payload) {
    const dto = new CreateClaimDto(payload);
    return super.create(dto);
  }

  async update(id, payload) {
    const dto = new UpdateClaimDto(payload);
    return super.update(id, dto);
  }
}

export const claimsService = new ClaimsService();
