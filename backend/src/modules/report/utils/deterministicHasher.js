import { createHash } from 'node:crypto';

/**
 * Computes a deterministic SHA-256 hash of any JavaScript object or string.
 * Ensures key ordering in objects is sorted to guarantee byte-identical hashes.
 *
 * @param {any} input
 * @returns {string} SHA-256 hex string
 */
export function computeDeterministicHash(input) {
  const normalizedString = stringifyDeterministic(input);
  return createHash('sha256').update(normalizedString, 'utf8').digest('hex');
}

/**
 * Deterministically stringifies JSON objects with sorted keys.
 *
 * @param {any} obj
 * @returns {string}
 */
export function stringifyDeterministic(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => stringifyDeterministic(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const kvPairs = sortedKeys.map(key => {
    return JSON.stringify(key) + ':' + stringifyDeterministic(obj[key]);
  });

  return '{' + kvPairs.join(',') + '}';
}
