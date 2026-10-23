'use client'

import Link from 'next/link'
import React, {useMemo, useRef, useState, useSyncExternalStore} from 'react'
import {Project} from '@/types'
import styles from './ProjectCard.module.css'
import {getProjectCardMedia} from '../../lib/media/projectMediaPresentation'
import {
    getSanityProjectImageSourceSet,
    getSanityProjectImageUrl,
} from '../../lib/media/sanityProjectImageUrl'

interface ProjectCardProps {
    project: Project
    index: number
    href: string
    onOpen?: () => void
}

const EAGER_PROJECT_CARD_COUNT = 8
const HIGH_PRIORITY_PROJECT_CARD_COUNT = 2

const HOVER_QUERY = '(hover: hover) and (pointer: fine)'
const TOUCH_QUERY = '(any-pointer: coarse)'

function subscribeToInput(onChange: () => void) {
    const queries = [HOVER_QUERY, TOUCH_QUERY].map(query => window.matchMedia(query))
    queries.forEach(query => query.addEventListener('change', onChange))
    return () => queries.forEach(query => query.removeEventListener('change', onChange))
}

const supportsVideoPreview = () => navigator.maxTouchPoints === 0
    && window.matchMedia(HOVER_QUERY).matches
    && !window.matchMedia(TOUCH_QUERY).matches
// The server cannot detect touch input. Wait for the client before choosing media.
const serverVideoPreview = () => null

const ProjectCard = ({project, index, href, onOpen}: ProjectCardProps) => {
    const [isHovered, setIsHovered] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canPreview = useSyncExternalStore<boolean | null>(subscribeToInput, supportsVideoPreview, serverVideoPreview)

    const cardMedia = useMemo(
        () =>
            getProjectCardMedia(project, {
                imageUrl: getSanityProjectImageUrl,
                imageSourceSet: getSanityProjectImageSourceSet,
            }),
        [project],
    )

    const previewVideoUrl = cardMedia.previewVideoUrl
    const showVideo = canPreview && Boolean(previewVideoUrl)
    const hoverImage = cardMedia.hoverImage

    const activeImage =
        canPreview && isHovered && !previewVideoUrl && hoverImage
            ? hoverImage
            : cardMedia.cardImage

    const handleMouseEnter = () => {
        if (!canPreview) return
        setIsHovered(true)
        videoRef.current?.play()
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        videoRef.current?.pause()
    }

    return (
        <Link
            href={href}
            className={styles.projectCard}
            aria-label={`View ${project.title ?? 'project'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onOpen}
        >
            {(!previewVideoUrl || canPreview === false) && activeImage && (
                <img
                    src={activeImage.url}
                    srcSet={activeImage.srcSet}
                    sizes={activeImage.sizes}
                    alt={activeImage.alt}
                    className={styles.projectCardImage}
                    loading={
                        index < EAGER_PROJECT_CARD_COUNT
                            ? 'eager'
                            : 'lazy'
                    }
                    fetchPriority={
                        index < HIGH_PRIORITY_PROJECT_CARD_COUNT
                            ? 'high'
                            : 'auto'
                    }
                />
            )}

            {showVideo && previewVideoUrl && (
                <video
                    ref={videoRef}
                    src={previewVideoUrl}
                    // className={`${styles.projectCardMedia} ${
                    //     isHovered
                    //         ? styles.previewVisible
                    //         : styles.previewHidden
                    // }`}
                    className={styles.projectCardMedia}
                    muted
                    loop
                    playsInline
                    preload="auto"
                />
            )}
        </Link>
    )
}

export default React.memo(ProjectCard)
