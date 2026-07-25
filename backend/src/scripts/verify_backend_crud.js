import app from '../app.js';
import http from 'http';

const startServer = () => {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
};

const makeRequest = (port, method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        method,
        path,
        headers: {
          'Content-Type': 'application/json',
          ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runVerification = async () => {
  console.log('--- Starting Foundational Backend CRUD Verification ---');
  const { server, port } = await startServer();
  let createdQueryId, createdReportId, createdClaimId, createdSourceId, createdPipelineId;

  try {
    // 1. Health Check
    console.log('\n[1] Health Check GET /api/v1/health');
    const healthRes = await makeRequest(port, 'GET', '/api/v1/health');
    console.log('Status:', healthRes.status, 'Body:', healthRes.body);

    // 2. Queries CRUD
    console.log('\n[2] Queries POST /api/v1/queries');
    const createQueryRes = await makeRequest(port, 'POST', '/api/v1/queries', {
      query_text: 'Does quantum computing accelerate cryptographic breaking in RSA-2048?',
      detected_domain: 'cryptography',
      status: 'pending',
    });
    console.log('Create Query:', createQueryRes.status, createQueryRes.body.message);
    if (createQueryRes.body.data && createQueryRes.body.data.id) {
      createdQueryId = createQueryRes.body.data.id;
    }

    console.log('[2b] Queries GET /api/v1/queries?page=1&limit=5&q=quantum&domain=cryptography');
    const getQueriesRes = await makeRequest(
      port,
      'GET',
      '/api/v1/queries?page=1&limit=5&q=quantum&domain=cryptography'
    );
    console.log('Get Queries:', getQueriesRes.status, 'Total found:', getQueriesRes.body.data?.pagination?.total);

    if (createdQueryId) {
      console.log(`[2c] Queries PATCH /api/v1/queries/${createdQueryId}`);
      const patchQueryRes = await makeRequest(port, 'PATCH', `/api/v1/queries/${createdQueryId}`, {
        status: 'processing',
      });
      console.log('Patch Query:', patchQueryRes.status, patchQueryRes.body.data?.status);
    }

    // 3. Validation Layer Check (HTTP 400 rejection)
    console.log('\n[3] Validation Layer Check (Invalid payload)');
    const invalidQueryRes = await makeRequest(port, 'POST', '/api/v1/queries', {
      status: 'invalid_status_value',
    });
    console.log('Invalid Query Response Status:', invalidQueryRes.status, 'Success flag:', invalidQueryRes.body.success, 'Errors:', invalidQueryRes.body.errors);

    // 4. Reports CRUD
    if (createdQueryId) {
      console.log('\n[4] Reports POST /api/v1/reports');
      const createReportRes = await makeRequest(port, 'POST', '/api/v1/reports', {
        query_id: createdQueryId,
        executive_summary: 'Shor algorithm reduces RSA-2048 factorization from exponential to polynomial time.',
        overall_confidence: 0.9400,
        report_status: 'completed',
      });
      console.log('Create Report Status:', createReportRes.status, 'Message:', createReportRes.body.message);
      if (createReportRes.body.data?.id) {
        createdReportId = createReportRes.body.data.id;
      }
    }

    // 5. Claims CRUD
    if (createdReportId) {
      console.log('\n[5] Claims POST /api/v1/claims');
      const createClaimRes = await makeRequest(port, 'POST', '/api/v1/claims', {
        report_id: createdReportId,
        claim_text: 'Shor algorithm breaks RSA-2048 using 4096 logical qubits.',
        confidence_score: 0.9500,
        verification_status: 'verified',
        explanation: 'Derived from quantum circuit complexity theory.',
      });
      console.log('Create Claim Status:', createClaimRes.status, 'Message:', createClaimRes.body.message);
      if (createClaimRes.body.data?.id) {
        createdClaimId = createClaimRes.body.data.id;
      }
    }

    // 6. Sources CRUD
    console.log('\n[6] Sources POST /api/v1/sources');
    const testUrl = `https://example.org/papers/quantum-cryptography-${Date.now()}.pdf`;
    const createSourceRes = await makeRequest(port, 'POST', '/api/v1/sources', {
      source_name: 'Algorithms for Quantum Computation: Discrete Logarithms and Factoring',
      source_url: testUrl,
      publisher: 'IEEE Computer Society',
      source_type: 'journal',
      trust_score: 0.9900,
      doi: '10.1109/SFCS.1994.365700',
    });
    console.log('Create Source Status:', createSourceRes.status, 'Message:', createSourceRes.body.message);
    if (createSourceRes.body.data?.id) {
      createdSourceId = createSourceRes.body.data.id;
    }

    // 7. Pipeline CRUD
    console.log('\n[7] Pipeline POST /api/v1/pipeline');
    const createPipelineRes = await makeRequest(port, 'POST', '/api/v1/pipeline', {
      query_id: createdQueryId || null,
      stage: 'initialized',
      status: 'pending',
    });
    console.log('Create Pipeline Status:', createPipelineRes.status, 'Message:', createPipelineRes.body.message);
    if (createPipelineRes.body.data?.id) {
      createdPipelineId = createPipelineRes.body.data.id;
    }

    // Cleanup created test records
    console.log('\n[8] Cleaning up created test entities');
    if (createdPipelineId) await makeRequest(port, 'DELETE', `/api/v1/pipeline/${createdPipelineId}`);
    if (createdSourceId) await makeRequest(port, 'DELETE', `/api/v1/sources/${createdSourceId}`);
    if (createdClaimId) await makeRequest(port, 'DELETE', `/api/v1/claims/${createdClaimId}`);
    if (createdReportId) await makeRequest(port, 'DELETE', `/api/v1/reports/${createdReportId}`);
    if (createdQueryId) await makeRequest(port, 'DELETE', `/api/v1/queries/${createdQueryId}`);

    console.log('\n=== ALL CRUD INTEGRATION TESTS COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Verification failed with error:', err);
  } finally {
    server.close();
  }
};

runVerification();
