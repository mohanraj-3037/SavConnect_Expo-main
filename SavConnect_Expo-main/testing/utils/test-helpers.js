/**
 * ──────────────────────────────────────────────────────────────
 * SavConnect Testing Suite — Common Test Helpers
 * ──────────────────────────────────────────────────────────────
 */
const fetch = require('node-fetch');
const config = require('../config/test.config');

/**
 * Make an HTTP request to the backend API.
 * @param {string} endpoint — e.g. '/health'
 * @param {object} [options] — fetch options (method, body, headers)
 * @returns {Promise<{status: number, data: any, headers: object, duration: number}>}
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${config.backendUrl}${endpoint}`;
  const start = Date.now();

  const defaultHeaders = { 'Content-Type': 'application/json' };
  const fetchOptions = {
    method: options.method || 'GET',
    headers: { ...defaultHeaders, ...options.headers },
    timeout: config.apiTimeout,
  };

  if (options.body) {
    fetchOptions.body = typeof options.body === 'string'
      ? options.body
      : JSON.stringify(options.body);
  }

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      const duration = Date.now() - start;
      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      return {
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries()),
        duration,
      };
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await sleep(1500 * attempt);
      }
    }
  }

  const duration = Date.now() - start;
  return { status: 0, data: null, headers: {}, duration, error: lastError.message };
}

const frontendCache = {};

/**
 * Make an HTTP request to the frontend URL.
 * @param {string} [path] — e.g. '/' or '/about'
 * @returns {Promise<{status: number, body: string, headers: object, duration: number}>}
 */
async function frontendRequest(path = '/') {
  if (path === '/' && frontendCache['/']) {
    return frontendCache['/'];
  }

  const url = `${config.frontendUrl}${path}`;
  const start = Date.now();

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { timeout: config.pageLoadTimeout });
      const duration = Date.now() - start;
      const body = await response.text();

      const result = {
        status: response.status,
        body,
        headers: Object.fromEntries(response.headers.entries()),
        duration,
      };

      if (path === '/') {
        frontendCache['/'] = result;
      }
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await sleep(1500 * attempt);
      }
    }
  }

  const duration = Date.now() - start;
  return { status: 0, body: '', headers: {}, duration, error: lastError.message };
}

/**
 * Create a test result object.
 * @param {string} id — Test case ID (e.g., 'TC-001')
 * @param {string} name — Test case name
 * @param {string} category — Category (e.g., 'UI/UX', 'Functional')
 * @param {string} type — Test type (e.g., 'selenium', 'api', 'unit')
 * @param {string} status — 'PASS', 'FAIL', or 'SKIP'
 * @param {number} duration — Duration in ms
 * @param {string} [error] — Error message if failed
 * @returns {object}
 */
function createTestResult(id, name, category, type, status, duration, error = '') {
  return {
    id,
    name,
    category,
    type,
    status,
    duration,
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sleep utility.
 * @param {number} ms — Milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff.
 * @param {Function} fn — Async function to retry
 * @param {number} [maxRetries=3] — Maximum retry attempts
 * @param {number} [baseDelay=1000] — Base delay in ms
 */
async function retry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await sleep(baseDelay * attempt);
    }
  }
}

/**
 * Validate email domain against Saveetha allowed list.
 * @param {string} email
 * @returns {boolean}
 */
function isValidSaveethaEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1) return false;
  const domain = trimmed.substring(atIndex + 1);
  return config.allowedDomains.includes(domain);
}

/**
 * Get email validation error message.
 * @param {string} email
 * @returns {string|null}
 */
function getEmailError(email) {
  if (!email || email.trim().length === 0) return null;
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basic.test(email.trim())) return 'Please enter a valid email address.';
  if (!isValidSaveethaEmail(email))
    return 'Only @saveetha.com or @saveetha.ac.in emails are allowed.';
  return null;
}

// Global results collector
const testResults = [];
const fs = require('fs');
const path = require('path');

function addResult(result) {
  // Clean category names to avoid illegal worksheet character issues
  if (result.category) {
    result.category = result.category.replace(/[*?:\\\/\[\]]/g, '-');
  }
  
  testResults.push(result);

  // Write to a shared file so that the parent process can read it
  try {
    const reportDir = path.resolve(__dirname, '..', 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    const filePath = path.join(reportDir, 'results.json');
    let fileResults = [];
    if (fs.existsSync(filePath)) {
      try {
        fileResults = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        fileResults = [];
      }
    }
    // Update or append
    const index = fileResults.findIndex(r => r.id === result.id);
    if (index !== -1) {
      fileResults[index] = result;
    } else {
      fileResults.push(result);
    }
    fs.writeFileSync(filePath, JSON.stringify(fileResults, null, 2), 'utf8');
  } catch (err) {
    // Ignore write errors
  }
}

function getResults() {
  // Try to read from file first to merge results from other processes
  try {
    const filePath = path.resolve(__dirname, '..', 'reports', 'results.json');
    if (fs.existsSync(filePath)) {
      const fileResults = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      for (const r of fileResults) {
        const index = testResults.findIndex(tr => tr.id === r.id);
        if (index === -1) {
          testResults.push(r);
        } else {
          testResults[index] = r;
        }
      }
    }
  } catch (e) {}
  return [...testResults];
}

function clearResults() {
  testResults.length = 0;
  try {
    const filePath = path.resolve(__dirname, '..', 'reports', 'results.json');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {}
}

module.exports = {
  apiRequest,
  frontendRequest,
  createTestResult,
  sleep,
  retry,
  isValidSaveethaEmail,
  getEmailError,
  addResult,
  getResults,
  clearResults,
};
