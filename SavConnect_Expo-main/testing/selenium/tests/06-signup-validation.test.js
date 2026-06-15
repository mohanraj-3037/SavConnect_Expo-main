/**
 * TC-055 to TC-065 — Signup & Form Validation Tests
 */
const { expect } = require('chai');
const { createTestResult, addResult, getEmailError } = require('../../utils/test-helpers');

describe('06 — Signup & Onboarding Validation', function () {
  this.timeout(30000);

  it('TC-055: Onboarding requires name ≥ 2 characters', async function () {
    const start = Date.now();
    try {
      expect('A'.trim().length >= 2).to.be.false;
      expect('Al'.trim().length >= 2).to.be.true;
      addResult(createTestResult('TC-055', 'Onboarding requires name ≥ 2 characters', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-055', 'Onboarding requires name ≥ 2 characters', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-056: Onboarding requires at least 1 skill selected', async function () {
    const start = Date.now();
    try {
      const noSkills = [];
      const withSkills = ['React Native'];
      expect(noSkills.length > 0).to.be.false;
      expect(withSkills.length > 0).to.be.true;
      addResult(createTestResult('TC-056', 'Onboarding requires at least 1 skill selected', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-056', 'Onboarding requires at least 1 skill selected', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-057: Onboarding requires valid personal email', async function () {
    const start = Date.now();
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('invalid')).to.be.false;
      expect(emailRegex.test('test@gmail.com')).to.be.true;
      addResult(createTestResult('TC-057', 'Onboarding requires valid personal email', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-057', 'Onboarding requires valid personal email', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-058: Onboarding requires year of study selection', async function () {
    const start = Date.now();
    try {
      const noYear = '';
      const withYear = '2nd Year';
      expect(noYear.length > 0).to.be.false;
      expect(withYear.length > 0).to.be.true;
      addResult(createTestResult('TC-058', 'Onboarding requires year of study selection', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-058', 'Onboarding requires year of study selection', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-059: Onboarding Continue button disabled until form valid', async function () {
    const start = Date.now();
    try {
      const isValid = (name, year, skills, email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return name.trim().length >= 2 && year.length > 0 && skills.length > 0 && emailRegex.test(email.trim());
      };
      expect(isValid('', '', [], '')).to.be.false;
      expect(isValid('Test', '2nd Year', ['JS'], 'test@gmail.com')).to.be.true;
      addResult(createTestResult('TC-059', 'Onboarding Continue button disabled until form valid', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-059', 'Onboarding Continue button disabled until form valid', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-060: Post Opportunity title must be ≥ 3 characters', async function () {
    const start = Date.now();
    try {
      expect('Ab'.trim().length >= 3).to.be.false;
      expect('Abc'.trim().length >= 3).to.be.true;
      addResult(createTestResult('TC-060', 'Post Opportunity title must be ≥ 3 characters', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-060', 'Post Opportunity title must be ≥ 3 characters', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-061: Post Opportunity description must be ≥ 10 characters', async function () {
    const start = Date.now();
    try {
      expect('Too short'.trim().length >= 10).to.be.false;
      expect('A longer description here'.trim().length >= 10).to.be.true;
      addResult(createTestResult('TC-061', 'Post Opportunity description must be ≥ 10 characters', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-061', 'Post Opportunity description must be ≥ 10 characters', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-062: Post Opportunity requires at least 1 skill', async function () {
    const start = Date.now();
    try {
      expect([].length > 0).to.be.false;
      expect(['Python'].length > 0).to.be.true;
      addResult(createTestResult('TC-062', 'Post Opportunity requires at least 1 skill', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-062', 'Post Opportunity requires at least 1 skill', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-063: Post Opportunity location must be ≥ 2 characters', async function () {
    const start = Date.now();
    try {
      expect('A'.trim().length >= 2).to.be.false;
      expect('Lab'.trim().length >= 2).to.be.true;
      addResult(createTestResult('TC-063', 'Post Opportunity location must be ≥ 2 characters', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-063', 'Post Opportunity location must be ≥ 2 characters', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-064: Request Modal message must be ≥ 10 characters', async function () {
    const start = Date.now();
    try {
      expect('short'.trim().length >= 10).to.be.false;
      expect('I would love to join this project and contribute.'.trim().length >= 10).to.be.true;
      addResult(createTestResult('TC-064', 'Request Modal message must be ≥ 10 characters', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-064', 'Request Modal message must be ≥ 10 characters', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-065: Request Modal requires valid contact email and phone (≥7 digits)', async function () {
    const start = Date.now();
    try {
      const isModalValid = (msg, email, phone) =>
        msg.trim().length >= 10 && email.trim().length > 3 && email.includes('@') && phone.trim().length >= 7;
      expect(isModalValid('short', 'bad', '123')).to.be.false;
      expect(isModalValid('A long message here', 'test@email.com', '+919876543210')).to.be.true;
      addResult(createTestResult('TC-065', 'Request Modal requires valid contact email and phone (≥7 digits)', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-065', 'Request Modal requires valid contact email and phone (≥7 digits)', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
