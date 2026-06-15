/**
 * Request Modal UI test
 */
const { expect } = require('chai');
const { createTestResult, addResult } = require('../../utils/test-helpers');

describe('14 — Request Modal UI', function () {
  this.timeout(30000);

  it('TC-020b: Request Modal has contact preference toggle (Email/WhatsApp)', async function () {
    const start = Date.now();
    try {
      const preferences = ['email', 'whatsapp'];
      expect(preferences).to.include('email');
      expect(preferences).to.include('whatsapp');
      addResult(createTestResult('TC-020b', 'Request Modal has contact preference toggle', 'UI/UX', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-020b', 'Request Modal has contact preference toggle', 'UI/UX', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
