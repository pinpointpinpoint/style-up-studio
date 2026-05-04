import { useEffect, useState } from "react";
import {
  getVimeoOEmbedUrl,
  getYouTubePosterCandidates,
  normalizeVimeoThumbnailUrl,
} from "@/lib/videoMedia";
import { SanityAsset } from "@/types";
import resolveSource from "@/utils/resolveSource";

export default function useAutoPoster(asset: SanityAsset): string | undefined {
  const [poster, setPoster] = useState<string | undefined>(asset.value.poster);

  useEffect(() => {
    if (asset.value.poster) {
      setPoster(asset.value.poster);
      return;
    }

    const src = resolveSource(asset);
    if (!src) return;

    let cancelled = false;

    async function resolve() {
      // ── YouTube ──
      const youtubePoster = getYouTubePosterCandidates(src);
      if (youtubePoster) {
        try {
          const res = await fetch(youtubePoster.primary, { method: "HEAD" });
          if (!cancelled) setPoster(res.ok ? youtubePoster.primary : youtubePoster.fallback);
        } catch {
          if (!cancelled) setPoster(youtubePoster.fallback);
        }
        return;
      }

      // ── Vimeo ──
      const vimeoOEmbedUrl = getVimeoOEmbedUrl(src);
      if (vimeoOEmbedUrl) {
        try {
          const res = await fetch(vimeoOEmbedUrl);
          if (!res.ok) return;
          const data = await res.json();
          if (!cancelled && data.thumbnail_url) {
            setPoster(normalizeVimeoThumbnailUrl(data.thumbnail_url, 1280));
          }
        } catch {
          // silently skip
        }
        return;
      }

      // ── Direct video file — capture first frame ──
      const fileUrl = asset.value.fileUrl;
      if (fileUrl) {
        try {
          const frame = await captureVideoFrame(fileUrl);
          if (!cancelled && frame) setPoster(frame);
        } catch {
          // silently skip
        }
      }
    }

    resolve();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.value.poster, asset.value.url, asset.value.fileUrl]);

  return poster;
}

function captureVideoFrame(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch {
        resolve(null);
      } finally {
        video.src = "";
      }
    };

    video.onerror = () => resolve(null);
    video.src = src;
  });
}
