'use client'

import '@vidstack/react/player/styles/base.css'
import {MediaPlayer, MediaProvider, Poster, useMediaRemote, useMediaState} from '@vidstack/react'
import {useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent} from 'react'
import useExternalPlaybackFallback from '../../hooks/useExternalPlaybackFallback'
import VideoControls from './VideoControls'
import styles from './VideoPlayer.module.css'

interface VideoPlayerProps {
    activeVideoId?: string | null
    onPlay?: (videoId: string) => void
    src: string
    poster?: string
    title?: string
    videoId?: string
}

function VideoFrameToggle() {
    const remote = useMediaRemote()
    const paused = useMediaState('paused')

    const handleClick = () => {
        try {
            if (paused) {
                remote.play()
                return
            }

            remote.pause()
        } catch {
            // The provider can disappear while navigating away.
        }
    }

    return (
        <button
            type="button"
            className={styles.frameToggle}
            onClick={handleClick}
            aria-label={paused ? 'Play video' : 'Pause video'}
        />
    )
}

function CustomVideoLayout({src}: {src: string}) {
    const viewType = useMediaState('viewType')
    const streamType = useMediaState('streamType')
    const started = useMediaState('started')
    const ended = useMediaState('ended')
    const fallback = useExternalPlaybackFallback(src)

    if (viewType !== 'video' || streamType !== 'on-demand') return null

    return (
        <>
            {(!started || ended) && <Poster className={styles.poster} />}
            {fallback ? (
                <div className={styles.playbackFallback}>
                    <p role="status">Playback is unavailable here.</p>
                    <a href={fallback.url} target="_blank" rel="noopener noreferrer">
                        Watch on {fallback.label} ↗
                    </a>
                </div>
            ) : (
                <VideoFrameToggle />
            )}
            <VideoControls />
        </>
    )
}

function ActiveVideoSync({
    activeVideoId,
    videoId,
}: {
    activeVideoId?: string | null
    videoId?: string
}) {
    const remote = useMediaRemote()
    const paused = useMediaState('paused')

    useEffect(() => {
        if (!videoId || !activeVideoId || activeVideoId === videoId || paused) return

        try {
            remote.pause()
        } catch {
            // The provider can disappear while navigating away.
        }
    }, [activeVideoId, paused, remote, videoId])

    return null
}

export default function VideoPlayer({
    activeVideoId,
    onPlay,
    src,
    poster,
    title,
    videoId,
}: VideoPlayerProps) {
    const hideControlsTimer = useRef<number | null>(null)
    const controlsHiddenAt = useRef(0)
    const lastPointerPosition = useRef<{x: number; y: number} | null>(null)
    const [controlsVisible, setControlsVisible] = useState(true)

    const clearHideControlsTimer = useCallback(() => {
        if (!hideControlsTimer.current) return

        window.clearTimeout(hideControlsTimer.current)
        hideControlsTimer.current = null
    }, [])

    const showControls = useCallback(() => {
        setControlsVisible(true)
        clearHideControlsTimer()

        hideControlsTimer.current = window.setTimeout(() => {
            setControlsVisible(false)
        }, 1800)
    }, [clearHideControlsTimer])

    const hideControls = useCallback(() => {
        clearHideControlsTimer()
        controlsHiddenAt.current = window.performance.now()
        setControlsVisible(false)
    }, [clearHideControlsTimer])

    const handleFocus = useCallback(
        (event: FocusEvent<HTMLDivElement>) => {
            // Vidstack focuses the player when its idle timer hides controls.
            // Only keyboard focus on an actual control should reveal our bar.
            if (event.target.matches('[data-media-player]')) return
            if (!event.target.matches(':focus-visible')) return

            showControls()
        },
        [showControls],
    )

    const handlePlay = useCallback(() => {
        if (!videoId) return

        onPlay?.(videoId)
    }, [onPlay, videoId])

    const handlePointerMove = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType !== 'mouse') return

            const nextPointerPosition = {x: event.clientX, y: event.clientY}
            const lastPosition = lastPointerPosition.current
            const pointerDelta = lastPosition
                ? Math.abs(lastPosition.x - nextPointerPosition.x) +
                  Math.abs(lastPosition.y - nextPointerPosition.y)
                : Number.POSITIVE_INFINITY

            lastPointerPosition.current = nextPointerPosition

            if (pointerDelta < 3) return
            if (window.performance.now() - controlsHiddenAt.current < 1000) return

            showControls()
        },
        [showControls],
    )

    const handlePointerEnter = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType !== 'mouse') return

            lastPointerPosition.current = {x: event.clientX, y: event.clientY}
            showControls()
        },
        [showControls],
    )

    const handlePointerLeave = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType !== 'mouse') return

            hideControls()
        },
        [hideControls],
    )

    useEffect(() => clearHideControlsTimer, [clearHideControlsTimer])

    if (!src) return null

    return (
        <div
            className={`${styles.root} ${styles.playerWrapper}`}
            data-controls-visible={controlsVisible ? true : undefined}
            onFocus={handleFocus}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerMove={handlePointerMove}
        >
            <MediaPlayer
                src={src}
                controls={false}
                poster={poster}
                viewType="video"
                streamType="on-demand"
                playsInline
                className={styles.mediaPlayer}
                onPlay={handlePlay}
            >
                <MediaProvider />
                <ActiveVideoSync activeVideoId={activeVideoId} videoId={videoId} />
                <CustomVideoLayout key={src} src={src} />
            </MediaPlayer>
        </div>
    )
}
