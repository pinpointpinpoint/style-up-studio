import { VolumeIcon, PlayIcon, PauseIcon, MuteIcon, FullscreenIcon, ShrinkIcon } from "./VideoIcons";
import { FullscreenButton, MuteButton, PlayButton, TimeSlider, ToggleButton, useMediaState } from "@vidstack/react";

function TimeDisplay() {
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");

  function fmt(s: number): string {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <span className="vp-time">
      {fmt(currentTime)} / {fmt(duration)}
    </span>
  );
}

export default function VideoControls() {
  const paused = useMediaState("paused");
  const muted = useMediaState("muted");
  const volume = useMediaState("volume");
  const fullscreen = useMediaState("fullscreen");

  return (
    <div className="vp-controls">
      {/* Play / Pause — Vidstack wires this to the player */}
      <PlayButton className="vp-grid-btn" aria-label={paused ? "Play" : "Pause"}>
        {paused ? <PlayIcon /> : <PauseIcon />}
      </PlayButton>
      {/* Time */}
      <TimeDisplay />

      {/* Scrub bar — Vidstack TimeSlider handles seeking */}
        <TimeSlider.Root className="vp-progress-track">
        <TimeSlider.Track className="vp-slider-track">
          <TimeSlider.TrackFill className="vp-slider-fill" />
        </TimeSlider.Track>
        <TimeSlider.Thumb className="vp-slider-thumb" />
      </TimeSlider.Root>
      

      {/* Mute — Vidstack wires this to the player */}
      <MuteButton
        className="vp-grid-btn"
        aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
      >
        {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
      </MuteButton>

      {/* Fullscreen — icon swaps based on fullscreen state */}
      <FullscreenButton
        className="vp-grid-btn"
        aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {fullscreen ? <ShrinkIcon /> : <FullscreenIcon />}
      </FullscreenButton>
    </div>
  );
}