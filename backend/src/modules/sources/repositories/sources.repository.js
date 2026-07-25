import { BaseRepository } from '../../../common/repositories/base.repository.js';

export class SourcesRepository extends BaseRepository {
  constructor() {
    super(
      'sources',
      ['source_name', 'publisher', 'source_url', 'doi'],
      ['publisher', 'source_type', 'trust_score']
    );
  }
}

export const sourcesRepository = new SourcesRepository();
