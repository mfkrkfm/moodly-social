import { http } from "./http.js";

export function getMyProfile() {
  return http("/profile", { method: "GET" });
}

export function updateMyProfile(payload) {
  // payload: { firstName, lastName, bio, birthDate, mood }
  return http("/profile", { method: "PUT", body: JSON.stringify(payload) });
}

export function uploadProfilePicture(file) {
  const fd = new FormData();
  fd.append("file", file);
  return http("/profile/picture", { method: "PUT", body: fd });
}

export function deleteProfilePicture() {
  return http("/profile/picture", { method: "DELETE" });
}

export function getPublicProfile(username) {
  return http(`/users/${encodeURIComponent(username)}`, { method: "GET" });
}

export function getPublicPosts(username) {
  return http(`/users/${encodeURIComponent(username)}/posts`, {
    method: "GET",
  });
}

export function follow(username) {
  return http(`/users/${encodeURIComponent(username)}/followers`, {
    method: "POST",
  });
}

export function unfollow(username) {
  return http(`/users/${encodeURIComponent(username)}/followers`, {
    method: "DELETE",
  });
}
