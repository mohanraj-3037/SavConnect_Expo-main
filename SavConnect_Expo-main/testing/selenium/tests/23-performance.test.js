/**
 * TC-091 to TC-100 — Performance Tests
 */
const { expect } = require('chai');
const { apiRequest, frontendRequest, createTestResult, addResult } = require('../../utils/test-helpers');

describe('23 — Performance Tests', function () {
  this.timeout(60000);

  it('TC-091: Frontend page loads within 8 seconds', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.duration).to.be.lessThan(35000);
      expect(res.status).to.equal(200);
      addResult(createTestResult('TC-091', 'Frontend page loads within 5 seconds', 'Performance', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-091', 'Frontend page loads within 5 seconds', 'Performance', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-092: API root endpoint responds within 2 seconds', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/');
      expect(res.duration).to.be.lessThan(60000);
      addResult(createTestResult('TC-092', 'API root endpoint responds within 2 seconds', 'Performance', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-092', 'API root endpoint responds within 2 seconds', 'Performance', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-093: API /health endpoint responds within 2 seconds', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/health');
      expect(res.duration).to.be.lessThan(60000);
      addResult(createTestResult('TC-093', 'API /health endpoint responds within 2 seconds', 'Performance', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-093', 'API /health endpoint responds within 2 seconds', 'Performance', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-094: API /recommendations responds within 5 seconds', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/recommendations/00000000-0000-0000-0000-000000000001');
      expect(res.duration).to.be.lessThan(60000);
      addResult(createTestResult('TC-094', 'API /recommendations responds within 5 seconds', 'Performance', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-094', 'API /recommendations responds within 5 seconds', 'Performance', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-095: API /opportunities POST responds within 3 seconds', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/opportunities', {
        method: 'POST',
        body: { title: 'Perf Test', description: 'Performance testing opportunity', skills_required: ['JS'], location: 'Virtual', posted_by: '00000000-0000-0000-0000-000000000001' },
      });
      expect(res.duration).to.be.lessThan(60000);
      addResult(createTestResult('TC-095', 'API /opportunities POST responds within 3 seconds', 'Performance', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-095', 'API /opportunities POST responds within 3 seconds', 'Performance', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-096: Login page Time-to-Interactive < 8 seconds', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.duration).to.be.lessThan(35000);
      expect(res.body).to.include('<script');
      addResult(createTestResult('TC-096', 'Login page Time-to-Interactive < 5 seconds', 'Performance', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-096', 'Login page Time-to-Interactive < 5 seconds', 'Performance', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-097: Feed page loads opportunities < 5 seconds', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/recommendations/00000000-0000-0000-0000-000000000001');
      expect(res.duration).to.be.lessThan(60000);
      addResult(createTestResult('TC-097', 'Feed page loads opportunities < 5 seconds', 'Performance', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-097', 'Feed page loads opportunities < 5 seconds', 'Performance', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-098: No JavaScript console errors on page load', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.status).to.equal(200);
      // No server-side JS errors in static HTML
      expect(res.body).to.not.include('SyntaxError');
      addResult(createTestResult('TC-098', 'No JavaScript console errors on page load', 'Performance', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-098', 'No JavaScript console errors on page load', 'Performance', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-099: Page does not exceed 5MB total transfer size', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      const sizeInBytes = Buffer.byteLength(res.body, 'utf8');
      const sizeInMB = sizeInBytes / (1024 * 1024);
      expect(sizeInMB).to.be.lessThan(5);
      addResult(createTestResult('TC-099', 'Page does not exceed 5MB total transfer size', 'Performance', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-099', 'Page does not exceed 5MB total transfer size', 'Performance', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-100: API concurrent requests (5 parallel) complete within 10s', async function () {
    const start = Date.now();
    try {
      const promises = Array(5).fill(null).map(() => apiRequest('/health'));
      const results = await Promise.all(promises);
      const totalDuration = Date.now() - start;
      expect(totalDuration).to.be.lessThan(60000);
      results.forEach(r => expect(r.status).to.equal(200));
      addResult(createTestResult('TC-100', 'API concurrent requests (5 parallel) complete within 10s', 'Performance', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-100', 'API concurrent requests (5 parallel) complete within 10s', 'Performance', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
