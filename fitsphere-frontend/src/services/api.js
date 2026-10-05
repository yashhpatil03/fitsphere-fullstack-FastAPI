import axios from "axios";

/**
 * Central HTTP client for the FitSphere FastAPI backend.
 * - Base URL comes from VITE_API_URL (see .env)
 * - Attaches the JWT as "Authorization: Bearer <token>"
 * - Turns every failure into a readable message (see getErrorMessage)
 * Components should NOT import axios; they call functions in
 * authService.js / fitnessService.js / aiService.js instead.
 *
 * Security: this file never logs request bodies, passwords or tokens.
 */

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

const TOKEN_KEY = "token";
const USER_ID_KEY = "userId";
const ROLE_KEY = "role";

const isValid = (v) => v && v !== "undefined" && v !== "null";

export const session = {
  getToken: () => {
    const t = localStorage.getItem(TOKEN_KEY);
    return isValid(t) ? t : null;
  },
  getUserId: () => {
    const id = localStorage.getItem(USER_ID_KEY);
    return isValid(id) ? Number(id) : null;
  },
  getRole: () => localStorage.getItem(ROLE_KEY) || "",
  save: ({ token, userId, role }) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (userId != null) localStorage.setItem(USER_ID_KEY, String(userId));
    if (role) localStorage.setItem(ROLE_KEY, role);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Endpoints where a 401 means "wrong credentials", not "session expired"
const AUTH_ENDPOINTS = ["/auth/login"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    if (status === 401 && !AUTH_ENDPOINTS.some((p) => url.startsWith(p))) {
      session.clear();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

/** Turn any axios/FastAPI error into a short message safe to show users. */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error?.response) {
    if (error?.code === "ECONNABORTED") return "The server took too long to respond.";
    return "Cannot reach the server. Check that the backend is running.";
  }
  const { status, data } = error.response;
  const detail = data?.detail;

  if (typeof detail === "string") return detail;
  // FastAPI validation errors: [{loc, msg, type}, ...]
  if (Array.isArray(detail) && detail.length) {
    return detail
      .map((d) => `${(d.loc || []).slice(1).join(".") || "field"}: ${d.msg}`)
      .join("; ");
  }
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "Not found.";
  if (status >= 500) return "The server had a problem. Please try again.";
  return fallback;
}

export default api;
