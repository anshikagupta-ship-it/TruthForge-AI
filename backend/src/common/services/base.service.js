import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';

/**
 * BaseService providing generic business logic orchestration around BaseRepository.
 */
export class BaseService {
  /**
   * @param {import('../repositories/base.repository.js').BaseRepository} repository
   * @param {string} entityName - Name of entity for logging and error reporting
   */
  constructor(repository, entityName) {
    this.repository = repository;
    this.entityName = entityName;
  }

  /**
   * Creates a new entity instance.
   * @param {object} dto
   * @returns {Promise<object>}
   */
  async create(dto) {
    const start = performance.now();
    const result = await this.repository.create(dto);
    const duration = performance.now() - start;
    logger.logCrud(this.entityName, 'create', duration, { id: result.id });
    return result;
  }

  /**
   * Updates an existing entity instance.
   * @param {string} id
   * @param {object} dto
   * @returns {Promise<object>}
   */
  async update(id, dto) {
    const start = performance.now();
    await this.findOne(id); // Throws NotFoundError if missing
    const result = await this.repository.update(id, dto);
    const duration = performance.now() - start;
    logger.logCrud(this.entityName, 'update', duration, { id });
    return result;
  }

  /**
   * Deletes an entity instance by ID.
   * @param {string} id
   * @returns {Promise<{ deleted: boolean }>}
   */
  async delete(id) {
    const start = performance.now();
    await this.findOne(id); // Throws NotFoundError if missing
    await this.repository.delete(id);
    const duration = performance.now() - start;
    logger.logCrud(this.entityName, 'delete', duration, { id });
    return { deleted: true };
  }

  /**
   * Retrieves a single entity by ID.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async findOne(id) {
    const start = performance.now();
    const result = await this.repository.findById(id);
    const duration = performance.now() - start;
    logger.logCrud(this.entityName, 'findOne', duration, { id });

    if (!result) {
      throw new NotFoundError(`${this.entityName} with ID '${id}' not found`);
    }
    return result;
  }

  /**
   * Retrieves paginated entities matching criteria.
   * @param {object} queryParams - Express request query parameters
   * @returns {Promise<{ items: Array, pagination: object }>}
   */
  async findMany(queryParams = {}) {
    const start = performance.now();

    const { page, limit, sort, order, q, ...filters } = queryParams;

    const result = await this.repository.findAll({
      page,
      limit,
      sort,
      order,
      q,
      filters,
    });

    const duration = performance.now() - start;
    logger.logCrud(this.entityName, 'findMany', duration, {
      total: result.pagination.total,
      page: result.pagination.page,
    });

    return result;
  }
}
