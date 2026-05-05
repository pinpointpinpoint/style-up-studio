import { useEffect, useState } from "react";
import { getExternalVideoPoster, getVideoAssetSource } from "@/features/video/lib/videoMedia";
import { SanityAsset } from "@/types";

export default function useVideoPoster(asset: SanityAsset): string | undefined {
  const [poster, setPoster] = useState<string | undefined>(asset.value.poster);

  useEffect(() => {
    if (asset.value.poster) {
      setPoster(asset.value.poster);
      return;
    }

    const src = getVideoAssetSource(asset);
    if (!src) return;

    let cancelled = false;

    async function resolve() {
      const providerPoster = await getExternalVideoPoster(src, {
        head: async (url) => fetch(url, { method: "HEAD" }),
        fetchJson: async (url) => {
          const res = await fetch(url);

          if (!res.ok) return null;

          return res.json();
        },
      });

      if (providerPoster) {
        if (!cancelled) setPoster(providerPoster);
      }
    }

    resolve();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.value.poster, asset.value.url, asset.value.fileUrl]);

  return poster;
}
