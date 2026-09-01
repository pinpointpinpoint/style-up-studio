'use client'

/* eslint-disable @next/next/no-img-element -- Sanity image URLs are transformed upstream, and this card intentionally uses native images for hover loading control. */

import Link from 'next/link'
import React, {useMemo, useState} from 'react'
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
    const cardMedia = useMemo(
        () =>
            getProjectCardMedia(project, {
                imageUrl: getSanityProjectImageUrl,
                imageSourceSet: getSanityProjectImageSourceSet,
            }),
        [project],
    )
    const previewVideoUrl = cardMedia.previewVideoUrl
    const shouldLoadEagerly = index < EAGER_PROJECT_CARD_COUNT
    const shouldPrioritizeImage = index < HIGH_PRIORITY_PROJECT_CARD_COUNT
    const hoverImage = cardMedia.hoverImage
    const activeImage =
        isHovered && !previewVideoUrl && hoverImage ? hoverImage : cardMedia.cardImage

    const handleMouseEnter = () => {
        setIsHovered(true)
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
                    srcSet={activeImage.srcSet}
                    sizes={activeImage.sizes}
                    alt={activeImage.alt}
                    className={styles.projectCardImage}
                    loading={shouldLoadEagerly ? 'eager' : 'lazy'}
                    fetchPriority={shouldPrioritizeImage ? 'high' : 'auto'}
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
