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

const DESKTOP_QUERY = '(min-width: 769px)'
function subscribeToViewport(onChange: () => void) {
    const query = window.matchMedia(DESKTOP_QUERY)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
}
const isDesktopViewport = () => window.matchMedia(DESKTOP_QUERY).matches
const serverViewport = () => false

const ProjectCard = ({project, index, href, onOpen}: ProjectCardProps) => {
    const [isHovered, setIsHovered] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const isDesktop = useSyncExternalStore(subscribeToViewport, isDesktopViewport, serverViewport)

    const cardMedia = useMemo(
        () =>
            getProjectCardMedia(project, {
                imageUrl: getSanityProjectImageUrl,
                imageSourceSet: getSanityProjectImageSourceSet,
            }),
        [project],
    )

    const previewVideoUrl = cardMedia.previewVideoUrl
    const showVideo = isDesktop && Boolean(previewVideoUrl)
    const hoverImage = cardMedia.hoverImage

    const activeImage =
        isHovered && !previewVideoUrl && hoverImage
            ? hoverImage
            : cardMedia.cardImage

    const handleMouseEnter = () => {
        if (!isDesktop) return
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
            {!showVideo && activeImage && (
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
