import {
    FullscreenButton,
    MuteButton,
    PlayButton,
    TimeSlider,
    useMediaRemote,
    useMediaState,
} from '@vidstack/react'
import type {MouseEvent} from 'react'
import styles from './VideoPlayer.module.css'

type VideoControlsProps = {
    onNativePlaybackRequest?: (trigger: Event) => void
}

function TimeDisplay() {
    const currentTime = useMediaState('currentTime')
    const duration = useMediaState('duration')

    function fmt(s: number): string {
        if (!isFinite(s)) return '0:00'
        const m = Math.floor(s / 60)
        const sec = Math.floor(s % 60)
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    return <span className={styles.time}>{fmt(currentTime)} / {fmt(duration)}</span>
}

export default function VideoControls({onNativePlaybackRequest}: VideoControlsProps) {
    const remote = useMediaRemote()
    const paused = useMediaState('paused')
    const ended = useMediaState('ended')
    const muted = useMediaState('muted')
    const volume = useMediaState('volume')
    const fullscreen = useMediaState('fullscreen')

    const handleReplay = (event: MouseEvent<HTMLButtonElement>) => {
        if (onNativePlaybackRequest) {
            onNativePlaybackRequest(event.nativeEvent)
            remote.seek(0, event.nativeEvent)
            remote.enterFullscreen('prefer-media', event.nativeEvent)
            remote.play(event.nativeEvent)
            return
        }

        remote.seek(0)
        remote.play()
    }

    const handleNativePlaybackRequest = (event: MouseEvent<HTMLButtonElement>) => {
        onNativePlaybackRequest?.(event.nativeEvent)
        remote.enterFullscreen('prefer-media', event.nativeEvent)
        remote.play(event.nativeEvent)
    }

    return (
        <div className={styles.controls}>
            {ended ? (
                <button
                    className={`${styles.gridBtn} ${styles.playBtn}`}
                    type="button"
                    aria-label="Replay"
                    onClick={handleReplay}
                >
                    [REPLAY]
                </button>
            ) : onNativePlaybackRequest ? (
                <button
                    className={`${styles.gridBtn} ${styles.playBtn}`}
                    type="button"
                    aria-label="Play"
                    onClick={handleNativePlaybackRequest}
                >
                    [PLAY]
                </button>
            ) : (
                <PlayButton
                    className={`${styles.gridBtn} ${styles.playBtn}`}
                    aria-label={paused ? 'Play' : 'Pause'}
                >
                    {paused ? '[PLAY]' : '[PAUSE]'}
                </PlayButton>
            )}
            <TimeDisplay />

            <TimeSlider.Root className={styles.progressTrack}>
                <TimeSlider.Track className={styles.sliderTrack}>
                    <TimeSlider.TrackFill className={styles.sliderFill} />
                </TimeSlider.Track>
                <TimeSlider.Thumb className={styles.sliderThumb} />
            </TimeSlider.Root>

            <MuteButton
                className={`${styles.gridBtn} ${styles.muteBtn}`}
                aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}
            >
                {muted || volume === 0 ? '[UNMUTE]' : '[MUTE]'}
            </MuteButton>

            {onNativePlaybackRequest ? (
                <button
                    className={`${styles.gridBtn} ${styles.fullscreenBtn}`}
                    type="button"
                    aria-label="Fullscreen"
                    onClick={handleNativePlaybackRequest}
                >
                    [FULLSCREEN]
                </button>
            ) : (
                <FullscreenButton
                    className={`${styles.gridBtn} ${styles.fullscreenBtn}`}
                    aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    target="prefer-media"
                >
                    {fullscreen ? '[EXIT]' : '[FULLSCREEN]'}
                </FullscreenButton>
            )}
        </div>
    )
}
