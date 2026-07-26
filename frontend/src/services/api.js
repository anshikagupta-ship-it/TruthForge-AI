/**
 * API Client Service for TruthForge-AI
 * Connects Frontend to Backend API & Render Production Host
 */

// The frontend is served by the same Express app as the API (see backend/src/app.js),
// so a same-origin relative path always resolves correctly — in dev via Vite's proxy
// (see vite.config.js), and in production because it's literally the same server.
// This avoids baking a build-time-only VITE_API_BASE_URL into the bundle, which
// previously defaulted to http://localhost:5000/api/v1 for every production visitor.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json();
      return { isHealthy: true, baseUrl: API_BASE_URL, data };
    }
  } catch (e) {
    // fall through to unhealthy
  }

  return { isHealthy: false, baseUrl: API_BASE_URL, data: null };
}

export async function executeFullVerification({ query, domain = 'Technology', depth = 'Detailed', max_sources = 10 }) {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/execute-full-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, domain, depth, max_sources })
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Verification pipeline execution failed.');
    }

    return json.data;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Unable to contact verification service. Please try again.');
  }
}
