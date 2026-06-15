/**
 * ──────────────────────────────────────────────────────────────
 * SavConnect Testing Suite — Appium Configuration
 * ──────────────────────────────────────────────────────────────
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const appiumConfig = {
  // ─── Appium Server ────────────────────────────────────────────
  host: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,

  // ─── Desired Capabilities ────────────────────────────────────
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '13',
    'appium:app': process.env.APK_PATH || './frontend/android/app/build/outputs/apk/debug/app-debug.apk',
    'appium:appPackage': 'com.pdd',
    'appium:appActivity': 'com.pdd.MainActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:ignoreUnimportantViews': true,
    'appium:disableAnimations': true,
  },

  // ─── Timeouts ─────────────────────────────────────────────────
  implicitWait: 10000,
  commandTimeout: 60000,

  // ─── WebDriverIO Options ──────────────────────────────────────
  wdioOptions: {
    logLevel: 'warn',
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
  },
};

/**
 * Create a WebDriverIO remote client for Appium.
 * @returns {Promise<import('webdriverio').Browser>}
 */
async function createAppiumDriver() {
  const { remote } = require('webdriverio');

  const driver = await remote({
    hostname: appiumConfig.host,
    port: appiumConfig.port,
    path: '/',
    capabilities: appiumConfig.capabilities,
    ...appiumConfig.wdioOptions,
  });

  await driver.setImplicitTimeout(appiumConfig.implicitWait);

  return driver;
}

/**
 * Safely close an Appium session.
 * @param {import('webdriverio').Browser} driver
 */
async function quitAppiumDriver(driver) {
  if (driver) {
    try {
      await driver.deleteSession();
    } catch (e) {
      // Session may already be closed
    }
  }
}

module.exports = { appiumConfig, createAppiumDriver, quitAppiumDriver };
