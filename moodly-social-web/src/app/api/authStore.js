const TOKEN_KEY = "moodly_token";
const SESSION_KEY = "moodly_session";

export function saveAuthSession(authResponse) {
  if (authResponse?.token) localStorage.setItem(TOKEN_KEY, authResponse.token);

  const session = {
    userId: authResponse?.userId ?? null,
    username: authResponse?.username ?? null,
    email: authResponse?.email ?? null,
    roles: authResponse?.roles ?? [],
    profileId: authResponse?.profileId ?? null,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function saveAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuth() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}
