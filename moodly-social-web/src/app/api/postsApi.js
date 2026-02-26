import { http } from "./http.js";
import imageCompression from "browser-image-compression";

export function listFeed() {
  return http("/posts", { method: "GET" });
}

export function getPost(postId) {
  return http(`/posts/${postId}`, { method: "GET" });
}

export async function createPost({ content, mood, files = [] }) {
  const fd = new FormData();

  // Add JSON post data
  fd.append(
    "post",
    new Blob([JSON.stringify({ content, mood })], { type: "application/json" })
  );

  // Compress each file before appending
  for (const file of files) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      console.warn("Skipping compression for", file.name, "unsupported type", file.type);
      fd.append("files", file, file.name);
      continue;
    }

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      initialQuality: 0.7,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(
        "Original:", (file.size / 1024 / 1024).toFixed(2),
        "MB | Compressed:", (compressedFile.size / 1024 / 1024).toFixed(2), "MB"
      );
      fd.append("files", compressedFile, file.name);
    } catch (error) {
      console.error("Compression failed:", error);
      fd.append("files", file, file.name);
    }
  }

  // Send to backend
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