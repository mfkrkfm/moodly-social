import { http } from "./http.js";

export function adminListUsers() {
  return http("/admin/users", { method: "GET" });
}

export function adminGetUser(id) {
  return http(`/admin/users/${id}`, { method: "GET" });
}

export function adminUpdateUserRoles(id, roles) {
  return http(`/admin/users/${id}/roles`, {
    method: "PUT",
    body: JSON.stringify({ roles }),
  });
}

export function adminDeleteUser(id) {
  return http(`/admin/users/${id}`, { method: "DELETE" });
}