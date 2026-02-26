import { http } from "./http.js";

export function getAccount() {
  return http("/account", { method: "GET" });
}

export function updateAccount({ username, email, newPassword }) {
  const body = { username, email };
  if (newPassword) body.newPassword = newPassword;
  return http("/account", { method: "PUT", body: JSON.stringify(body) });
}
