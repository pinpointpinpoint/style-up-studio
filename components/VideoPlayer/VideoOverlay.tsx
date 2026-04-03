import { useMediaState } from "@vidstack/react";

interface OverlayProps {
  poster: string | null;
  title: string;
  onPlay: () => void;
}

export default function VideoOverlay({ poster, title, onPlay }: OverlayProps) {
  const playing = useMediaState("playing");

  return (
    <div
      className={`vp-overlay${playing ? " vp-overlay--hidden" : ""}`}
      onClick={!playing ? onPlay : undefined}
      aria-hidden={playing}
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={title} className="vp-poster-img" />
      ) : (
        <div className="vp-poster-placeholder" />
      )}
      <div className="vp-overlay-inner">
        <div className="vp-big-play-btn" aria-label="Play video">
          Play
        </div>
      </div>
    </div>
  );
}