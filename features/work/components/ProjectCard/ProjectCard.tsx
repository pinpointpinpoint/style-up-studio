'use client'

import Link from 'next/link'
import React, {useMemo, useRef, useState} from 'react'
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

const ProjectCard = ({project, index, href, onOpen}: ProjectCardProps) => {
    const [failedVideoUrl, setFailedVideoUrl] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    const cardMedia = useMemo(
        () =>
            getProjectCardMedia(project, {
                imageUrl: getSanityProjectImageUrl,
                imageSourceSet: getSanityProjectImageSourceSet,
            }),
        [project],
    )

    const previewVideoUrl = cardMedia.previewVideoUrl?.trim() || null
    const showVideo = Boolean(previewVideoUrl && previewVideoUrl !== failedVideoUrl)
    const activeImage = cardMedia.cardImage

    const handleMouseEnter = () => {
        videoRef.current?.play().catch(() => {})
    }

    const handleMouseLeave = () => {
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
                    key={previewVideoUrl}
                    data-intro-preview
                    ref={videoRef}
                    src={previewVideoUrl}
                    poster={activeImage?.url}
                    onError={() => setFailedVideoUrl(previewVideoUrl)}
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
