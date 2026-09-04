'use client'

import '@vidstack/react/player/styles/base.css'
import {MediaPlayer, MediaProvider, Poster, useMediaRemote, useMediaState} from '@vidstack/react'
import {useCallback, useEffect, useRef, useState, type PointerEvent} from 'react'
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

function CustomVideoLayout() {
    const viewType = useMediaState('viewType')
    const streamType = useMediaState('streamType')

    if (viewType !== 'video' || streamType !== 'on-demand') return null

    return (
        <>
            <Poster className={styles.poster} />
            <VideoFrameToggle />
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
        setControlsVisible(false)
    }, [clearHideControlsTimer])

    const handlePlay = useCallback(() => {
        if (!videoId) return

        onPlay?.(videoId)
    }, [onPlay, videoId])

    const handlePointerMove = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType !== 'mouse') return

            showControls()
        },
        [showControls],
    )

    const handlePointerEnter = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType !== 'mouse') return

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
            onFocus={showControls}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerMove={handlePointerMove}
        >
            <MediaPlayer
                src={src}
                poster={poster}
                title={title}
                playsInline
                className={styles.mediaPlayer}
                onPlay={handlePlay}
            >
                <MediaProvider />
                <ActiveVideoSync activeVideoId={activeVideoId} videoId={videoId} />
                <CustomVideoLayout />
            </MediaPlayer>
        </div>
    )
}
