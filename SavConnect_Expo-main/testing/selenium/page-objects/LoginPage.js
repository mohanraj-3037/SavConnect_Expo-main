/**
 * SavConnect — LoginPage (Selenium Page Object)
 */
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../../config/test.config');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.url = config.frontendUrl;

    // React Native Web renders input elements; use CSS selectors
    this.selectors = {
      rootDiv: By.css('#root'),
      brandName: By.xpath("//*[contains(text(), 'SavConnect')]"),
      welcomeBack: By.xpath("//*[contains(text(), 'Welcome Back')]"),
      campusTagline: By.xpath("//*[contains(text(), 'Campus Networking Hub')]"),
      signInSubtitle: By.xpath("//*[contains(text(), 'Sign in with your Saveetha email')]"),
      emailInput: By.css('input[type="email"], input[autocomplete="email"]'),
      passwordInput: By.css('input[type="password"]'),
      signInButton: By.xpath("//*[contains(text(), 'Sign In')]"),
      signUpLink: By.xpath("//*[contains(text(), 'Sign Up')]"),
      forgotPassword: By.xpath("//*[contains(text(), 'Forgot password')]"),
      dontHaveAccount: By.xpath("//*[contains(text(), \"Don't have an account\")]"),
      gradientHeader: By.css('[style*="linear-gradient"], [style*="gradient"]'),
      formCard: By.css('[style*="shadow"], [style*="elevation"]'),
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

  async clickSignIn() {
    return this.click(this.selectors.signInButton);
  }

  async clickSignUpLink() {
    return this.click(this.selectors.signUpLink);
  }

  async isSignInButtonEnabled() {
    return this.isEnabled(this.selectors.signInButton);
  }

  async login(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  async isBrandNameVisible() {
    return this.isDisplayed(this.selectors.brandName);
  }

  async isWelcomeBackVisible() {
    return this.isDisplayed(this.selectors.welcomeBack);
  }

  async isEmailInputVisible() {
    return this.isDisplayed(this.selectors.emailInput);
  }

  async isPasswordInputVisible() {
    return this.isDisplayed(this.selectors.passwordInput);
  }

  async isForgotPasswordVisible() {
    return this.isDisplayed(this.selectors.forgotPassword);
  }

  async isSignUpLinkVisible() {
    return this.isDisplayed(this.selectors.signUpLink);
  }
}

module.exports = LoginPage;
