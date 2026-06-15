/**
 * ──────────────────────────────────────────────────────────────
 * TC-121 to TC-125 — Deployable Status / Health Check Tests
 * ──────────────────────────────────────────────────────────────
 */
const { expect } = require('chai');
const { apiRequest, frontendRequest, createTestResult, addResult } = require('../../utils/test-helpers');

describe('01 — Health Check & Deployable Status', function () {
  this.timeout(60000);

  it('TC-121: Frontend Vercel deployment is accessible (HTTP 200)', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.status).to.equal(200);
      addResult(createTestResult('TC-121', 'Frontend Vercel deployment is accessible (HTTP 200)', 'Deployable', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-121', 'Frontend Vercel deployment is accessible (HTTP 200)', 'Deployable', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-122: Backend Railway deployment is accessible (HTTP 200)', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/');
      expect(res.status).to.equal(200);
      addResult(createTestResult('TC-122', 'Backend Railway deployment is accessible (HTTP 200)', 'Deployable', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-122', 'Backend Railway deployment is accessible (HTTP 200)', 'Deployable', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-123: Frontend serves valid HTML with root element', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.body).to.include('<div id="root">');
      expect(res.body).to.include('<!DOCTYPE html>');
      addResult(createTestResult('TC-123', 'Frontend serves valid HTML with root element', 'Deployable', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-123', 'Frontend serves valid HTML with root element', 'Deployable', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-124: Backend returns valid JSON on root endpoint', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/');
      expect(res.data).to.be.an('object');
      expect(res.data).to.have.property('status', 'ok');
      expect(res.data).to.have.property('message', 'Welcome to the PDD FastAPI Backend');
      addResult(createTestResult('TC-124', 'Backend returns valid JSON on root endpoint', 'Deployable', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-124', 'Backend returns valid JSON on root endpoint', 'Deployable', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-125: Frontend-to-Backend connectivity works (health check)', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/health');
      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('status', 'ok');
      expect(res.data).to.have.property('message', 'Backend is healthy');
      addResult(createTestResult('TC-125', 'Frontend-to-Backend connectivity works (health check)', 'Deployable', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-125', 'Frontend-to-Backend connectivity works (health check)', 'Deployable', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
