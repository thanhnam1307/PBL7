import { apiRequest } from "./http";

export function getLandCoverLayer({ year, mode, classes }) {
  const params = new URLSearchParams({
    year: String(year),
    mode,
    classes: classes.join(","),
  });
  return apiRequest(`/api/satellite/land-cover/layer?${params.toString()}`);
}
