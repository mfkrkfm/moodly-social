import { http } from "./http";

export type AuthResponse = {
  token: string;
  type?: string;
  userId?: number;
  username?: string;
  email?: string;
  role?: string;
};

export type SigninPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  username: string;
  email: string;
  password: string;
};

export async function signin(payload: SigninPayload) {
  return http<AuthResponse>("/users/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signup(payload: SignupPayload) {
  return http<AuthResponse>("/users/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
