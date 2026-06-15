/**
 * SavConnect — SignupPage (Selenium Page Object)
 */
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../../config/test.config');

class SignupPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.url = config.frontendUrl;

    this.selectors = {
      createAccountHeader: By.xpath("//*[contains(text(), 'Create Account')]"),
      joinNetwork: By.xpath("//*[contains(text(), 'Join the Saveetha network')]"),
      signUpTitle: By.xpath("//*[contains(text(), 'Sign Up')]"),
      useOfficialEmail: By.xpath("//*[contains(text(), 'Use your official Saveetha email')]"),
      emailInput: By.css('input[autocomplete="email"]'),
      passwordInput: By.xpath("(//input[@type='password'])[1]"),
      confirmPasswordInput: By.xpath("(//input[@type='password'])[2]"),
      createAccountButton: By.xpath("//*[contains(text(), 'Create Account')]"),
      signInLink: By.xpath("//*[contains(text(), 'Sign In')]"),
      alreadyHaveAccount: By.xpath("//*[contains(text(), 'Already have an account')]"),
      passwordHint: By.xpath("//*[contains(text(), 'Password must be at least 6')]"),
      passwordMismatchError: By.xpath("//*[contains(text(), 'Passwords do not match')]"),
    };
  }

  async open() {
    try {
      const currentUrl = await this.driver.getCurrentUrl();
      const basePath = new URL(this.url).origin;
      if (currentUrl === 'data:,' || currentUrl === 'about:blank' || !currentUrl.startsWith(basePath)) {
        await this.navigate(this.url);
        await this.driver.sleep(3000);
      }
      // Navigate to signup from login page if we aren't already there
      const isSignupHeaderVisible = await this.isDisplayed(this.selectors.createAccountHeader);
      if (!isSignupHeaderVisible) {
        try {
          const signUpLink = await this.driver.findElement(By.xpath("//*[contains(text(), 'Sign Up')]"));
          await signUpLink.click();
          await this.driver.sleep(2000);
        } catch {
          // May already be on signup or link not found
        }
      }
    } catch (e) {
      await this.navigate(this.url);
      await this.driver.sleep(3000);
    }
  }

  async enterEmail(email) {
    return this.type(this.selectors.emailInput, email);
  }

  async enterPassword(password) {
    return this.type(this.selectors.passwordInput, password);
  }

  async enterConfirmPassword(password) {
    return this.type(this.selectors.confirmPasswordInput, password);
  }

  async clickCreateAccount() {
    return this.click(this.selectors.createAccountButton);
  }

  async isCreateAccountHeaderVisible() {
    return this.isDisplayed(this.selectors.createAccountHeader);
  }

  async isPasswordMismatchVisible() {
    return this.isDisplayed(this.selectors.passwordMismatchError);
  }
}

module.exports = SignupPage;
