import { Readable } from 'node:stream';
import { createReadStream, statSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { EvidenceModel } from '../models/evidence.model.js';
import { validateHeaders, validateRow } from '../utils/csvValidator.js';
import { logger } from '../../../utils/logger.js';
import { BadRequestError } from '../../../utils/errors.js';

/**
 * Structured logger helper following the required JSON event format.
 * @param {string} event
 * @param {Object} [meta={}]
 */
function logIngestionEvent(event, meta = {}) {
  const logPayload = {
    stage: 'Evidence Ingestion',
    event,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  logger.info(`[${logPayload.stage}] [${event}]`, logPayload);
}

/**
 * Helper to split a CSV line considering quoted values.
 * Handles commas inside quotes and escaped quotes ("").
 * @param {string} line
 * @returns {string[]}
 */
export function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Streaming CSV Parser for Evidence Ingestion.
 * Converts CSV stream into a normalized EvidenceBatch object enriched with pipelineContext and diagnostic skipped rows.
 *
 * @param {Readable|Buffer|string} input - Input CSV stream, buffer, or string/file path
 * @param {Object} [options={}]
 * @param {string} [options.filename='retrieval_evidence.csv']
 * @param {string} [options.pipelineRunId]
 * @param {string} [options.retrievalModel]
 * @param {Date|string} [options.generatedAt]
 * @param {number} [options.retrievalExecutionTime]
 * @returns {Promise<{ evidenceBatch: Object }>}
 */
export async function parseCsvStream(input, options = {}) {
  const startTime = Date.now();
  const filename = options.filename || 'retrieval_evidence.csv';

  logIngestionEvent('CSV_STARTED', { filename });

  let inputStream;
  let rawBufferForChecksum = null;

  if (typeof input === 'string') {
    if (input.endsWith('.csv') || input.includes('/') || input.includes('\\')) {
      try {
        statSync(input);
        inputStream = createReadStream(input);
      } catch {
        rawBufferForChecksum = Buffer.from(input, 'utf-8');
        inputStream = Readable.from([input]);
      }
    } else {
      rawBufferForChecksum = Buffer.from(input, 'utf-8');
      inputStream = Readable.from([input]);
    }
  } else if (Buffer.isBuffer(input)) {
    rawBufferForChecksum = input;
    inputStream = Readable.from(input);
  } else if (input && typeof input.pipe === 'function') {
    inputStream = input;
  } else {
    throw new BadRequestError('Invalid CSV input source provided');
  }

  const readlineInterface = createInterface({
    input: inputStream,
    crlfDelay: Infinity,
  });

  let totalRows = 0;
  let validRows = 0;
  let skippedRows = 0;
  let duplicateRows = 0;

  const evidences = [];
  const skippedRowsDetails = [];
  const seenHashes = new Set();

  let headers = null;
  let rowNumber = 0;
  let pendingQuotedLine = '';
  let primaryQuery = '';

  const hashStream = createHash('sha256');

  for await (const rawLine of readlineInterface) {
    if (rawBufferForChecksum === null) {
      hashStream.update(rawLine + '\n');
    }

    const currentLine = pendingQuotedLine ? pendingQuotedLine + '\n' + rawLine : rawLine;
    const quoteCount = (currentLine.match(/"/g) || []).length;

    if (quoteCount % 2 !== 0) {
      pendingQuotedLine = currentLine;
      continue;
    }
    pendingQuotedLine = '';

    const trimmedLine = currentLine.trim();
    if (!trimmedLine) continue;

    rowNumber++;

    if (!headers) {
      headers = parseCsvLine(currentLine).map((h) => h.trim().replace(/^"|"$/g, ''));
      const headerValidation = validateHeaders(headers);

      if (!headerValidation.isValid) {
        logIngestionEvent('INVALID_HEADERS', {
          missingHeaders: headerValidation.missingHeaders,
        });
        throw new BadRequestError(
          `Invalid CSV headers: missing required column(s): ${headerValidation.missingHeaders.join(', ')}`
        );
      }
      continue;
    }

    totalRows++;
    const rawValues = parseCsvLine(currentLine);
    const rowObject = {};

    headers.forEach((header, index) => {
      rowObject[header.toLowerCase()] = rawValues[index] ? rawValues[index].replace(/^"|"$/g, '') : '';
    });

    const validation = validateRow(rowObject);

    if (!validation.isValid) {
      if (!validation.isEmpty) {
        skippedRows++;
        const reason = validation.reason || 'Validation failed';
        const reasonStr = `Row ${rowNumber} skipped - Reason: ${reason}`;

        skippedRowsDetails.push({
          rowNumber,
          reason,
          rawRow: rowObject,
        });

        logIngestionEvent('ROW_SKIPPED', {
          rowNumber,
          reason: reasonStr,
        });
      }
      continue;
    }

    const { query, sourceUrl, semanticScore, retrievalScore, bonus, text } = validation.data;
    if (!primaryQuery) {
      primaryQuery = query;
    }

    const duplicateKey = `${query.toLowerCase()}::${sourceUrl.toLowerCase()}::${text.toLowerCase()}`;

    if (seenHashes.has(duplicateKey)) {
      skippedRows++;
      duplicateRows++;
      const reason = 'Duplicate row';
      const reasonStr = `Row ${rowNumber} skipped - Reason: Duplicate row`;

      skippedRowsDetails.push({
        rowNumber,
        reason,
        rawRow: rowObject,
      });

      logIngestionEvent('DUPLICATE_REMOVED', {
        rowNumber,
        reason: reasonStr,
      });
      continue;
    }

    seenHashes.add(duplicateKey);
    validRows++;

    const evidenceModel = new EvidenceModel({
      query,
      sourceUrl,
      semanticScore,
      retrievalScore,
      bonus,
      text,
      rowNumber,
    });

    evidences.push(evidenceModel);
  }

  if (!headers) {
    logIngestionEvent('EMPTY_CSV', { filename });
    throw new BadRequestError('Empty CSV file provided');
  }

  const processingTimeMs = Date.now() - startTime;
  const checksum = rawBufferForChecksum
    ? createHash('sha256').update(rawBufferForChecksum).digest('hex')
    : hashStream.digest('hex');

  logIngestionEvent('CSV_COMPLETED', {
    filename,
    totalRows,
    validRows,
    skippedRows,
    duplicateRows,
    processingTimeMs,
  });

  const pipelineContext = {
    pipelineRunId: options.pipelineRunId || `run_${Date.now()}`,
    query: primaryQuery,
    retrievalModel: options.retrievalModel || 'RetrievalModel-v1',
    generatedAt: options.generatedAt ? new Date(options.generatedAt) : new Date(),
    retrievalExecutionTime: Number(options.retrievalExecutionTime) || 0,
  };

  const evidenceBatch = {
    pipelineContext,
    totalRows,
    validRows,
    skippedRows,
    duplicateRows,
    processingTimeMs,
    fileMetadata: {
      filename,
      checksum,
      encoding: 'utf-8',
      importedAt: new Date(),
    },
    skippedRowsDetails,
    evidences: evidences.map((e) => e.toJSON()),
  };

  return {
    evidenceBatch,
  };
}
