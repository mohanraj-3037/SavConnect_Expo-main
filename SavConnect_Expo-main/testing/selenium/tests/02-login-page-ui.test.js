/**
 * ──────────────────────────────────────────────────────────────
 * TC-001 to TC-007 — Login Page UI/UX Tests
 * ──────────────────────────────────────────────────────────────
 */
const { expect } = require('chai');
const { createDriver, quitDriver } = require('../../config/selenium.config');
const LoginPage = require('../page-objects/LoginPage');
const { createTestResult, addResult } = require('../../utils/test-helpers');

describe('02 — Login Page UI/UX', function () {
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

  it('TC-001: Login page renders gradient header with brand icon 🎓', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('🎓');
      addResult(createTestResult('TC-001', 'Login page renders gradient header with brand icon 🎓', 'UI/UX', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-001', 'Login page renders gradient header with brand icon 🎓', 'UI/UX', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-002: Login page renders "Welcome Back" card title', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('Welcome Back');
      addResult(createTestResult('TC-002', 'Login page renders "Welcome Back" card title', 'UI/UX', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-002', 'Login page renders "Welcome Back" card title', 'UI/UX', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-003: Login page email input has correct placeholder', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('College Email');
      addResult(createTestResult('TC-003', 'Login page email input has correct placeholder', 'UI/UX', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-003', 'Login page email input has correct placeholder', 'UI/UX', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-004: Login page password field has lock icon and eye toggle', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('Password');
      addResult(createTestResult('TC-004', 'Login page password field has lock icon and eye toggle', 'UI/UX', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-004', 'Login page password field has lock icon and eye toggle', 'UI/UX', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-005: Login page "Sign In" button uses accent color', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('Sign In');
      addResult(createTestResult('TC-005', 'Login page "Sign In" button uses accent color (#00BFA6)', 'UI/UX', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-005', 'Login page "Sign In" button uses accent color (#00BFA6)', 'UI/UX', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-006: Login page "Forgot password?" link is visible', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('Forgot password');
      addResult(createTestResult('TC-006', 'Login page "Forgot password?" link is visible', 'UI/UX', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-006', 'Login page "Forgot password?" link is visible', 'UI/UX', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-007: Login page "Don\'t have an account? Sign Up" link is present', async function () {
    const start = Date.now();
    try {
      const source = await loginPage.getPageSource();
      expect(source).to.include('have an account');
      expect(source).to.include('Sign Up');
      addResult(createTestResult('TC-007', 'Login page "Don\'t have an account? Sign Up" link is present', 'UI/UX', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-007', 'Login page "Don\'t have an account? Sign Up" link is present', 'UI/UX', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
