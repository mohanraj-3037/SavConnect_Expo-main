const { expect } = require('chai');
const { createAppiumDriver, quitAppiumDriver } = require('../../config/appium.config');
const LoginPageMobile = require('../page-objects/LoginPageMobile');
const { createTestResult, addResult } = require('../../utils/test-helpers');

describe('Appium 02 — Login Mobile', function () {
  this.timeout(120000);
  let driver, loginPage;
  before(async function () { try { driver = await createAppiumDriver(); loginPage = new LoginPageMobile(driver); } catch (e) { this.skip(); } });
  after(async function () { await quitAppiumDriver(driver); });

  it('APP-003: Login screen shows Welcome Back', async function () {
    const start = Date.now();
    try { await loginPage.pause(5000); const v = await loginPage.isLoginScreenVisible(); expect(v).to.be.true;
      addResult(createTestResult('APP-003', 'Login screen shows Welcome Back', 'UI/UX', 'appium', 'PASS', Date.now() - start));
    } catch (err) { addResult(createTestResult('APP-003', 'Login screen shows Welcome Back', 'UI/UX', 'appium', 'FAIL', Date.now() - start, err.message)); throw err; }
  });

  it('APP-004: Login screen has Sign Up link', async function () {
    const start = Date.now();
    try { const v = await loginPage.isTextDisplayed('Sign Up'); expect(v).to.be.true;
      addResult(createTestResult('APP-004', 'Login screen has Sign Up link', 'UI/UX', 'appium', 'PASS', Date.now() - start));
    } catch (err) { addResult(createTestResult('APP-004', 'Login screen has Sign Up link', 'UI/UX', 'appium', 'FAIL', Date.now() - start, err.message)); throw err; }
  });
});
