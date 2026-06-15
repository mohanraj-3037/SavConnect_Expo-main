import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // If opened on the laptop browser (localhost), use localhost to avoid Chrome's Private Network Access blocks
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:8000';
    }
  }
  
  // For mobile native, or web opened via network IP (like on a phone's browser)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  return 'http://10.0.2.2:8000'; // Android emulator loopback
};

export const API_URL = getBaseUrl();

/**
 * Helper to ping the FastAPI backend health check
 */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Post a new opportunity via the FastAPI backend.
 * Falls back details: POST /opportunities
 */
export const postOpportunity = async (payload, authToken) => {
  const res = await fetch(`${API_URL}/opportunities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
};

/**
 * Update user profile via the FastAPI backend.
 * POST /profiles/update
 */
export const updateProfile = async (payload, authToken) => {
  const res = await fetch(`${API_URL}/profiles/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
};

/**
 * Fetch pending incoming requests for opportunities owned by the user.
 * GET /incoming-requests/{userId}
 */
export const fetchIncomingRequests = async (userId) => {
  const res = await fetch(`${API_URL}/incoming-requests/${userId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
};

/**
 * Accept or reject an application.
 * PATCH /applications/{applicationId}/status
 * @param {string} applicationId
 * @param {'accepted'|'rejected'} status
 */
export const updateApplicationStatus = async (applicationId, status) => {
  const res = await fetch(`${API_URL}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
};

/**
 * Delete an application (optimistic deletion).
 * DELETE /applications/{applicationId}?user_id={userId}
 * @param {string} applicationId
 * @param {string} userId — must match applicant_id
 */
export const deleteApplication = async (applicationId, userId) => {
  const res = await fetch(
    `${API_URL}/applications/${applicationId}?user_id=${encodeURIComponent(userId)}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
};

/**
 * PATCH the user's skills array via the backend.
 * POST /profiles/update (reuses existing endpoint — sends full payload).
 * @param {object} payload — { id, skills: string[] }
 * @param {string} authToken
 */
export const patchProfileSkills = async (payload, authToken) => {
  const res = await fetch(`${API_URL}/profiles/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
};
