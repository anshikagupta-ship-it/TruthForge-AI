/**
 * Lineage Utilities & Helper Functions
 */

import crypto from 'crypto';

/**
 * Generate a deterministic node ID for a given entity type and raw entity ID
 * @param {string} type - "Claim" | "Evidence" | "Source" | "SourceProfile"
 * @param {string} entityId - Raw string ID or URL
 * @returns {string}
 */
export function generateNodeId(type, entityId) {
  if (!type || !entityId) {
    throw new Error('generateNodeId requires type and entityId');
  }
  const cleanId = String(entityId).trim().toLowerCase();
  if (type === 'Source') {
    // Produce deterministic hash for long/complex source URLs
    const urlHash = crypto.createHash('sha256').update(cleanId).digest('hex').substring(0, 12);
    return `node:source:${urlHash}`;
  }
  return `node:${type.toLowerCase()}:${cleanId}`;
}

/**
 * Generate a deterministic edge ID between tail and head nodes
 * @param {string} sourceNodeId - Tail node ID
 * @param {string} targetNodeId - Head node ID
 * @param {string} type - "SUPPORTED_BY" | "CONTRADICTED_BY" | "FROM" | "HAS_PROFILE"
 * @returns {string}
 */
export function generateEdgeId(sourceNodeId, targetNodeId, type) {
  return `edge:${sourceNodeId}__${type}__${targetNodeId}`;
}

/**
 * Recursively freeze an object to guarantee immutability
 * @template T
 * @param {T} obj
 * @returns {Readonly<T>}
 */
export function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      Object.prototype.hasOwnProperty.call(obj, prop) &&
      obj[prop] !== null &&
      (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
      !Object.isFrozen(obj[prop])
    ) {
      deepFreeze(obj[prop]);
    }
  });
  return obj;
}

/**
 * Deterministically serialize any JavaScript value / object to canonical JSON string
 * @param {any} value
 * @returns {string}
 */
export function canonicalJsonStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJsonStringify).join(',') + ']';
  }
  const sortedKeys = Object.keys(value).sort();
  const pairs = sortedKeys.map((key) => `${JSON.stringify(key)}:${canonicalJsonStringify(value[key])}`);
  return '{' + pairs.join(',') + '}';
}
