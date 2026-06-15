/**
 * SavConnect — LoginPageMobile (Appium Page Object)
 */
const BasePageMobile = require('./BasePageMobile');

class LoginPageMobile extends BasePageMobile {
  constructor(driver) { super(driver); }
  async isLoginScreenVisible() { return this.isTextDisplayed('Welcome Back'); }
  async isBrandVisible() { return this.isTextDisplayed('SavConnect'); }
  async tapSignIn() { await this.tapByText('Sign In'); }
  async tapSignUp() { await this.tapByText('Sign Up'); }
}

module.exports = LoginPageMobile;
