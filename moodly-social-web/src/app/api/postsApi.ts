import { http } from "./http";
import type { Mood } from "../components/MoodBadge";

export type CommentDto = {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: number;
};

export type PostDto = {
  id: string;
  author: string;
  authorId: string;
  content: string;
  mood: Mood;
  media: string[];
  createdAt: number;
  likes: string[];
  comments: CommentDto[];
};

export async function listPosts(token: string) {
  return http<{ posts: PostDto[] }>("/posts", { method: "GET", token });
}

export async function createPost(
  token: string,
  payload: { content: string; mood: Mood; media: string[] }
) {
  return http<{ post: PostDto }>("/posts", { method: "POST", token, body: JSON.stringify(payload) });
}

export async function toggleLike(token: string, postId: string) {
  return http<{ post: PostDto }>(`/posts/${postId}/like`, { method: "POST", token });
}

export async function addComment(token: string, postId: string, content: string) {
  return http<{ post: PostDto }>(`/posts/${postId}/comments`, {
    method: "POST",
    token,
    body: JSON.stringify({ content }),
  });
}

export async function deletePost(token: string, postId: string) {
  return http<void>(`/posts/${postId}`, { method: "DELETE", token });
}
