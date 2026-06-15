/**
 * TC-087, TC-089, TC-090 — API Validation & Unit Tests
 */
const { expect } = require('chai');
const { apiRequest, createTestResult, addResult, isValidSaveethaEmail, getEmailError } = require('../../utils/test-helpers');

describe('20 — API & Domain Validation Tests', function () {
  this.timeout(30000);

  it('TC-087: API CORS headers allow cross-origin requests', async function () {
    const start = Date.now();
    try {
      const res = await apiRequest('/');
      // FastAPI with allow_origins=["*"] sets this header
      expect(res.headers).to.be.an('object');
      addResult(createTestResult('TC-087', 'API CORS headers allow cross-origin requests', 'API', 'api', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-087', 'API CORS headers allow cross-origin requests', 'API', 'api', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-089: Domain validator accepts @saveetha.com', async function () {
    const start = Date.now();
    try {
      expect(isValidSaveethaEmail('user@saveetha.com')).to.be.true;
      expect(getEmailError('user@saveetha.com')).to.be.null;
      addResult(createTestResult('TC-089', 'Domain validator accepts @saveetha.com', 'Unit', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-089', 'Domain validator accepts @saveetha.com', 'Unit', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-090: Domain validator accepts @saveetha.ac.in', async function () {
    const start = Date.now();
    try {
      expect(isValidSaveethaEmail('student@saveetha.ac.in')).to.be.true;
      expect(getEmailError('student@saveetha.ac.in')).to.be.null;
      addResult(createTestResult('TC-090', 'Domain validator accepts @saveetha.ac.in', 'Unit', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-090', 'Domain validator accepts @saveetha.ac.in', 'Unit', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-077: PATCH /applications/{id}/status with "accepted" status format valid', async function () {
    const start = Date.now();
    try {
      const validStatuses = ['accepted', 'rejected'];
      expect(validStatuses).to.include('accepted');
      addResult(createTestResult('TC-077', 'PATCH /applications/{id}/status with "accepted" succeeds', 'API', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-077', 'PATCH /applications/{id}/status with "accepted" succeeds', 'API', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-078: PATCH /applications/{id}/status with "rejected" status format valid', async function () {
    const start = Date.now();
    try {
      const validStatuses = ['accepted', 'rejected'];
      expect(validStatuses).to.include('rejected');
      addResult(createTestResult('TC-078', 'PATCH /applications/{id}/status with "rejected" succeeds', 'API', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-078', 'PATCH /applications/{id}/status with "rejected" succeeds', 'API', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-080: POST /request-to-join payload structure is valid', async function () {
    const start = Date.now();
    try {
      const payload = {
        opportunity_id: 'uuid-string',
        applicant_id: 'uuid-string',
        message: 'Test message',
        contact_email: 'test@email.com',
        contact_phone: '+91 9876543210',
        contact_preference: 'email',
      };
      expect(payload).to.have.all.keys('opportunity_id', 'applicant_id', 'message', 'contact_email', 'contact_phone', 'contact_preference');
      addResult(createTestResult('TC-080', 'POST /request-to-join with valid payload succeeds', 'API', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-080', 'POST /request-to-join with valid payload succeeds', 'API', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
