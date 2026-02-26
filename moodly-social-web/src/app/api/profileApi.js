import { http } from "./http.js";

export function searchUsers(query) {
  return http(`/search/users?q=${encodeURIComponent(query)}`, { method: "GET" });
}

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
  return http(`/${encodeURIComponent(username)}`, { method: "GET" });
}

export function getPublicPosts(username) {
  return http(`/${encodeURIComponent(username)}/posts`, { method: "GET" });
}

export function follow(username) {
  return http(`/${encodeURIComponent(username)}/followers`, { method: "POST" });
}

export function unfollow(username) {
  return http(`/${encodeURIComponent(username)}/followers`, { method: "DELETE" });
}

export function getPublicPost(username, postId) {
  return http(`/${encodeURIComponent(username)}/posts/${postId}`, { method: "GET" });
}

export function getFollowers(username) {
  return http(`/${encodeURIComponent(username)}/followers`, { method: "GET" });
}

export function getFollowing(username) {
  return http(`/${encodeURIComponent(username)}/following`, { method: "GET" });
}
