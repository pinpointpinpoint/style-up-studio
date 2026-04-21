'use client';

import { useCallback, useRef, useState } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  useMediaState,
  type MediaPlayerInstance,
} from "@vidstack/react";

import "./VideoPlayer.css";
import VideoControls from "./VideoControls";
import { SanityAsset } from "@/types";
import useAutoPoster from "@/hooks/useAutoPoster";
import resolveSource from "@/utils/resolveSource";

interface VideoPlayerProps {
  asset: SanityAsset;
  title?: string;
}

export default function VideoPlayer({ asset }: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [error, setError] = useState<string>("");

  const poster = useAutoPoster(asset);
  const src = resolveSource(asset);

  const canPlay = useMediaState("canPlay", playerRef);

  const handlePlayRequest = useCallback(() => {
    if (!playerRef.current) return;

    setHasStarted(true);
    setHasEnded(false);

    if (canPlay) {
      playerRef.current.play().catch(err => {
        console.error("Play request failed:", err);
        setError("This video cannot be played.");
      });
    } else {
      const onCanPlay = () => {
        playerRef.current?.play().catch(err => {
          console.error("Play request failed:", err);
          setError("This video cannot be played.");
        });
        playerRef.current?.removeEventListener("canplay", onCanPlay);
      };
      playerRef.current.addEventListener("canplay", onCanPlay);
    }
  }, [canPlay]);

  const handlePlay = useCallback(() => {
    setHasStarted(true);
    setHasEnded(false);
  }, []);

  if (!src) return null;

  // data-started is only present while the video is actively in play mode
  const showControls = hasStarted && !hasEnded;

  return (
    <div className="vp-root vp-player-wrapper" data-started={showControls ? '' : undefined}>
      <MediaPlayer
        ref={playerRef}
        src={src}
        playsInline
        className="vp-media-player"
        onEnded={() => setHasEnded(true)}
        onPlay={handlePlay}
        onPlaying={handlePlay}
        onError={(e) => {
          console.error("Media error:", e);
          setError("Cannot play video due to error.");
        }}
      >
        <MediaProvider />
        {/* {error ? (
          <div className="vp-error-overlay">{error}</div>
        ) : ( */}
          <Poster 
            className="media-poster"
            src={poster} 
            onClick={handlePlayRequest}
           />
        {/* )}         */}

        <VideoControls />
      </MediaPlayer>
    </div>
  );
}
