import { http } from "./http";

export type UserRole = string;

export type UserResponse = {
  id: number;
  username: string;
  email: string;
  appUserRoles?: UserRole[];
};

export type UpdateProfileRequest = {
  username: string;
  email: string;
  newPassword?: string;
};

export async function getMe(token: string) {
  return http<UserResponse>("/users/me", { method: "GET", token });
}

export async function updateMe(token: string, payload: UpdateProfileRequest) {
  return http<UserResponse>("/users/me", { method: "PUT", token, body: JSON.stringify(payload) });
}
