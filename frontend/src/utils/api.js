// ─── API Utility ─────────────────────────────────────────────
// All backend calls go through this file.
// In development: uses VITE_API_URL from .env.local (defaults to localhost:5000)
// In production:  set VITE_API_URL to your deployed backend URL

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Core fetch wrapper ───────────────────────────────────────
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // Try to parse JSON regardless of status (error responses also have JSON bodies)
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned non-JSON response for ${path}`);
  }

  if (!response.ok) {
    // Use the server's error message if available, otherwise use HTTP status text
    throw new Error(data?.message || `Request failed: ${response.status} ${response.statusText}`);
  }

  return data;
}

// ─── HTTP method helpers ──────────────────────────────────────

/** GET /api/[path] */
export async function get(path) {
  return request(path, { method: 'GET' });
}

/** POST /api/[path] with JSON body */
export async function post(path, body) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** PATCH /api/[path] with JSON body */
export async function patch(path, body) {
  return request(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** DELETE /api/[path] */
export async function del(path) {
  return request(path, { method: 'DELETE' });
}

/** DELETE /api/[path] with JSON body (needed when auth data must be sent) */
export async function delWithBody(path, body) {
  return request(path, {
    method: 'DELETE',
    body: JSON.stringify(body),
  });
}
