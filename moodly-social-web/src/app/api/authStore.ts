const TOKEN_KEY = "moodly_token";

export function saveAuth(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuth(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
}
