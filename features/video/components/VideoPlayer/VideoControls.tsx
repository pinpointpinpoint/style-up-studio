import {
    FullscreenButton,
    MuteButton,
    PlayButton,
    TimeSlider,
    useMediaRemote,
    useMediaState,
} from '@vidstack/react'
import styles from './VideoPlayer.module.css'

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

export default function VideoControls() {
    const remote = useMediaRemote()
    const paused = useMediaState('paused')
    const ended = useMediaState('ended')
    const muted = useMediaState('muted')
    const volume = useMediaState('volume')
    const fullscreen = useMediaState('fullscreen')

    const handleReplay = () => {
        remote.seek(0)
        remote.play()
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

            <FullscreenButton
                className={`${styles.gridBtn} ${styles.fullscreenBtn}`}
                aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
                {fullscreen ? '[EXIT]' : '[FULLSCREEN]'}
            </FullscreenButton>
        </div>
    )
}
