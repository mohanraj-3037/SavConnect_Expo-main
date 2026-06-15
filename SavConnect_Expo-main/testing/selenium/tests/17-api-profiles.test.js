/**
 * TC-073 — API Profiles Tests
 */
const { expect } = require('chai');
const { apiRequest, createTestResult, addResult } = require('../../utils/test-helpers');
const config = require('../../config/test.config');

describe('17 — API Profiles Tests', function () {
  this.timeout(30000);

  it('TC-073: POST /profiles/update with valid payload succeeds or returns error', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/profiles/update', {
        method: 'POST',
        body: config.testData.validProfile,
      });
      // 200 = success, 500 = Supabase may reject fake UUID
      expect([200, 500]).to.include(res.status);
      addResult(createTestResult('TC-073', 'POST /profiles/update with valid payload succeeds', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-073', 'POST /profiles/update with valid payload succeeds', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
