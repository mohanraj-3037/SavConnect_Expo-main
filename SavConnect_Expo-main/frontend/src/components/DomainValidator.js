/**
 * Domain validation utility for SavConnect.
 * Only @saveetha.com and @saveetha.ac.in emails are allowed.
 */

const ALLOWED_DOMAINS = ['saveetha.com', 'saveetha.ac.in'];

/**
 * Checks if the given email belongs to an allowed Saveetha domain.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidSaveethaEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1) return false;
  const domain = trimmed.substring(atIndex + 1);
  return ALLOWED_DOMAINS.includes(domain);
};

/**
 * Returns a user-friendly error message for an invalid email.
 * Returns null when the email is valid.
 * @param {string} email
 * @returns {string|null}
 */
export const getEmailError = (email) => {
  if (!email || email.trim().length === 0) return null; // don't nag while field is empty
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basic.test(email.trim())) return 'Please enter a valid email address.';
  if (!isValidSaveethaEmail(email))
    return 'Only @saveetha.com or @saveetha.ac.in emails are allowed.';
  return null;
};
