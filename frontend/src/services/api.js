/**
 * API Client Service for TruthForge-AI
 * Connects Frontend to Backend API & Render Production Host
 */

const LOCAL_API_BASE = 'http://localhost:5000/api/v1';
const RENDER_API_BASE = 'https://truthforge-ai-eza4.onrender.com/api/v1';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || LOCAL_API_BASE;

export async function checkBackendHealth() {
  const targetUrls = [API_BASE_URL, RENDER_API_BASE, LOCAL_API_BASE];

  for (const baseUrl of targetUrls) {
    try {
      const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        return { isHealthy: true, baseUrl, data };
      }
    } catch (e) {
      // Continue to next endpoint option
    }
  }

  return { isHealthy: false, baseUrl: RENDER_API_BASE, data: null };
}

export async function executeFullVerification({ query, domain = 'Technology', depth = 'Detailed', max_sources = 10 }) {
  const targetUrls = [API_BASE_URL, LOCAL_API_BASE, RENDER_API_BASE];
  let lastError = null;

  for (const baseUrl of targetUrls) {
    try {
      const response = await fetch(`${baseUrl}/pipeline/execute-full-verification`, {
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
      lastError = err;
      console.warn(`Attempt at ${baseUrl} failed: ${err.message}. Retrying fallback...`);
    }
  }

  throw lastError || new Error('Unable to contact verification service. Please try again.');
}
