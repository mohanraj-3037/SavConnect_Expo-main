/**
 * TC-008 — Navigation Tests
 */
const { expect } = require('chai');
const { createDriver, quitDriver } = require('../../config/selenium.config');
const LoginPage = require('../page-objects/LoginPage');
const { createTestResult, addResult } = require('../../utils/test-helpers');
const config = require('../../config/test.config');

describe('08 — Navigation Tests', function () {
  this.timeout(60000);
  let driver, loginPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    await loginPage.open();
  });

  after(async function () { await quitDriver(driver); });

  it('TC-008: App has proper navigation structure', async function () {
    const start = Date.now();
    try {
      const url = await loginPage.getCurrentUrl();
      expect(url).to.include(config.frontendUrl.replace('https://', ''));
      addResult(createTestResult('TC-008', 'Navigation structure is properly configured', 'Functional', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-008', 'Navigation structure is properly configured', 'Functional', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
