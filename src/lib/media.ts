import { youTubeEmbedUrl } from "./validation";

export type MediaInfo = {
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaSource?: string | null;
};

export function resolveMedia(m: MediaInfo) {
  if (!m.mediaUrl) return null;
  if (m.mediaSource === "YOUTUBE") {
    const url = youTubeEmbedUrl(m.mediaUrl);
    return url ? { kind: "youtube" as const, url } : null;
  }
  if (m.mediaType === "image") return { kind: "image" as const, url: m.mediaUrl };
  if (m.mediaType === "video") return { kind: "video" as const, url: m.mediaUrl };
  return null;
}
