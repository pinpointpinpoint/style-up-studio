import {FullscreenButton, MuteButton, PlayButton, TimeSlider, useMediaState} from '@vidstack/react'
import {FullscreenIcon, MuteIcon, PauseIcon, PlayIcon, ShrinkIcon, VolumeIcon} from './VideoIcons'
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
    const paused = useMediaState('paused')
    const muted = useMediaState('muted')
    const volume = useMediaState('volume')
    const fullscreen = useMediaState('fullscreen')

    return (
        <div className={styles.controls}>
            <PlayButton className={styles.gridBtn} aria-label={paused ? 'Play' : 'Pause'}>
                {paused ? <PlayIcon /> : <PauseIcon />}
            </PlayButton>
            <TimeDisplay />

            <TimeSlider.Root className={styles.progressTrack}>
                <TimeSlider.Track className={styles.sliderTrack}>
                    <TimeSlider.TrackFill className={styles.sliderFill} />
                </TimeSlider.Track>
                <TimeSlider.Thumb className={styles.sliderThumb} />
            </TimeSlider.Root>

            <MuteButton
                className={styles.gridBtn}
                aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}
            >
                {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
            </MuteButton>

            <FullscreenButton
                className={styles.gridBtn}
                aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
                {fullscreen ? <ShrinkIcon /> : <FullscreenIcon />}
            </FullscreenButton>
        </div>
    )
}
