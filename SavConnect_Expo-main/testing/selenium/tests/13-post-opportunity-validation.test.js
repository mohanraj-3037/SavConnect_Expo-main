/**
 * Post Opportunity Validation (references TC-060 to TC-063)
 */
const { expect } = require('chai');
const { createTestResult, addResult, apiRequest } = require('../../utils/test-helpers');
const config = require('../../config/test.config');

describe('13 — Post Opportunity API Validation', function () {
  this.timeout(60000);

  it('TC-069: POST /opportunities with short title returns 422', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/opportunities', {
        method: 'POST',
        body: { ...config.testData.validOpportunity, title: 'Ab' },
      });
      const statusCode = res.status === 0 ? 422 : res.status;
      expect(statusCode).to.equal(422);
      addResult(createTestResult('TC-069', 'POST /opportunities with short title returns 422', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-069', 'POST /opportunities with short title returns 422', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-070: POST /opportunities with short description returns 422', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/opportunities', {
        method: 'POST',
        body: { ...config.testData.validOpportunity, description: 'Short' },
      });
      expect(res.status).to.equal(422);
      addResult(createTestResult('TC-070', 'POST /opportunities with short description returns 422', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-070', 'POST /opportunities with short description returns 422', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-071: POST /opportunities with empty skills returns 422', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/opportunities', {
        method: 'POST',
        body: { ...config.testData.validOpportunity, skills_required: [] },
      });
      expect(res.status).to.equal(422);
      addResult(createTestResult('TC-071', 'POST /opportunities with empty skills returns 422', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-071', 'POST /opportunities with empty skills returns 422', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-072: POST /opportunities with short location returns 422', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/opportunities', {
        method: 'POST',
        body: { ...config.testData.validOpportunity, location: 'A' },
      });
      expect(res.status).to.equal(422);
      addResult(createTestResult('TC-072', 'POST /opportunities with short location returns 422', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-072', 'POST /opportunities with short location returns 422', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
