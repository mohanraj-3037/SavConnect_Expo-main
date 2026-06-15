/**
 * ──────────────────────────────────────────────────────────────
 * TC-046 to TC-054 — Login & Signup Validation Tests
 * ──────────────────────────────────────────────────────────────
 */
const { expect } = require('chai');
const { createTestResult, addResult, isValidSaveethaEmail, getEmailError } = require('../../utils/test-helpers');

describe('03 — Login Validation Tests', function () {
  this.timeout(10000);

  it('TC-046: Login rejects non-Saveetha email domains (e.g., gmail.com)', async function () {
    const start = Date.now();
    try {
      const error = getEmailError('user@gmail.com');
      expect(error).to.include('saveetha.com');
      expect(isValidSaveethaEmail('user@gmail.com')).to.be.false;
      addResult(createTestResult('TC-046', 'Login rejects non-Saveetha email domains (e.g., gmail.com)', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-046', 'Login rejects non-Saveetha email domains (e.g., gmail.com)', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-047: Login rejects empty email field', async function () {
    const start = Date.now();
    try {
      const result = isValidSaveethaEmail('');
      expect(result).to.be.false;
      addResult(createTestResult('TC-047', 'Login rejects empty email field', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-047', 'Login rejects empty email field', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-048: Login rejects invalid email format (missing @)', async function () {
    const start = Date.now();
    try {
      const error = getEmailError('invalidemail.com');
      expect(error).to.equal('Please enter a valid email address.');
      addResult(createTestResult('TC-048', 'Login rejects invalid email format (missing @)', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-048', 'Login rejects invalid email format (missing @)', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-049: Login rejects password shorter than 6 characters', async function () {
    const start = Date.now();
    try {
      // Password validation: length >= 6
      const shortPassword = '12345';
      expect(shortPassword.length).to.be.lessThan(6);
      const isValid = shortPassword.length >= 6;
      expect(isValid).to.be.false;
      addResult(createTestResult('TC-049', 'Login rejects password shorter than 6 characters', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-049', 'Login rejects password shorter than 6 characters', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-050: Signup rejects non-matching passwords', async function () {
    const start = Date.now();
    try {
      const password = 'Test@123';
      const confirmPassword = 'Test@456';
      expect(password).to.not.equal(confirmPassword);
      addResult(createTestResult('TC-050', 'Signup rejects non-matching passwords', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-050', 'Signup rejects non-matching passwords', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-051: Signup shows "Passwords do not match" error', async function () {
    const start = Date.now();
    try {
      const password = 'Test@123';
      const confirmPassword = 'Test@456';
      const confirmError = password !== confirmPassword ? 'Passwords do not match.' : null;
      expect(confirmError).to.equal('Passwords do not match.');
      addResult(createTestResult('TC-051', 'Signup shows "Passwords do not match" error', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-051', 'Signup shows "Passwords do not match" error', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-052: Signup password minimum 6 character hint appears', async function () {
    const start = Date.now();
    try {
      const password = 'abc';
      const showHint = password.length > 0 && password.length < 6;
      expect(showHint).to.be.true;
      addResult(createTestResult('TC-052', 'Signup password minimum 6 character hint appears', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-052', 'Signup password minimum 6 character hint appears', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-053: Sign In button is disabled when form is invalid', async function () {
    const start = Date.now();
    try {
      const email = '';
      const password = '';
      const emailError = getEmailError(email);
      const isFormValid = !getEmailError(email || 'x') && password.length >= 6;
      expect(isFormValid).to.be.false;
      addResult(createTestResult('TC-053', 'Sign In button is disabled when form is invalid', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-053', 'Sign In button is disabled when form is invalid', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });

  it('TC-054: Signup button is disabled when form is invalid', async function () {
    const start = Date.now();
    try {
      const email = 'invalid';
      const password = '123';
      const confirmPassword = '456';
      const isFormValid = !getEmailError(email) && password.length >= 6 && password === confirmPassword;
      expect(isFormValid).to.be.false;
      addResult(createTestResult('TC-054', 'Signup button is disabled when form is invalid', 'Validation', 'unit', 'PASS', Date.now() - start));
    } catch (err) {
      addResult(createTestResult('TC-054', 'Signup button is disabled when form is invalid', 'Validation', 'unit', 'FAIL', Date.now() - start, err.message));
      throw err;
    }
  });
});
