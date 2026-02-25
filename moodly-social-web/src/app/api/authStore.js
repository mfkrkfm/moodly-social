const TOKEN_KEY = "moodly_token";
const SESSION_KEY = "moodly_session";
const EXP_SKEW_SECONDS = 30;

function getStorage() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) return window.sessionStorage;
  } catch {
  }
  return null;
}

function readWithFallback(key) {
  const storage = getStorage();
  try {
    const fromSession = storage?.getItem(key);
    if (fromSession) return fromSession;
    const fromLocal = localStorage.getItem(key);
    if (fromLocal && storage) storage.setItem(key, fromLocal);
    return fromLocal;
  } catch {
    return null;
  }
}

function write(key, value) {
  const storage = getStorage();
  try {
    storage?.setItem(key, value);
  } catch {
  }
  try {
    // Keep localStorage clear to minimize token persistence surface.
    localStorage.removeItem(key);
  } catch {
  }
}

function remove(key) {
  const storage = getStorage();
  try {
    storage?.removeItem(key);
  } catch {
  }
  try {
    localStorage.removeItem(key);
  } catch {
  }
}

function decodeBase64Url(value) {
  if (!value) return null;
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "===".slice((normalized.length + 3) % 4);
    const decoded = atob(padded);
    return decodeURIComponent(
      Array.from(decoded)
        .map((ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch {
    return null;
  }
}

function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payloadJson = decodeBase64Url(parts[1]);
  if (!payloadJson) return null;
  try {
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

function isExpired(payload) {
  const exp = Number(payload?.exp);
  if (!Number.isFinite(exp)) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowSeconds + EXP_SKEW_SECONDS;
}

function isTokenUsable(token) {
  const payload = parseJwtPayload(token);
  if (!payload) return false;
  if (isExpired(payload)) return false;
  const sub = payload?.sub;
  return sub !== undefined && sub !== null && String(sub).trim().length > 0;
}

function isTokenForUser(token, userId) {
  if (userId === null || userId === undefined) return true;
  const payload = parseJwtPayload(token);
  if (!payload?.sub) return false;
  return String(payload.sub) === String(userId);
}

export function saveAuthSession(authResponse) {
  const token = authResponse?.token;
  if (token && isTokenUsable(token) && isTokenForUser(token, authResponse?.userId)) {
    write(TOKEN_KEY, token);
  } else {
    remove(TOKEN_KEY);
  }

  const session = {
    userId: authResponse?.userId ?? null,
    username: authResponse?.username ?? null,
    email: authResponse?.email ?? null,
    roles: authResponse?.roles ?? [],
    profileId: authResponse?.profileId ?? null,
  };
  write(SESSION_KEY, JSON.stringify(session));
}

export function saveAuthToken(token) {
  if (isTokenUsable(token)) write(TOKEN_KEY, token);
  else remove(TOKEN_KEY);
}

export function getAuth() {
  const token = readWithFallback(TOKEN_KEY);
  if (!token) return null;
  if (!isTokenUsable(token)) {
    clearAuth();
    return null;
  }
  return token;
}

export function getSession() {
  try {
    const token = getAuth();
    if (!token) return null;
    const session = JSON.parse(readWithFallback(SESSION_KEY) || "null");
    if (!session) return null;
    if (!isTokenForUser(token, session.userId)) {
      clearAuth();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearAuth() {
  remove(TOKEN_KEY);
  remove(SESSION_KEY);
}
