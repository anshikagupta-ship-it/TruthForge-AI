import { BaseRepository } from '../../../common/repositories/base.repository.js';

export class ClaimsRepository extends BaseRepository {
  constructor() {
    super(
      'claims',
      ['claim_text', 'explanation'],
      ['verification_status', 'confidence_score', 'report_id', 'confidence']
    );
  }

  async paginate(options = {}) {
    const filters = { ...options.filters };
    if (filters.confidence !== undefined && filters.confidence_score === undefined) {
      filters.confidence_score = filters.confidence;
      delete filters.confidence;
    }
    return super.paginate({ ...options, filters });
  }
}

export const claimsRepository = new ClaimsRepository();
