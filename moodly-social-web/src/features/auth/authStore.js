export function saveAuth(token) {
  localStorage.setItem("accessToken", token);
}

<<<<<<< Updated upstream
export function getAuth() {
  return localStorage.getItem("accessToken");
}

=======
>>>>>>> Stashed changes
export function clearAuth() {
  localStorage.removeItem("accessToken");
}

export function isAuthed() {
<<<<<<< Updated upstream
  return Boolean(getAuth());
=======
  return !!localStorage.getItem("accessToken");
>>>>>>> Stashed changes
}
