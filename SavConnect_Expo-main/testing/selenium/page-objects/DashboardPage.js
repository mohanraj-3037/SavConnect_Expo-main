/**
 * SavConnect — DashboardPage (Selenium Page Object)
 */
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.selectors = {
      greeting: By.xpath("//*[contains(text(), 'Welcome, Savanite')]"),
      collaborationHub: By.xpath("//*[contains(text(), 'Your collaboration hub')]"),
      quickActions: By.xpath("//*[contains(text(), 'QUICK ACTIONS')]"),
      findOpportunities: By.xpath("//*[contains(text(), 'Find Opportunities')]"),
      postOpportunity: By.xpath("//*[contains(text(), 'Post Opportunity')]"),
      myApplications: By.xpath("//*[contains(text(), 'My Applications')]"),
      incomingRequests: By.xpath("//*[contains(text(), 'Incoming Requests')]"),
      manage: By.xpath("//*[contains(text(), 'MANAGE')]"),
    };
  }

  async isGreetingVisible() { return this.isDisplayed(this.selectors.greeting); }
  async isFindOpportunitiesVisible() { return this.isDisplayed(this.selectors.findOpportunities); }
  async isPostOpportunityVisible() { return this.isDisplayed(this.selectors.postOpportunity); }
  async isMyApplicationsVisible() { return this.isDisplayed(this.selectors.myApplications); }
  async isIncomingRequestsVisible() { return this.isDisplayed(this.selectors.incomingRequests); }

  async clickFindOpportunities() { return this.click(this.selectors.findOpportunities); }
  async clickPostOpportunity() { return this.click(this.selectors.postOpportunity); }
  async clickMyApplications() { return this.click(this.selectors.myApplications); }
  async clickIncomingRequests() { return this.click(this.selectors.incomingRequests); }
}

module.exports = DashboardPage;
