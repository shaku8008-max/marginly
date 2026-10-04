/**
 * Central API helper for calling the Marginly backend.
 *
 * VITE_ prefixed variables are baked into the JavaScript bundle at build
 * time by Vite.  Only public, non-secret values may use this prefix —
 * anything sensitive (like the service role key) must stay server-side.
 *
 * API_BASE_URL is read from the VITE_API_URL environment variable.
 * In production, set it in the Vercel dashboard → frontend project →
 * Settings → Environment Variables to your live backend URL
 * (e.g. https://marginly-api.vercel.app).
 */

import supabase from "./supabaseClient";

// ── Base URL ──────────────────────────────────────────────────────────
// VITE_API_URL is baked in at build time.  In dev mode we fall back to
// localhost:8000 so the app works out of the box.  In a production build
// the variable must be set — otherwise we throw immediately so the
// developer sees a clear message instead of silent CORS failures.
// ──────────────────────────────────────────────────────────────────────
let API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

if (!API_BASE_URL && !import.meta.env.DEV) {
  throw new Error(
    "VITE_API_URL is not set. Add it in your Vercel dashboard or local .env file."
  );
}

// Dev-only fallback
if (!API_BASE_URL) {
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