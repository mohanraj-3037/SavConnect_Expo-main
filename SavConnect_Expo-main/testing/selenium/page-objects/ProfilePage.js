/**
 * SavConnect — ProfilePage (Selenium Page Object)
 */
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.selectors = {
      basicInfo: By.xpath("//*[contains(text(), 'Basic Information')]"),
      skills: By.xpath("//*[contains(text(), 'Skills')]"),
      availability: By.xpath("//*[contains(text(), 'Availability')]"),
      preferences: By.xpath("//*[contains(text(), 'Preferences')]"),
      darkMode: By.xpath("//*[contains(text(), 'Dark Mode')]"),
      signOut: By.xpath("//*[contains(text(), 'Sign Out')]"),
      saveProfile: By.xpath("//*[contains(text(), 'Save Profile')]"),
      available: By.xpath("//*[contains(text(), 'Available')]"),
      busy: By.xpath("//*[contains(text(), 'Busy')]"),
      editButton: By.xpath("//*[contains(@style, 'pencil')]"),
      fullNameInput: By.xpath("//input[contains(@placeholder, 'Full Name') or @label='Full Name']"),
      addSkill: By.xpath("//*[contains(text(), 'Add Skill')]"),
    };
  }

  async isBasicInfoVisible() { return this.isDisplayed(this.selectors.basicInfo); }
  async isSkillsSectionVisible() { return this.isDisplayed(this.selectors.skills); }
  async isAvailabilityVisible() { return this.isDisplayed(this.selectors.availability); }
  async isPreferencesVisible() { return this.isDisplayed(this.selectors.preferences); }
  async isDarkModeToggleVisible() { return this.isDisplayed(this.selectors.darkMode); }
  async isSignOutVisible() { return this.isDisplayed(this.selectors.signOut); }
}

module.exports = ProfilePage;
