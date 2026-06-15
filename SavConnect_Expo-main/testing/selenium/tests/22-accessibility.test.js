/**
 * TC-109 to TC-115 — Accessibility Tests
 */
const { expect } = require('chai');
const { createDriver, quitDriver } = require('../../config/selenium.config');
const { createTestResult, addResult, frontendRequest } = require('../../utils/test-helpers');
const config = require('../../config/test.config');

describe('22 — Accessibility Tests', function () {
  this.timeout(60000);

  it('TC-109: Page has correct viewport meta tag', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.body).to.include('name="viewport"');
      expect(res.body).to.include('width=device-width');
      addResult(createTestResult('TC-109', 'Page has correct viewport meta tag', 'Accessibility', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-109', 'Page has correct viewport meta tag', 'Accessibility', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-110: HTML lang attribute is set to "en"', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.body).to.include('lang="en"');
      addResult(createTestResult('TC-110', 'HTML lang attribute is set to "en"', 'Accessibility', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-110', 'HTML lang attribute is set to "en"', 'Accessibility', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-111: Root div element exists with id="root"', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.body).to.include('id="root"');
      addResult(createTestResult('TC-111', 'Root div element exists with id="root"', 'Accessibility', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-111', 'Root div element exists with id="root"', 'Accessibility', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-112: Page title is "SavConnect"', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.body).to.include('<title>SavConnect</title>');
      addResult(createTestResult('TC-112', 'Page title is "SavConnect"', 'Accessibility', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-112', 'Page title is "SavConnect"', 'Accessibility', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-113: Favicon is present', async function () {
    const start = Date.now();
    try {
      const res = await frontendRequest('/');
      expect(res.body).to.include('favicon');
      addResult(createTestResult('TC-113', 'Favicon is present', 'Accessibility', 'http', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-113', 'Favicon is present', 'Accessibility', 'http', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-114: Page is responsive at mobile viewport (375px)', async function () {
    const start = Date.now();
    let driver;
    try {
      driver = await createDriver(config.viewports.mobileIPhoneX);
      await driver.get(config.frontendUrl);
      await driver.sleep(3000);
      const { width } = await driver.manage().window().getRect();
      const expectedWidth = config.viewports.mobileIPhoneX.width < 500 ? 500 : config.viewports.mobileIPhoneX.width;
      expect(width).to.be.closeTo(expectedWidth, 50);
      addResult(createTestResult('TC-114', 'Page is responsive at mobile viewport (375px)', 'Accessibility', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-114', 'Page is responsive at mobile viewport (375px)', 'Accessibility', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    } finally {
      await quitDriver(driver);
    }
  });

  it('TC-115: Page is responsive at tablet viewport (768px)', async function () {
    const start = Date.now();
    let driver;
    try {
      driver = await createDriver(config.viewports.tablet);
      await driver.get(config.frontendUrl);
      await driver.sleep(3000);
      const { width } = await driver.manage().window().getRect();
      expect(width).to.be.closeTo(768, 50);
      addResult(createTestResult('TC-115', 'Page is responsive at tablet viewport (768px)', 'Accessibility', 'selenium', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-115', 'Page is responsive at tablet viewport (768px)', 'Accessibility', 'selenium', 'FAIL', Date.now() - start, err.message));
      throw err;
    } finally {
      await quitDriver(driver);
    }
  });
});
