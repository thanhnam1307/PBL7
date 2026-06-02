const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export function absoluteApiUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(absoluteApiUrl(path), options);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail = typeof payload === "object" ? payload.detail || payload.error : payload;
    throw new Error(detail || `API request failed with status ${response.status}`);
  }

  return payload;
}
