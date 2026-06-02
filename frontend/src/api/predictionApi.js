import { apiRequest } from "./http";

export function uploadRaster(file) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest("/api/prediction/upload", {
    method: "POST",
    body: form,
  });
}

export function predictRegion(payload) {
  return apiRequest("/api/prediction/region", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function listHistory() {
  return apiRequest("/api/history");
}

export function getHistoryItem(predictionId) {
  return apiRequest(`/api/history/${predictionId}`);
}

export function getStatistics(predictionId) {
  return apiRequest(`/api/statistics/${predictionId}`);
}
