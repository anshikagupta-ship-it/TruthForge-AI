import { CreateQueryDto } from '../modules/queries/dto/create-query.dto.js';
import { CreateReportDto } from '../modules/reports/dto/create-report.dto.js';
import { CreateClaimDto } from '../modules/claims/dto/create-claim.dto.js';
import { CreateSourceDto } from '../modules/sources/dto/create-source.dto.js';
import { CreatePipelineRunDto } from '../modules/pipeline/dto/create-pipeline-run.dto.js';
import { validatePayload, isUUID } from '../utils/validator.util.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { NotFoundError, BadRequestError, ConflictError, ValidationError } from '../utils/errors.js';
import { BaseRepository } from '../common/repositories/base.repository.js';
import { BaseService } from '../common/services/base.service.js';
import { BaseController } from '../common/controllers/base.controller.js';

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
};

console.log('=== Running Foundational Backend Unit Tests ===\n');

// 1. Test DTOs
console.log('--- 1. Testing DTOs ---');
const queryDto = new CreateQueryDto({ query_text: 'Test Query', detected_domain: 'ai' });
assert(queryDto.query_text === 'Test Query' && queryDto.detected_domain === 'ai', 'CreateQueryDto assigns attributes correctly');

const reportDto = new CreateReportDto({ query_id: '00000000-0000-0000-0000-000000000000', report_status: 'completed' });
assert(reportDto.report_status === 'completed', 'CreateReportDto assigns status correctly');

const claimDto = new CreateClaimDto({ report_id: '00000000-0000-0000-0000-000000000000', claim_text: 'Test Claim', confidence: 0.9 });
assert(claimDto.confidence_score === 0.9, 'CreateClaimDto maps confidence alias correctly');

const sourceDto = new CreateSourceDto({ source_name: 'Test Source', source_url: 'https://example.com', source_type: 'journal' });
assert(sourceDto.source_name === 'Test Source', 'CreateSourceDto assigns fields correctly');

const pipelineDto = new CreatePipelineRunDto({ stage: 'scraped', status: 'in_progress' });
assert(pipelineDto.stage === 'scraped', 'CreatePipelineRunDto assigns stage correctly');

// 2. Test UUID and Validation Utility
console.log('\n--- 2. Testing Validation Utilities ---');
const validUUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
assert(isUUID(validUUID), 'isUUID correctly validates valid UUID');
assert(!isUUID('invalid-uuid-string'), 'isUUID rejects invalid string');

let validationFailed = false;
try {
  validatePayload({ status: 'invalid_status' }, { status: { enum: ['pending', 'completed'] } });
} catch (e) {
  validationFailed = e instanceof ValidationError;
}
assert(validationFailed, 'validatePayload throws ValidationError for invalid enum');

// 3. Test Errors
console.log('\n--- 3. Testing Error Classes ---');
const notFoundErr = new NotFoundError('Item missing');
assert(notFoundErr.statusCode === 404 && notFoundErr.message === 'Item missing', 'NotFoundError has status 404');

const conflictErr = new ConflictError('Duplicate key');
assert(conflictErr.statusCode === 409 && conflictErr.message === 'Duplicate key', 'ConflictError has status 409');

// 4. Test In-Memory Repository & Service Inheritance
console.log('\n--- 4. Testing Generic Repository, Service & Controller Abstraction ---');
class MemoryRepository extends BaseRepository {
  constructor() {
    super('mock_table', ['name'], ['status']);
    this.store = new Map();
  }

  async findById(id) {
    return this.store.get(id) || null;
  }

  async create(data) {
    const record = { id: validUUID, ...data, created_at: new Date().toISOString() };
    this.store.set(record.id, record);
    return record;
  }

  async update(id, data) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id) {
    this.store.delete(id);
    return true;
  }
}

const memRepo = new MemoryRepository();
const memService = new BaseService(memRepo, 'MockEntity');
const memController = new BaseController(memService, 'MockEntity');

const runAsyncTest = async () => {
  const created = await memService.create({ name: 'Test Record', status: 'active' });
  assert(created.id === validUUID, 'Generic BaseService creates record via repository');

  const found = await memService.findOne(validUUID);
  assert(found.name === 'Test Record', 'Generic BaseService finds record by ID');

  const updated = await memService.update(validUUID, { name: 'Updated Record' });
  assert(updated.name === 'Updated Record', 'Generic BaseService updates record');

  await memService.delete(validUUID);
  let deletedNotFound = false;
  try {
    await memService.findOne(validUUID);
  } catch (e) {
    deletedNotFound = e instanceof NotFoundError;
  }
  assert(deletedNotFound, 'Generic BaseService throws NotFoundError after deletion');

  console.log('\n🎉 ALL FOUNDATIONAL UNIT TESTS PASSED SUCCESSFULLY! 🎉');
};

runAsyncTest();
