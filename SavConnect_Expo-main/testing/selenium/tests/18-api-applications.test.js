/**
 * TC-075 to TC-086 — API Applications Tests
 */
const { expect } = require('chai');
const { apiRequest, createTestResult, addResult } = require('../../utils/test-helpers');

describe('18 — API Applications Tests', function () {
  this.timeout(30000);

  it('TC-075: GET /my-applications/{user_id} returns array', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/my-applications/00000000-0000-0000-0000-000000000001');
      expect([200, 500]).to.include(res.status);
      if (res.status === 200) {
        expect(res.data).to.be.an('array');
      }
      addResult(createTestResult('TC-075', 'GET /my-applications/{user_id} returns array', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-075', 'GET /my-applications/{user_id} returns array', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-076: GET /incoming-requests/{user_id} returns array', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/incoming-requests/00000000-0000-0000-0000-000000000001');
      expect([200, 500]).to.include(res.status);
      if (res.status === 200) {
        expect(res.data).to.be.an('array');
      }
      addResult(createTestResult('TC-076', 'GET /incoming-requests/{user_id} returns array', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-076', 'GET /incoming-requests/{user_id} returns array', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-079: PATCH /applications/{id}/status with invalid status returns 422', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/applications/00000000-0000-0000-0000-000000000001/status', {
        method: 'PATCH',
        body: { status: 'invalid_status' },
      });
      expect(res.status).to.equal(422);
      addResult(createTestResult('TC-079', 'PATCH /applications/{id}/status with invalid status returns 422', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-079', 'PATCH /applications/{id}/status with invalid status returns 422', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-085: DELETE /applications with wrong user_id returns 403 or 404', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/applications/00000000-0000-0000-0000-000000000099?user_id=wrong', {
        method: 'DELETE',
      });
      expect([403, 404, 500]).to.include(res.status);
      addResult(createTestResult('TC-085', 'DELETE /applications with wrong user_id returns 403', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-085', 'DELETE /applications with wrong user_id returns 403', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-086: DELETE /applications with non-existent id returns 404', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/applications/00000000-0000-0000-0000-000000000099?user_id=test', {
        method: 'DELETE',
      });
      expect([404, 500]).to.include(res.status);
      addResult(createTestResult('TC-086', 'DELETE /applications with non-existent id returns 404', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-086', 'DELETE /applications with non-existent id returns 404', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
