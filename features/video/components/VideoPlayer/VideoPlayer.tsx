'use client'

import '@vidstack/react/player/styles/base.css'
import {createContext, useCallback, useContext, useEffect, useState} from 'react'
import {
    MediaPlayer,
    MediaProvider,
    Poster,
    PlayButton,
    sortVideoQualities,
    useMediaPlayer,
    useMediaRemote,
    useMediaState,
} from '@vidstack/react'

import {getExternalVideoProvider, getExternalVideoSourceUrl} from '@/features/video/lib/videoMedia'
import {PlayIcon} from './VideoIcons'
import VideoControls from './VideoControls'
import styles from './VideoPlayer.module.css'

interface VideoPlayerProps {
    src: string
    poster?: string
    title?: string
}

function getVideoPlaybackErrorDetails(src: string) {
    const provider = getExternalVideoProvider(src)

    if (provider?.provider === 'youtube') {
        return {
            message: 'This video is restricted in the embedded player.',
            actionLabel: 'Watch on YouTube',
        }
    }

    if (provider?.provider === 'vimeo') {
        return {
            message: 'This video could not be played in the embedded player.',
            actionLabel: 'Watch on Vimeo',
        }
    }

    return {
        message: 'This video could not be played in the embedded player.',
        actionLabel: 'Open original video',
    }
}

function VideoFrameToggle() {
    const remote = useMediaRemote()
    const paused = useMediaState('paused')
    const onPlayAttempt = useVideoPlayAttempt()

    const handleClick = () => {
        if (paused) {
            onPlayAttempt()
            remote.play()
        } else {
            remote.pause()
        }
    }

    return <button type="button" className={styles.frameToggle} onClick={handleClick} aria-label={paused ? 'Play video' : 'Pause video'} />
}

function VideoQualityManager() {
    const player = useMediaPlayer()
    const remote = useMediaRemote()
    const qualities = useMediaState('qualities')
    const currentQuality = useMediaState('quality')
    const canSetQuality = useMediaState('canSetQuality')

    useEffect(() => {
        if (!player || !canSetQuality || qualities.length === 0) return
        if (player.qualities.readonly) return

        const highestQuality = sortVideoQualities(qualities, true)[0]

        if (!highestQuality || currentQuality?.id === highestQuality.id) return

        const highestQualityIndex = qualities.findIndex(
            (quality) => quality.id === highestQuality.id
        )

        if (highestQualityIndex === -1) return

        remote.changeQuality(highestQualityIndex)
    }, [canSetQuality, currentQuality?.id, player, qualities, remote])

    return null
}

const VideoPlayAttemptContext = createContext<() => void>(() => {})

function useVideoPlayAttempt() {
    return useContext(VideoPlayAttemptContext)
}

export default function VideoPlayer(props: VideoPlayerProps) {
    if (!props.src) return null

    return <VideoPlayerInstance key={props.src} {...props} />
}

function VideoPlayerInstance({src, poster, title}: VideoPlayerProps) {
    const [hasStarted, setHasStarted] = useState(false)
    const [hasEnded, setHasEnded] = useState(false)
    const [hasPlaybackFailed, setHasPlaybackFailed] = useState(false)
    const [hasPendingPlayAttempt, setHasPendingPlayAttempt] = useState(false)
    const provider = getExternalVideoProvider(src)
    const {message, actionLabel} = getVideoPlaybackErrorDetails(src)
    const sourceUrl = getExternalVideoSourceUrl(src) ?? src
    const shouldReleasePosterOnPlayAttempt = provider?.provider === 'youtube' || provider?.provider === 'vimeo'

    const isWaitingForEmbedPlayback = hasPendingPlayAttempt && !hasStarted && !hasPlaybackFailed
    const showPoster = (!hasPendingPlayAttempt && (!hasStarted || hasEnded)) || hasPlaybackFailed
    const showControls = hasStarted && !hasEnded && !hasPlaybackFailed

    const handlePlayAttempt = useCallback(() => {
        if (shouldReleasePosterOnPlayAttempt) {
            setHasPendingPlayAttempt(true)
        }
    }, [shouldReleasePosterOnPlayAttempt])

    const handlePlay = useCallback(() => {
        setHasStarted(true)
        setHasEnded(false)
        setHasPlaybackFailed(false)
        setHasPendingPlayAttempt(false)
    }, [])

    const handlePlayFail = useCallback(() => {
        setHasPlaybackFailed(true)
        setHasPendingPlayAttempt(false)
    }, [])

    return (
        <div className={`${styles.root} ${styles.playerWrapper}`} data-started={showControls ? '' : undefined}>
            <MediaPlayer
                src={src}
                title={title}
                playsInline
                className={styles.mediaPlayer}
                onEnded={() => setHasEnded(true)}
                onPlay={handlePlay}
                onPlaying={handlePlay}
                onPlayFail={(e) => {
                    handlePlayFail()
                    console.error('Media play failed:', e)
                }}
                onError={(e) => {
                    setHasPlaybackFailed(true)
                    console.error('Media error:', e)
                }}
            >
                <MediaProvider />

                <VideoPlayAttemptContext.Provider value={handlePlayAttempt}>
                    <VideoQualityManager />

                    {hasPlaybackFailed || isWaitingForEmbedPlayback ? null : <VideoFrameToggle />}

                    {poster ? (
                        <Poster
                            className={`${styles.poster} ${showPoster ? styles.posterVisible : ''}`}
                            src={poster}
                        />
                    ) : null}

                    {showPoster && !hasPlaybackFailed ? (
                        <PlayButton
                            className={styles.playOverlay}
                            aria-label="Play video"
                            onClick={handlePlayAttempt}
                        >
                            <span className={styles.playIcon}>
                                <PlayIcon size={22} />
                            </span>
                        </PlayButton>
                    ) : null}

                    {hasPlaybackFailed ? (
                        <div className={styles.errorOverlay} role="alert" aria-live="polite">
                            <p className={styles.errorMessage}>{message}</p>
                            <a
                                className={styles.errorAction}
                                href={sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {actionLabel}
                            </a>
                        </div>
                    ) : null}

                    {hasPlaybackFailed ? null : <VideoControls />}
                </VideoPlayAttemptContext.Provider>
            </MediaPlayer>
        </div>
    )
}
