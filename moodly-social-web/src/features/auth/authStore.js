export function saveAuth(token) {
  localStorage.setItem("accessToken", token);
}

export function getAuth() {
  return localStorage.getItem("accessToken");
}

export function clearAuth() {
  localStorage.removeItem("accessToken");
}

export function isAuthed() {
  return Boolean(getAuth());
}
