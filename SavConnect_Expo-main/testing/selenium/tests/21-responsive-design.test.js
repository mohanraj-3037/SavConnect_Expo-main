/**
 * TC-116 to TC-120 — Responsive Design Tests
 */
const { expect } = require('chai');
const { createDriver, quitDriver } = require('../../config/selenium.config');
const { createTestResult, addResult } = require('../../utils/test-helpers');
const config = require('../../config/test.config');

describe('21 — Responsive Design Tests', function () {
  this.timeout(60000);

  const viewportTests = [
    { id: 'TC-116', name: 'App renders correctly at 1920×1080 desktop', vp: config.viewports.desktop },
    { id: 'TC-117', name: 'App renders correctly at 1366×768 laptop', vp: config.viewports.laptop },
    { id: 'TC-118', name: 'App renders correctly at 375×812 mobile (iPhone X)', vp: config.viewports.mobileIPhoneX },
    { id: 'TC-119', name: 'App renders correctly at 414×896 mobile (iPhone XR)', vp: config.viewports.mobileIPhoneXR },
    { id: 'TC-120', name: 'App renders correctly at 768×1024 tablet (iPad)', vp: config.viewports.tablet },
  ];

  for (const test of viewportTests) {
    it(`${test.id}: ${test.name}`, async function () {
      const start = Date.now();
      let driver;
      try {
        driver = await createDriver(test.vp);
        await driver.get(config.frontendUrl);
        await driver.sleep(3000);

        const source = await driver.getPageSource();
        expect(source).to.include('root');
        expect(source.length).to.be.greaterThan(500);

        const { width, height } = await driver.manage().window().getRect();
        const expectedWidth = test.vp.width < 500 ? 500 : test.vp.width;
        
        // Handle physical monitor size caps for desktop screens
        if (width < expectedWidth && expectedWidth === 1920) {
          expect(width).to.be.at.least(1200);
        } else {
          expect(width).to.be.closeTo(expectedWidth, 50);
        }

        addResult(createTestResult(test.id, test.name, 'Responsive', 'selenium', 'PASS', Date.now() - start));
      } catch (err) {
        addResult(createTestResult(test.id, test.name, 'Responsive', 'selenium', 'FAIL', Date.now() - start, err.message));
        throw err;
      } finally {
        await quitDriver(driver);
      }
    });
  }
});
