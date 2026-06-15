const BasePageMobile = require('./BasePageMobile');
class SignupPageMobile extends BasePageMobile {
  constructor(driver) { super(driver); }
  async isSignupVisible() { return this.isTextDisplayed('Create Account'); }
  async tapCreateAccount() { await this.tapByText('Create Account'); }
}
module.exports = SignupPageMobile;
