import { useEffect, useMemo, useState } from "react";
import { httpBlob, API_BASE_URL } from "../api/http.js";

const cache = new Map();

function absoluteUrl(relativeOrAbs) {
  if (!relativeOrAbs) return null;
  if (relativeOrAbs.startsWith("http")) return relativeOrAbs;
  return `${String(API_BASE_URL).replace(/\/$/, "")}${relativeOrAbs.startsWith("/") ? "" : "/"}${relativeOrAbs}`;
}

/**
 * Fetches any /media/{id} URL as blob and returns an object URL.
 * Backend returns application/octet-stream, so we don't trust MIME.
 */
export function useBlobUrl(mediaUrl) {
  const key = useMemo(() => absoluteUrl(mediaUrl), [mediaUrl]);
  const [blobUrl, setBlobUrl] = useState(() => (key && cache.get(key)) || null);

  useEffect(() => {
    let cancelled = false;
    if (!key) {
      setBlobUrl(null);
      return;
    }

    const cached = cache.get(key);
    if (cached) {
      setBlobUrl(cached);
      return;
    }

    (async () => {
      try {
        const path = key.startsWith(API_BASE_URL) ? key.slice(String(API_BASE_URL).replace(/\/$/, "").length) : key;
        const blob = await httpBlob(path);
        const url = URL.createObjectURL(blob);
        cache.set(key, url);
        if (!cancelled) setBlobUrl(url);
      } catch {
        if (!cancelled) setBlobUrl(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return blobUrl;
}
