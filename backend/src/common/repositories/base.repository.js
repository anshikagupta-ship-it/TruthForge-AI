import { supabaseAdmin } from '../../config/supabase.js';

/**
 * BaseRepository class providing generic Supabase database CRUD operations.
 * Concrete repositories extend this class.
 */
export class BaseRepository {
  /**
   * @param {string} tableName - Supabase database table name
   * @param {string[]} [searchFields=[]] - Text fields available for ILIKE search
   * @param {string[]} [allowedFilters=[]] - Allowed query filter fields
   */
  constructor(tableName, searchFields = [], allowedFilters = []) {
    this.tableName = tableName;
    this.searchFields = searchFields;
    this.allowedFilters = allowedFilters;
    this.db = supabaseAdmin;
  }

  /**
   * Finds a single record by primary key UUID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Checks if a record exists matching given criteria or ID.
   * @param {string|object} criteria - UUID string or object filter
   * @returns {Promise<boolean>}
   */
  async exists(criteria) {
    let query = this.db.from(this.tableName).select('id', { count: 'exact', head: true });

    if (typeof criteria === 'string') {
      query = query.eq('id', criteria);
    } else if (typeof criteria === 'object' && criteria !== null) {
      Object.entries(criteria).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          query = query.eq(key, val);
        }
      });
    }

    const { count, error } = await query;
    if (error) throw error;
    return (count || 0) > 0;
  }

  /**
   * Finds records with optional filtering, sorting, search, and pagination.
   * @param {object} options
   * @param {number} [options.page=1]
   * @param {number} [options.limit=20]
   * @param {string} [options.sort='created_at']
   * @param {string} [options.order='desc']
   * @param {string} [options.q='']
   * @param {object} [options.filters={}]
   * @returns {Promise<{ items: Array, pagination: object }>}
   */
  async findAll(options = {}) {
    return this.paginate(options);
  }

  /**
   * Paginated record retrieval helper.
   * @param {object} options
   * @returns {Promise<{ items: Array, pagination: object }>}
   */
  async paginate(options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(options.limit, 10) || 20));
    const sort = options.sort || 'created_at';
    const order = (options.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const q = (options.q || '').trim();
    const filters = options.filters || {};

    const offset = (page - 1) * limit;
    let query = this.db.from(this.tableName).select('*', { count: 'exact' });

    // Apply allowed field filters
    this.allowedFilters.forEach((filterKey) => {
      const value = filters[filterKey];
      if (value !== undefined && value !== null && value !== '') {
        // Handle numeric comparison filters like minimum confidence or trust_score if specified as range
        if (typeof value === 'object' && value.gte !== undefined) {
          query = query.gte(filterKey, value.gte);
        } else if (typeof value === 'object' && value.lte !== undefined) {
          query = query.lte(filterKey, value.lte);
        } else {
          query = query.eq(filterKey, value);
        }
      }
    });

    // Apply PostgreSQL ILIKE search across searchFields
    if (q && this.searchFields.length > 0) {
      const searchConditions = this.searchFields
        .map((field) => `${field}.ilike.%${q}%`)
        .join(',');
      query = query.or(searchConditions);
    }

    // Apply sorting and pagination limits
    query = query.order(sort, { ascending: order === 'asc' }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      items: data || [],
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Creates a new record in the database table.
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(data) {
    const { data: record, error } = await this.db
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return record;
  }

  /**
   * Updates an existing record by UUID.
   * @param {string} id
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(id, data) {
    const { data: record, error } = await this.db
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return record;
  }

  /**
   * Deletes a record by UUID.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const { error } = await this.db
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}
