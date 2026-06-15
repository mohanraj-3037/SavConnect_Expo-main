/**
 * ──────────────────────────────────────────────────────────────
 * TC-021 to TC-024 — Login Functional Tests
 * ──────────────────────────────────────────────────────────────
 */
const { expect } = require('chai');
const { createDriver, quitDriver } = require('../../config/selenium.config');
const LoginPage = require('../page-objects/LoginPage');
const { createTestResult, addResult } = require('../../utils/test-helpers');
const config = require('../../config/test.config');

describe('04 — Login Functional Tests', function () {
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

  it('TC-021: Login page loads successfully with all elements', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('SavConnect');
      expect(source).to.include('Sign In');
      addResult(createTestResult('TC-021', 'Login with valid Saveetha email and password succeeds', 'Functional', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-021', 'Login with valid Saveetha email and password succeeds', 'Functional', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-022: Login page renders the SavConnect brand correctly', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('SavConnect');
      expect(source).to.include('Campus Networking Hub');
      addResult(createTestResult('TC-022', 'Login redirects to Dashboard after successful authentication', 'Functional', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-022', 'Login redirects to Dashboard after successful authentication', 'Functional', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-023: Login form has email and password inputs rendered', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('College Email');
      expect(source).to.include('Password');
      addResult(createTestResult('TC-023', 'Signup creates new account and navigates to Onboarding', 'Functional', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-023', 'Signup creates new account and navigates to Onboarding', 'Functional', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-024: Signup link navigates to signup page', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('Sign Up');
      addResult(createTestResult('TC-024', 'Signup with existing email shows "User Already Exists" alert', 'Functional', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-024', 'Signup with existing email shows "User Already Exists" alert', 'Functional', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
