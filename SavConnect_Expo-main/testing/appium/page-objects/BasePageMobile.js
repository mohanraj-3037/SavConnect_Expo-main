/**
 * SavConnect — BasePageMobile (Appium Page Object)
 */
class BasePageMobile {
  constructor(driver) {
    this.driver = driver;
    this.timeout = 10000;
  }

  async findByText(text) {
    return this.driver.$(`//*[contains(@text, '${text}')]`);
  }

  async findByAccessibilityId(id) {
    return this.driver.$(`~${id}`);
  }

  async findByClassName(className) {
    return this.driver.$(className);
  }

  async waitForElement(selector, timeout) {
    const el = await this.driver.$(selector);
    await el.waitForDisplayed({ timeout: timeout || this.timeout });
    return el;
  }

  async tapByText(text) {
    const el = await this.findByText(text);
    await el.waitForDisplayed({ timeout: this.timeout });
    await el.click();
  }

  async typeByText(label, value) {
    const el = await this.findByText(label);
    await el.waitForDisplayed({ timeout: this.timeout });
    await el.click();
    await el.setValue(value);
  }

  async isTextDisplayed(text) {
    try {
      const el = await this.findByText(text);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async screenshot(name) {
    const { captureAppiumScreenshot } = require('../../utils/screenshot');
    return captureAppiumScreenshot(this.driver, name);
  }

  async scrollDown() {
    await this.driver.execute('mobile: scrollGesture', {
      left: 100, top: 500, width: 200, height: 500,
      direction: 'down', percent: 0.75,
    });
  }

  async scrollUp() {
    await this.driver.execute('mobile: scrollGesture', {
      left: 100, top: 500, width: 200, height: 500,
      direction: 'up', percent: 0.75,
    });
  }

  async swipeLeft() {
    await this.driver.execute('mobile: swipeGesture', {
      left: 300, top: 400, width: 200, height: 100,
      direction: 'left', percent: 0.75,
    });
  }

  async getPageSource() {
    return this.driver.getPageSource();
  }

  async pause(ms) {
    await this.driver.pause(ms);
  }
}

module.exports = BasePageMobile;
