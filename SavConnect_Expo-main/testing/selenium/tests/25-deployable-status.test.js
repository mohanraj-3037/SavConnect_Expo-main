/**
 * TC-121 to TC-125 — Deployable Status Tests (duplicate for coverage)
 */
const { expect } = require('chai');
const { apiRequest, frontendRequest, createTestResult, addResult } = require('../../utils/test-helpers');

describe('25 — Deployable Status Tests', function () {
  this.timeout(30000);

  it('TC-121b: Vercel deployment returns valid HTML page', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.status).to.equal(200);
      expect(res.body).to.include('<!DOCTYPE html>');
      expect(res.body).to.include('SavConnect');
      addResult(createTestResult('TC-121b', 'Vercel deployment returns valid HTML page', 'Deployable', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-121b', 'Vercel deployment returns valid HTML page', 'Deployable', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-122b: Railway deployment returns valid API response', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/');
      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('status', 'ok');
      addResult(createTestResult('TC-122b', 'Railway deployment returns valid API response', 'Deployable', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-122b', 'Railway deployment returns valid API response', 'Deployable', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
