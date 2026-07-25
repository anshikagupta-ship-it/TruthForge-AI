/**
 * Utilities for CSV header and row validation.
 */

const REQUIRED_HEADERS = ['query', 'source_url', 'semantic_score', 'score', 'text'];

/**
 * Validates header array from CSV.
 * @param {string[]} headers
 * @returns {{ isValid: boolean, missingHeaders: string[] }}
 */
export function validateHeaders(headers) {
  if (!Array.isArray(headers) || headers.length === 0) {
    return { isValid: false, missingHeaders: REQUIRED_HEADERS };
  }

  const normalizedHeaders = headers.map((h) => String(h).trim().toLowerCase());
  const missingHeaders = REQUIRED_HEADERS.filter((req) => !normalizedHeaders.includes(req));

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
  };
}

/**
 * Validates a single CSV record row against business rules.
 * @param {Object} row - Object mapping column names to string values
 * @returns {{ isValid: boolean, reason?: string, data?: Object, isEmpty?: boolean }}
 */
export function validateRow(row) {
  if (!row || typeof row !== 'object') {
    return { isValid: false, reason: 'Invalid row format' };
  }

  const query = row.query !== undefined ? String(row.query).trim() : '';
  const sourceUrl = row.source_url !== undefined ? String(row.source_url).trim() : '';
  const semanticScoreStr = row.semantic_score !== undefined ? String(row.semantic_score).trim() : '';
  const scoreStr = row.score !== undefined ? String(row.score).trim() : '';
  const bonusStr = row.bonus !== undefined ? String(row.bonus).trim() : '';
  const text = row.text !== undefined ? String(row.text).trim() : '';

  // Check if row is completely empty
  if (!query && !sourceUrl && !semanticScoreStr && !scoreStr && !text && !bonusStr) {
    return { isValid: false, reason: 'Empty row', isEmpty: true };
  }

  // Validate Query
  if (!query) {
    return { isValid: false, reason: 'Missing or empty query' };
  }
  if (query.length > 500) {
    return { isValid: false, reason: 'Query exceeds max length of 500 characters' };
  }

  // Validate Source URL
  if (!sourceUrl) {
    return { isValid: false, reason: 'Missing source_url' };
  }
  try {
    const parsedUrl = new URL(sourceUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { isValid: false, reason: 'Invalid URL protocol (must be http or https)' };
    }
  } catch {
    return { isValid: false, reason: 'Invalid URL' };
  }

  // Validate Semantic Score
  if (!semanticScoreStr) {
    return { isValid: false, reason: 'Missing semantic_score' };
  }
  const semanticScore = Number(semanticScoreStr);
  if (Number.isNaN(semanticScore) || semanticScore < 0 || semanticScore > 1) {
    return { isValid: false, reason: 'Invalid semantic_score (must be a number between 0 and 1)' };
  }

  // Validate Retrieval Score
  if (!scoreStr) {
    return { isValid: false, reason: 'Missing score' };
  }
  const retrievalScore = Number(scoreStr);
  if (Number.isNaN(retrievalScore) || retrievalScore < 0 || retrievalScore > 1) {
    return { isValid: false, reason: 'Invalid score (must be a number between 0 and 1)' };
  }

  // Validate Bonus Score (Optional, defaults to 0)
  let bonus = 0;
  if (bonusStr !== '') {
    bonus = Number(bonusStr);
    if (Number.isNaN(bonus)) {
      return { isValid: false, reason: 'Invalid bonus (must be numeric)' };
    }
  }

  // Validate Text
  if (!text) {
    return { isValid: false, reason: 'Empty text' };
  }

  return {
    isValid: true,
    data: {
      query,
      sourceUrl,
      semanticScore,
      retrievalScore,
      bonus,
      text,
    },
  };
}
