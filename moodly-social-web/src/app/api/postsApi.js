import { http } from "./http.js";

export function listFeed() {
  return http("/posts", { method: "GET" });
}

export function getPost(postId) {
  return http(`/posts/${postId}`, { method: "GET" });
}

export function createPost({ content, mood, files = [] }) {
  const fd = new FormData();
  fd.append(
    "post",
    new Blob([JSON.stringify({ content, mood })], { type: "application/json" })
  );
  for (const file of files) fd.append("files", file);

  return http("/posts", { method: "POST", body: fd });
}

export function updatePost(postId, { content, mood }) {
  return http(`/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify({ content, mood }),
  });
}

export function deletePost(postId) {
  return http(`/posts/${postId}`, { method: "DELETE" });
}

export function like(postId) {
  return http(`/posts/${postId}/likes`, { method: "POST" });
}

export function unlike(postId) {
  return http(`/posts/${postId}/likes`, { method: "DELETE" });
}

export function listLikes(postId) {
  return http(`/posts/${postId}/likes`, { method: "GET" });
}

export function addComment(postId, content) {
  return http(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function replyToComment(postId, commentId, content) {
  return http(`/posts/${postId}/comments/${commentId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function listComments(postId) {
  return http(`/posts/${postId}/comments`, { method: "GET" });
}

export function updateComment(postId, commentId, content) {
  return http(`/posts/${postId}/comments/${commentId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

export function deleteComment(postId, commentId) {
  return http(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
}
