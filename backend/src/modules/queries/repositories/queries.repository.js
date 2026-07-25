import { BaseRepository } from '../../../common/repositories/base.repository.js';

export class QueriesRepository extends BaseRepository {
  constructor() {
    super(
      'queries',
      ['query_text', 'detected_domain'],
      ['status', 'detected_domain', 'domain']
    );
  }

  /**
   * Overrides base paginate to map alias 'domain' to 'detected_domain' if passed.
   */
  async paginate(options = {}) {
    const filters = { ...options.filters };
    if (filters.domain && !filters.detected_domain) {
      filters.detected_domain = filters.domain;
      delete filters.domain;
    }
    return super.paginate({ ...options, filters });
  }
}

export const queriesRepository = new QueriesRepository();
