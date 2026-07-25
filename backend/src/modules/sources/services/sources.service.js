import { BaseService } from '../../../common/services/base.service.js';
import { sourcesRepository } from '../repositories/sources.repository.js';
import { CreateSourceDto } from '../dto/create-source.dto.js';
import { UpdateSourceDto } from '../dto/update-source.dto.js';

export class SourcesService extends BaseService {
  constructor() {
    super(sourcesRepository, 'Source');
  }

  async create(payload) {
    const dto = new CreateSourceDto(payload);
    return super.create(dto);
  }

  async update(id, payload) {
    const dto = new UpdateSourceDto(payload);
    return super.update(id, dto);
  }
}

export const sourcesService = new SourcesService();
