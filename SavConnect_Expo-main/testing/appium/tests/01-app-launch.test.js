/**
 * Appium — App Launch Tests
 */
const { expect } = require('chai');
const { createAppiumDriver, quitAppiumDriver } = require('../../config/appium.config');
const LoginPageMobile = require('../page-objects/LoginPageMobile');
const { createTestResult, addResult } = require('../../utils/test-helpers');

describe('Appium 01 — App Launch', function () {
  this.timeout(120000);
  let driver, loginPage;

  before(async function () {
    try { driver = await createAppiumDriver(); loginPage = new LoginPageMobile(driver); }
    catch (e) { this.skip(); }
  });
  after(async function () { await quitAppiumDriver(driver); });

  it('APP-001: App launches and displays login screen', async function () {
    const start = Date.now();
    try {
      await loginPage.pause(5000);
      const visible = await loginPage.isBrandVisible();
      expect(visible).to.be.true;
      addResult(createTestResult('APP-001', 'App launches and displays login screen', 'Functional', 'appium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('APP-001', 'App launches and displays login screen', 'Functional', 'appium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('APP-002: App displays SavConnect branding', async function () {
    const start = Date.now();
    try {
      const visible = await loginPage.isBrandVisible();
      expect(visible).to.be.true;
      addResult(createTestResult('APP-002', 'App displays SavConnect branding', 'UI/UX', 'appium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('APP-002', 'App displays SavConnect branding', 'UI/UX', 'appium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
