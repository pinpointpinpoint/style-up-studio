"use client";

import { useRef, useState } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  useMediaState,
  type MediaPlayerInstance,
} from "@vidstack/react";

import "./VideoPlayer.css";
import VideoOverlay from "./VideoOverlay";
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

  if (!src) return null;

function handlePlay() {
  if (!playerRef.current) return;

  setHasStarted(true);
  setHasEnded(false);

  if (canPlay) {
    playerRef.current.play().catch(err => {
      console.error("Play request failed:", err);
      setError("This video cannot be played.");
    });
  } else {
    // Wait for can-play event
    const onCanPlay = () => {
      playerRef.current?.play().catch(err => {
        console.error("Play request failed:", err);
        setError("This video cannot be played.");
      });
      playerRef.current?.removeEventListener("canplay", onCanPlay);
    };
    playerRef.current.addEventListener("canplay", onCanPlay);
  }
}

  // data-started is only present while the video is actively in play mode
  const showControls = hasStarted && !hasEnded;

  return (
    <div className="vp-root vp-player-wrapper" data-started={showControls }>
      <MediaPlayer
        ref={playerRef}
        src={src}
        playsInline
        className="vp-media-player"
        onEnded={() => setHasEnded(true)}
        onPlay={() => setHasEnded(false)}
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
          // title={title} 
          // onPlay={handlePlay}
           />
        {/* )}         */}

        <VideoControls />
      </MediaPlayer>
    </div>
  );
}