import { useEffect, useRef } from "react";

type VideoPlayerProps = {
  type: "youtube" | "mp4";
  src: string; // For YouTube, this is the VIDEO_ID
};

export default function VideoPlayer({ type, src }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  // YouTube setup
  useEffect(() => {
    if (type !== "youtube") return;

    // Load script only if not already loaded
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // Function to create the player
    const createPlayer = () => {
      if ((window as any).YT && containerRef.current) {
        playerRef.current = new (window as any).YT.Player(containerRef.current, {
          videoId: src,
          playerVars: {
            autoplay: 0,
            controls: 0,        // hide YouTube controls
            modestbranding: 1,
            rel: 0,
          },
        });
      }
    };

    // Check every 100ms until YT is ready
    let interval = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        createPlayer();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [src, type]);

  // Play button handler
  const play = () => {
    if (type === "youtube") {
      playerRef.current?.playVideo();
    } else if (type === "mp4") {
      videoRef.current?.play();
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
      {type === "mp4" && (
        <video
          ref={videoRef}
          src={src}
          style={{ width: "100%", height: "100%" }}
          controls={false}
        />
      )}
      {type === "youtube" && <div ref={containerRef} />}
      <button
        onClick={play}
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          padding: "8px 12px",
          zIndex: 10,
        }}
      >
        Play
      </button>
    </div>
  );
}
