import { http } from "./http.js";

export function getPublicProfile(username) {
  return http(`/users/${encodeURIComponent(username)}`, { method: "GET" });
}
