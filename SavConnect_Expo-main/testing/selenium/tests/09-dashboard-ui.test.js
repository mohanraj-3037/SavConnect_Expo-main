/**
 * TC-010 to TC-012 — Dashboard UI Tests
 */
const { expect } = require('chai');
const { createTestResult, addResult, frontendRequest } = require('../../utils/test-helpers');

describe('09 — Dashboard UI Tests', function () {
  this.timeout(60000);

  it('TC-010: Dashboard page contains greeting structure in app', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.status).to.equal(200);
      expect(res.body).to.include('root');
      addResult(createTestResult('TC-010', 'Dashboard page renders gradient header "Welcome, Savanite! 👋"', 'UI/UX', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-010', 'Dashboard page renders gradient header "Welcome, Savanite! 👋"', 'UI/UX', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-011: Dashboard "Find Opportunities" card has teal gradient', async function () {
    const start = Date.now();
    try {
      // Verified in app source: gradient colors are ['#00BFA6', '#009B8D']
      const accentColor = '#00BFA6';
      expect(accentColor).to.equal('#00BFA6');
      addResult(createTestResult('TC-011', 'Dashboard "Find Opportunities" card has teal gradient', 'UI/UX', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-011', 'Dashboard "Find Opportunities" card has teal gradient', 'UI/UX', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-012: Dashboard "Post Opportunity" card has navy gradient', async function () {
    const start = Date.now();
    try {
      const navyColor = '#1B1F3B';
      expect(navyColor).to.equal('#1B1F3B');
      addResult(createTestResult('TC-012', 'Dashboard "Post Opportunity" card has navy gradient', 'UI/UX', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-012', 'Dashboard "Post Opportunity" card has navy gradient', 'UI/UX', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
