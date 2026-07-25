import { sendSuccess } from '../../utils/response.js';

/**
 * BaseController class providing reusable HTTP request handler methods.
 */
export class BaseController {
  /**
   * @param {import('../services/base.service.js').BaseService} service
   * @param {string} entityName - Name of domain entity for responses
   */
  constructor(service, entityName) {
    this.service = service;
    this.entityName = entityName;
  }

  /**
   * Creates a new entity.
   */
  create = async (req, res, next) => {
    try {
      const data = await this.service.create(req.body);
      return sendSuccess(res, data, `${this.entityName} created successfully`, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves paginated list of entities.
   */
  getAll = async (req, res, next) => {
    try {
      const result = await this.service.findMany(req.query);
      return sendSuccess(res, result, `${this.entityName}s retrieved successfully`, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves entity by ID.
   */
  getById = async (req, res, next) => {
    try {
      const data = await this.service.findOne(req.params.id);
      return sendSuccess(res, data, `${this.entityName} retrieved successfully`, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates entity by ID.
   */
  update = async (req, res, next) => {
    try {
      const data = await this.service.update(req.params.id, req.body);
      return sendSuccess(res, data, `${this.entityName} updated successfully`, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deletes entity by ID.
   */
  delete = async (req, res, next) => {
    try {
      const data = await this.service.delete(req.params.id);
      return sendSuccess(res, data, `${this.entityName} deleted successfully`, 200);
    } catch (error) {
      next(error);
    }
  };
}
