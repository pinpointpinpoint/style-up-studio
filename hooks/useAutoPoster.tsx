import { useEffect, useState } from "react";
import { SanityAsset } from "@/types";
import resolveSource from "@/utils/resolveSource";
import getYouTubeId from "@/utils/getYouTubeId";
import getVimeoId from "@/utils/getVimeoId";

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
      const ytId = getYouTubeId(src);
      if (ytId) {
        const max = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        const hq = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        try {
          const res = await fetch(max, { method: "HEAD" });
          if (!cancelled) setPoster(res.ok ? max : hq);
        } catch {
          if (!cancelled) setPoster(hq);
        }
        return;
      }

      // ── Vimeo ──
      const vimeoId = getVimeoId(src);
      if (vimeoId) {
        try {
          const res = await fetch(
            `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`
          );
          if (!res.ok) return;
          const data = await res.json();
          if (!cancelled && data.thumbnail_url) {
            setPoster(data.thumbnail_url.replace(/_\d+x\d+/, "_1280"));
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