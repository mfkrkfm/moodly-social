import { http } from "./http.js";

export function getPublicProfile(username) {
  return http(`/${encodeURIComponent(username)}`, { method: "GET" });
}