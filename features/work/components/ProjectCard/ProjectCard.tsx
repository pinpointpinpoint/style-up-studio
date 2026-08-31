'use client'

/* eslint-disable @next/next/no-img-element -- Sanity image URLs are transformed upstream, and this card intentionally uses native images for hover loading control. */

import Link from 'next/link'
import React, {useMemo, useState} from 'react'
import {Project} from '@/types'
import styles from './ProjectCard.module.css'
import {getProjectCardMedia} from '../../lib/media/projectMediaPresentation'
import {getSanityProjectImageUrl} from '../../lib/media/sanityProjectImageUrl'

interface ProjectCardProps {
    project: Project
    index: number
    href: string
    onOpen?: () => void
    onHoverStart: () => void
}

const PRIORITY_PROJECT_CARD_COUNT = 9

const ProjectCard = ({project, index, href, onOpen, onHoverStart}: ProjectCardProps) => {
    const [isHovered, setIsHovered] = useState(false)
    const cardMedia = useMemo(
        () => getProjectCardMedia(project, {imageUrl: getSanityProjectImageUrl}),
        [project],
    )
    const previewVideoUrl = cardMedia.previewVideoUrl
    const shouldPrioritizeImage = index < PRIORITY_PROJECT_CARD_COUNT
    const hoverImage = cardMedia.hoverImage
    const activeImage =
        isHovered && !previewVideoUrl && hoverImage ? hoverImage : cardMedia.cardImage

    const handleMouseEnter = () => {
        setIsHovered(true)
        onHoverStart()
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
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
            {activeImage && (
                <img
                    src={activeImage.url}
                    alt={activeImage.alt}
                    className={styles.projectCardImage}
                    loading={shouldPrioritizeImage ? 'eager' : 'lazy'}
                    fetchPriority={shouldPrioritizeImage ? 'high' : 'low'}
                />
            )}
            {isHovered && previewVideoUrl && (
                <video
                    src={previewVideoUrl}
                    className={styles.projectCardMedia}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`Preview video for ${project.title ?? 'project'}`}
                    width="300"
                    height="300"
                />
            )}
        </Link>
    )
}

export default React.memo(ProjectCard)
