/**
 * ──────────────────────────────────────────────────────────────
 * SavConnect — BasePage (Selenium Page Object)
 * Common WebDriver helper methods used across all page objects.
 * ──────────────────────────────────────────────────────────────
 */
const { By, until, Key } = require('selenium-webdriver');
const config = require('../../config/test.config');
const { captureScreenshot } = require('../../utils/screenshot');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.elementWaitTimeout;
  }

  async navigate(url) {
    await this.driver.get(url);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(timeout) {
    const t = timeout || this.timeout;
    await this.driver.wait(async () => {
      const state = await this.driver.executeScript('return document.readyState');
      return state === 'complete';
    }, t);
  }

  async waitForElement(locator, timeout) {
    const t = timeout || this.timeout;
    return this.driver.wait(until.elementLocated(locator), t);
  }

  async waitForVisible(locator, timeout) {
    const t = timeout || this.timeout;
    const el = await this.waitForElement(locator, t);
    await this.driver.wait(until.elementIsVisible(el), t);
    return el;
  }

  async findElement(locator) {
    return this.driver.findElement(locator);
  }

  async findElements(locator) {
    return this.driver.findElements(locator);
  }

  async click(locator) {
    const el = await this.waitForVisible(locator);
    await this.driver.sleep(1500); // 1.5s delay for live demonstration
    await el.click();
    return el;
  }

  async type(locator, text) {
    const el = await this.waitForVisible(locator);
    await this.driver.sleep(1500); // 1.5s delay for live demonstration
    await el.clear();
    await el.sendKeys(text);
    return el;
  }

  async getText(locator) {
    const el = await this.waitForVisible(locator);
    return el.getText();
  }

  async getAttribute(locator, attr) {
    const el = await this.waitForElement(locator);
    return el.getAttribute(attr);
  }

  async isDisplayed(locator) {
    try {
      const el = await this.driver.findElement(locator);
      return el.isDisplayed();
    } catch {
      return false;
    }
  }

  async isEnabled(locator) {
    try {
      const el = await this.driver.findElement(locator);
      return el.isEnabled();
    } catch {
      return false;
    }
  }

  async elementExists(locator) {
    try {
      await this.driver.findElement(locator);
      return true;
    } catch {
      return false;
    }
  }

  async getPageSource() {
    return this.driver.getPageSource();
  }

  async getTitle() {
    return this.driver.getTitle();
  }

  async getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }

  async executeScript(script, ...args) {
    return this.driver.executeScript(script, ...args);
  }

  async screenshot(name) {
    return captureScreenshot(this.driver, name);
  }

  async getConsoleErrors() {
    try {
      const logs = await this.driver.manage().logs().get('browser');
      return logs.filter(log => log.level.name === 'SEVERE');
    } catch {
      return [];
    }
  }

  async setViewport(width, height) {
    await this.driver.manage().window().setRect({ width, height });
  }

  async scrollToElement(locator) {
    const el = await this.waitForElement(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', el);
    return el;
  }

  async getComputedStyle(locator, property) {
    const el = await this.waitForElement(locator);
    return this.driver.executeScript(
      `return window.getComputedStyle(arguments[0]).getPropertyValue('${property}');`,
      el
    );
  }

  async waitForText(locator, text, timeout) {
    const t = timeout || this.timeout;
    await this.driver.wait(async () => {
      try {
        const el = await this.driver.findElement(locator);
        const elText = await el.getText();
        return elText.includes(text);
      } catch {
        return false;
      }
    }, t);
  }
}

module.exports = BasePage;
