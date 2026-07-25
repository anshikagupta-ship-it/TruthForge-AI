import { BaseService } from '../../../common/services/base.service.js';
import { queriesRepository } from '../repositories/queries.repository.js';
import { CreateQueryDto } from '../dto/create-query.dto.js';
import { UpdateQueryDto } from '../dto/update-query.dto.js';

export class QueriesService extends BaseService {
  constructor() {
    super(queriesRepository, 'Query');
  }

  async create(payload) {
    const dto = new CreateQueryDto(payload);
    return super.create(dto);
  }

  async update(id, payload) {
    const dto = new UpdateQueryDto(payload);
    return super.update(id, dto);
  }
}

export const queriesService = new QueriesService();
