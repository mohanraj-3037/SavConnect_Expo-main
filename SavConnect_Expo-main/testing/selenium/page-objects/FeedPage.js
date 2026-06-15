/**
 * SavConnect — FeedPage (Selenium Page Object)
 */
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class FeedPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.selectors = {
      headerTitle: By.xpath("//*[contains(text(), 'Opportunities')]"),
      availableCount: By.xpath("//*[contains(text(), 'available near you')]"),
      opportunityCard: By.xpath("//*[contains(text(), 'Request to Join')]"),
      requestToJoinButton: By.xpath("//*[contains(text(), 'Request to Join')]"),
      topMatchBadge: By.xpath("//*[contains(text(), 'Top Match')]"),
      emptyState: By.xpath("//*[contains(text(), 'No Opportunities Yet')]"),
      connectionError: By.xpath("//*[contains(text(), 'Connection Error')]"),
      retryButton: By.xpath("//*[contains(text(), 'Retry Connection')]"),
      loadingText: By.xpath("//*[contains(text(), 'Loading opportunities')]"),
    };
  }

  async isHeaderVisible() { return this.isDisplayed(this.selectors.headerTitle); }
  async isEmptyStateVisible() { return this.isDisplayed(this.selectors.emptyState); }
  async isConnectionErrorVisible() { return this.isDisplayed(this.selectors.connectionError); }

  async getOpportunityCards() {
    return this.findElements(this.selectors.requestToJoinButton);
  }

  async clickFirstRequestToJoin() {
    return this.click(this.selectors.requestToJoinButton);
  }
}

module.exports = FeedPage;
