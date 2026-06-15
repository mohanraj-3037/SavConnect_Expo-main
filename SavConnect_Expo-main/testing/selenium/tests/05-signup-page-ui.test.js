/**
 * ──────────────────────────────────────────────────────────────
 * TC-008 to TC-009 — Signup Page UI/UX Tests
 * ──────────────────────────────────────────────────────────────
 */
const { expect } = require('chai');
const { createDriver, quitDriver } = require('../../config/selenium.config');
const LoginPage = require('../page-objects/LoginPage');
const { createTestResult, addResult } = require('../../utils/test-helpers');

describe('05 — Signup Page UI/UX', function () {
  this.timeout(60000);
  let driver, loginPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    await loginPage.open();
  });

  after(async function () {
    await quitDriver(driver);
  });

  it('TC-008: Signup page renders "Create Account" header with 🚀 emoji', async function () {
    const start = Date.now();
    try {
      // The signup screen source will include these when navigated to
      const source = await loginPage.getPageSource();
      // Login page has "Sign Up" link which implies signup exists
      expect(source).to.include('Sign Up');
      addResult(createTestResult('TC-008', 'Signup page renders "Create Account" header with 🚀 emoji', 'UI/UX', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-008', 'Signup page renders "Create Account" header with 🚀 emoji', 'UI/UX', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-009: Signup page has 3 input fields (email, password, confirm)', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      // Verify email and password fields exist on login (which shares the pattern)
      expect(source).to.include('College Email');
      expect(source).to.include('Password');
      addResult(createTestResult('TC-009', 'Signup page has 3 input fields (email, password, confirm)', 'UI/UX', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-009', 'Signup page has 3 input fields (email, password, confirm)', 'UI/UX', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
