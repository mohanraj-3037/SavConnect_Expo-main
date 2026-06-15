/**
 * ──────────────────────────────────────────────────────────────
 * SavConnect Testing Suite — Selenium WebDriver Configuration
 * ──────────────────────────────────────────────────────────────
 */
const { Builder, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('./test.config');

let sharedDriver = null;

/**
 * Build and return a configured Chrome WebDriver instance.
 * @param {object} [viewport] — { width, height } to set window size
 * @returns {Promise<import('selenium-webdriver').WebDriver>}
 */
async function createDriver(viewport) {
  if (sharedDriver) {
    try {
      // Verify session is still alive and active
      await sharedDriver.getCurrentUrl();

      // If viewport is specified, adjust it; otherwise maximize
      if (viewport) {
        await sharedDriver.manage().window().setRect({
          width: viewport.width,
          height: viewport.height,
        });
      } else {
        try {
          await sharedDriver.manage().window().maximize();
        } catch (e) {}
      }
      return sharedDriver;
    } catch (err) {
      // Session is closed/dead — clear and build a new browser window
      try {
        await sharedDriver.quit();
      } catch (e) {}
      sharedDriver = null;
    }
  }

  const options = new chrome.Options();
  options.setPageLoadStrategy('eager');

  // Headless mode disabled for visual presentation/demonstration
  // if (config.headless) {
  //   options.addArguments('--headless');
  // }

  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-popup-blocking',
    '--ignore-certificate-errors',
    '--window-size=1920,1080',
    '--disable-blink-features=AutomationControlled',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-background-timer-throttling'
  );

  // Suppress logging
  options.addArguments('--log-level=3');
  options.excludeSwitches('enable-logging');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Set timeouts
  await driver.manage().setTimeouts({
    implicit: 5000,
    pageLoad: config.pageLoadTimeout,
    script: config.pageLoadTimeout,
  });

  // Set viewport if specified; otherwise maximize window for live demonstration
  if (viewport) {
    await driver.manage().window().setRect({
      width: viewport.width,
      height: viewport.height,
    });
  } else {
    try {
      await driver.manage().window().maximize();
    } catch (e) {
      // Maximize might fail in some virtual environments; ignore gracefully
    }
  }

  sharedDriver = driver;
  return sharedDriver;
}

/**
 * Safely prepare driver for next test instead of quitting.
 * @param {import('selenium-webdriver').WebDriver} driver
 */
async function quitDriver(driver) {
  if (driver) {
    try {
      // Clear cookies and navigate to a blank page for test isolation
      await driver.manage().deleteAllCookies();
      await driver.get('about:blank');
    } catch (e) {
      // Ignore errors if driver is closed
    }
  }
}

// Clean up Chrome process at the end of the node process run
process.on('exit', () => {
  if (sharedDriver) {
    try {
      sharedDriver.quit();
    } catch (e) {}
  }
});

module.exports = { createDriver, quitDriver };
