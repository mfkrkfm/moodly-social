import { http } from "./http.js";

// Backend contract:
// POST /auth/signin { username, password }
// POST /auth/signup { username, email, password }

export async function signin({ username, password }) {
  return http("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function signup({ username, email, password }) {
  return http("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}
