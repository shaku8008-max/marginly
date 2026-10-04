/**
 * Central API helper for calling the Marginly backend.
 *
 * VITE_ prefixed variables are baked into the JavaScript bundle at build
 * time by Vite.  Only public, non-secret values may use this prefix —
 * anything sensitive (like the service role key) must stay server-side.
 *
 * API_BASE_URL is read from the VITE_API_URL environment variable.
 *
 * In production on Vercel, the frontend and backend share one domain:
 * /api/* is rewritten to the backend service automatically.  So we use
 * an empty base URL (same-origin).  You do NOT need to set VITE_API_URL
 * in the Vercel dashboard for the production deployment.
 *
 * In local development the two services run on different ports, so we
 * fall back to http://localhost:8000.
 */

import supabase from "./supabaseClient";

// ── Base URL ──────────────────────────────────────────────────────────
// Production: empty string → requests go to the same origin, and Vercel
//   rewrites /api/* to the backend service.
// Development: fall back to http://localhost:8000 (the local backend).
// ──────────────────────────────────────────────────────────────────────
let API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

if (!API_BASE_URL && import.meta.env.DEV) {
  API_BASE_URL = "http://localhost:8000";
}

export { API_BASE_URL };

// ── Authenticated fetch helper ────────────────────────────────────────
// Builds the full URL, attaches the current Supabase access token, and
// returns the parsed JSON body.  On a non-OK response it throws a
// plain-English Error so screens can display it directly.
// ──────────────────────────────────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  // Get the current session (includes the JWT access token)
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    throw new Error("Please log in again.");
  }

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  // Parse JSON regardless of status — the backend always returns JSON
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("Something went wrong. Please try again.");
  }

  if (!response.ok) {
    // Use the backend's error message if available, otherwise a fallback
    const message =
      body?.error || body?.detail || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return body;
}