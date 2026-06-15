const BasePageMobile = require('./BasePageMobile');
class DashboardPageMobile extends BasePageMobile {
  constructor(driver) { super(driver); }
  async isDashboardVisible() { return this.isTextDisplayed('Welcome, Savanite'); }
  async tapFindOpportunities() { await this.tapByText('Find Opportunities'); }
  async tapPostOpportunity() { await this.tapByText('Post Opportunity'); }
}
module.exports = DashboardPageMobile;
