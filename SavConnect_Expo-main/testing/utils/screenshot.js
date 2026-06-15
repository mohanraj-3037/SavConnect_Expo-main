/**
 * ──────────────────────────────────────────────────────────────
 * SavConnect Testing Suite — Screenshot Utility
 * ──────────────────────────────────────────────────────────────
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/test.config');

/**
 * Capture a screenshot from a Selenium WebDriver.
 * @param {import('selenium-webdriver').WebDriver} driver
 * @param {string} testName — Used for the filename
 * @returns {Promise<string>} — Path to the saved screenshot
 */
async function captureScreenshot(driver, testName) {
  const dir = config.screenshotDir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safeName = testName.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80);
  const filename = `${safeName}_${timestamp}.png`;
  const filepath = path.join(dir, filename);

  try {
    const image = await driver.takeScreenshot();
    fs.writeFileSync(filepath, image, 'base64');
    return filepath;
  } catch (error) {
    console.warn(`[Screenshot] Failed to capture: ${error.message}`);
    return null;
  }
}

/**
 * Capture a screenshot from an Appium WebDriverIO driver.
 * @param {import('webdriverio').Browser} driver
 * @param {string} testName
 * @returns {Promise<string>}
 */
async function captureAppiumScreenshot(driver, testName) {
  const dir = config.screenshotDir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safeName = testName.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80);
  const filename = `mobile_${safeName}_${timestamp}.png`;
  const filepath = path.join(dir, filename);

  try {
    const image = await driver.takeScreenshot();
    fs.writeFileSync(filepath, Buffer.from(image, 'base64'));
    return filepath;
  } catch (error) {
    console.warn(`[Screenshot] Failed to capture mobile: ${error.message}`);
    return null;
  }
}

module.exports = { captureScreenshot, captureAppiumScreenshot };
