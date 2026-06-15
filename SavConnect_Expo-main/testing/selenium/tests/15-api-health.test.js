/**
 * TC-066, TC-067 — API Health Tests
 */
const { expect } = require('chai');
const { apiRequest, createTestResult, addResult } = require('../../utils/test-helpers');

describe('15 — API Health Tests', function () {
  this.timeout(30000);

  it('TC-066: GET / returns {"status":"ok"}', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/');
      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('status', 'ok');
      addResult(createTestResult('TC-066', 'GET / returns {"status":"ok"}', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-066', 'GET / returns {"status":"ok"}', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-067: GET /health returns {"status":"ok","message":"Backend is healthy"}', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/health');
      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('status', 'ok');
      expect(res.data).to.have.property('message', 'Backend is healthy');
      addResult(createTestResult('TC-067', 'GET /health returns healthy message', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-067', 'GET /health returns healthy message', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-088: API responds with JSON content-type', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/');
      expect(res.headers['content-type']).to.include('application/json');
      addResult(createTestResult('TC-088', 'API responds with JSON content-type', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-088', 'API responds with JSON content-type', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
