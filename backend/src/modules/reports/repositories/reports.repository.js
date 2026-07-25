import { BaseRepository } from '../../../common/repositories/base.repository.js';

export class ReportsRepository extends BaseRepository {
  constructor() {
    super(
      'reports',
      ['executive_summary'],
      ['report_status', 'query_id', 'status']
    );
  }

  /**
   * Override paginate to handle status -> report_status alias mapping.
   */
  async paginate(options = {}) {
    const filters = { ...options.filters };
    if (filters.status && !filters.report_status) {
      filters.report_status = filters.status;
      delete filters.status;
    }
    return super.paginate({ ...options, filters });
  }
}

export const reportsRepository = new ReportsRepository();
