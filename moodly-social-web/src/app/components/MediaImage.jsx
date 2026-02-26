import { useBlobUrl } from "../hooks/useBlobUrl.js";

export function MediaImage({ url, alt, className }) {
  const blobUrl = useBlobUrl(url);
  if (!url) return null;
  return <img src={blobUrl || undefined} alt={alt || "media"} className={className} />;
}
