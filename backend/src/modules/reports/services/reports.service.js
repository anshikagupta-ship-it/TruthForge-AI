import { BaseService } from '../../../common/services/base.service.js';
import { reportsRepository } from '../repositories/reports.repository.js';
import { CreateReportDto } from '../dto/create-report.dto.js';
import { UpdateReportDto } from '../dto/update-report.dto.js';

export class ReportsService extends BaseService {
  constructor() {
    super(reportsRepository, 'Report');
  }

  async create(payload) {
    const dto = new CreateReportDto(payload);
    return super.create(dto);
  }

  async update(id, payload) {
    const dto = new UpdateReportDto(payload);
    return super.update(id, dto);
  }
}

export const reportsService = new ReportsService();
