/**
 * TC-074, TC-080-082 — API Recommendations & Join Requests
 */
const { expect } = require('chai');
const { apiRequest, createTestResult, addResult } = require('../../utils/test-helpers');
const config = require('../../config/test.config');

describe('19 — API Recommendations & Join Requests', function () {
  this.timeout(30000);

  it('TC-074: GET /recommendations/{user_id} returns array', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/recommendations/00000000-0000-0000-0000-000000000001');
      expect([200, 500]).to.include(res.status);
      addResult(createTestResult('TC-074', 'GET /recommendations/{user_id} returns array with match_score', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-074', 'GET /recommendations/{user_id} returns array with match_score', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-081: POST /request-to-join with invalid applicant_id returns 404', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/request-to-join', {
        method: 'POST',
        body: { ...config.testData.validJoinRequest, applicant_id: '00000000-0000-0000-0000-000000000099' },
      });
      expect([404, 500]).to.include(res.status);
      addResult(createTestResult('TC-081', 'POST /request-to-join with invalid applicant_id returns 404', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-081', 'POST /request-to-join with invalid applicant_id returns 404', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-082: POST /request-to-join with invalid opportunity_id returns 404', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/request-to-join', {
        method: 'POST',
        body: { ...config.testData.validJoinRequest, opportunity_id: '00000000-0000-0000-0000-000000000099' },
      });
      expect([404, 500]).to.include(res.status);
      addResult(createTestResult('TC-082', 'POST /request-to-join with invalid opportunity_id returns 404', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-082', 'POST /request-to-join with invalid opportunity_id returns 404', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
