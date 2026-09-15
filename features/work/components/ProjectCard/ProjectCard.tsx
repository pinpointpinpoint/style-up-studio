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
    const [isHovered, setIsHovered] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const cardMedia = useMemo(
        () =>
            getProjectCardMedia(project, {
                imageUrl: getSanityProjectImageUrl,
                imageSourceSet: getSanityProjectImageSourceSet,
            }),
        [project],
    )

    const previewVideoUrl = cardMedia.previewVideoUrl
    const hoverImage = cardMedia.hoverImage

    const activeImage =
        isHovered && !previewVideoUrl && hoverImage
            ? hoverImage
            : cardMedia.cardImage

    const handleMouseEnter = () => {
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
            {!previewVideoUrl && activeImage && (
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

            {previewVideoUrl && (
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