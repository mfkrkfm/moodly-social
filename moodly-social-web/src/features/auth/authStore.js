export function saveAuth(token) {
  localStorage.setItem("accessToken", token);
}

export function clearAuth() {
  localStorage.removeItem("accessToken");
}

export function isAuthed() {
  return !!localStorage.getItem("accessToken");
}
