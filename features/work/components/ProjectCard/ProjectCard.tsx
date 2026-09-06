'use client'

/* eslint-disable @next/next/no-img-element -- Sanity image URLs are transformed upstream, and this card intentionally uses native images for hover loading control. */

import Link from 'next/link'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Project} from '@/types'
import styles from './ProjectCard.module.css'
import {getProjectCardMedia} from '../../lib/media/projectMediaPresentation'
import {startProjectHoverPreview} from '../../lib/media/projectHoverPreview'
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
    const previewRef = useRef<HTMLVideoElement | null>(null)
    const [previewFailure, setPreviewFailure] = useState<{src: string; reason: string} | null>(null)
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
    const hasPreviewFailed = previewFailure?.src === previewVideoUrl
    const shouldShowPreview = isHovered && Boolean(previewVideoUrl) && !hasPreviewFailed
    const activeImage =
        isHovered && (!previewVideoUrl || hasPreviewFailed) && hoverImage
            ? hoverImage
            : cardMedia.cardImage

    useEffect(() => {
        const video = previewRef.current
        if (!shouldShowPreview || !previewVideoUrl || !video) return

        return startProjectHoverPreview(video, (error) => {
            setPreviewFailure({
                src: previewVideoUrl,
                reason: error instanceof Error ? error.name : 'PlaybackError',
            })
        })
    }, [previewVideoUrl, shouldShowPreview])

    const handleMouseEnter = () => {
        setPreviewFailure(null)
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
    }

    return (
        <Link
            href={href}
            className={styles.projectCard}
            data-preview-error={hasPreviewFailed ? previewFailure?.reason : undefined}
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
            {shouldShowPreview && previewVideoUrl && (
                <video
                    ref={previewRef}
                    src={previewVideoUrl}
                    poster={cardMedia.cardImage?.url}
                    className={styles.projectCardMedia}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onError={(event) => {
                        setPreviewFailure({
                            src: previewVideoUrl,
                            reason: `MediaError:${event.currentTarget.error?.code ?? 'unknown'}`,
                        })
                    }}
                    aria-label={`Preview video for ${project.title ?? 'project'}`}
                    width="300"
                    height="300"
                />
            )}
        </Link>
    )
}

export default React.memo(ProjectCard)
