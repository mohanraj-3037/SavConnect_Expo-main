/**
 * ──────────────────────────────────────────────────────────────
 * SavConnect Testing Suite — Shared Test Configuration
 * ──────────────────────────────────────────────────────────────
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

module.exports = {
  // ─── URLs ──────────────────────────────────────────────────────
  frontendUrl: process.env.FRONTEND_URL || 'https://sav-connect-expo.vercel.app',
  backendUrl: process.env.BACKEND_URL || 'https://savconnectexpo-production.up.railway.app',

  // ─── Test Credentials ─────────────────────────────────────────
  testEmail: process.env.TEST_EMAIL || 'testuser@saveetha.com',
  testPassword: process.env.TEST_PASSWORD || 'Test@123456',

  // ─── Timeouts ─────────────────────────────────────────────────
  pageLoadTimeout: parseInt(process.env.PAGE_LOAD_TIMEOUT, 10) || 15000,
  elementWaitTimeout: parseInt(process.env.ELEMENT_WAIT_TIMEOUT, 10) || 10000,
  apiTimeout: parseInt(process.env.API_TIMEOUT, 10) || 10000,

  // ─── Browser ──────────────────────────────────────────────────
  headless: process.env.HEADLESS === 'true',
  browser: process.env.BROWSER || 'chrome',

  // ─── Viewports ────────────────────────────────────────────────
  viewports: {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobileIPhoneX: { width: 375, height: 812 },
    mobileIPhoneXR: { width: 414, height: 896 },
  },

  // ─── Paths ────────────────────────────────────────────────────
  reportDir: process.env.REPORT_OUTPUT_DIR || './reports',
  screenshotDir: process.env.SCREENSHOT_DIR || './screenshots',

  // ─── API Endpoints ────────────────────────────────────────────
  apiEndpoints: {
    root: '/',
    health: '/health',
    requestToJoin: '/request-to-join',
    myApplications: '/my-applications',
    applicationStatus: '/applications',
    incomingRequests: '/incoming-requests',
    recommendations: '/recommendations',
    opportunities: '/opportunities',
    profilesUpdate: '/profiles/update',
  },

  // ─── Saveetha Domains ─────────────────────────────────────────
  allowedDomains: ['saveetha.com', 'saveetha.ac.in'],

  // ─── Test Data ────────────────────────────────────────────────
  testData: {
    validOpportunity: {
      title: 'Test Hackathon Project',
      description: 'Looking for talented developers to build an innovative solution for campus management.',
      skills_required: ['React Native', 'JavaScript', 'Node.js'],
      location: 'Lab Block 3',
      posted_by: '00000000-0000-0000-0000-000000000001',
    },
    invalidOpportunity: {
      shortTitle: 'Ab',
      shortDescription: 'Too short',
      emptySkills: [],
      shortLocation: 'A',
    },
    validProfile: {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Test User',
      year_of_study: '3rd Year',
      skills: ['React Native', 'JavaScript'],
      availability: true,
    },
    validJoinRequest: {
      opportunity_id: '00000000-0000-0000-0000-000000000001',
      applicant_id: '00000000-0000-0000-0000-000000000002',
      message: 'I would love to join this project. I have experience in React Native and Node.js.',
      contact_email: 'test@gmail.com',
      contact_phone: '+91 98765 43210',
      contact_preference: 'email',
    },
  },
};
