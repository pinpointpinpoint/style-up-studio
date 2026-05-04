'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {getProjectCardMedia} from '@/lib/projectMediaPresentation'
import {getSanityProjectImageUrl} from '@/lib/sanityProjectImageUrl'
import {Project} from '@/types'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
    project: Project
    index: number
    href: string
    onOpen?: () => void
    onHoverStart: (e: React.MouseEvent<HTMLAnchorElement>) => void
    onHoverMove: (e: React.MouseEvent<HTMLAnchorElement>) => void
    hasMouseMoved: boolean
}

const CAROUSEL_INTERVAL_MS = 900
const PRIORITY_PROJECT_CARD_COUNT = 9
const PROJECT_CARD_HOVER_IMAGE_COUNT = 3
const PROJECT_CARD_IMAGE_SIZE = 1200

const ProjectCard = ({
    project,
    index,
    href,
    onOpen,
    onHoverMove,
    onHoverStart,
}: ProjectCardProps) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isPreviewReady, setIsPreviewReady] = useState(false)
    const [activeHoverIndex, setActiveHoverIndex] = useState(0)
    const previewVideoRef = useRef<HTMLVideoElement>(null)
    const cardMedia = useMemo(
        () => getProjectCardMedia(project, {imageUrl: getSanityProjectImageUrl}),
        [project],
    )
    const previewVideoUrl = cardMedia.previewVideoUrl
    const shouldPrioritizeImage = index < PRIORITY_PROJECT_CARD_COUNT
    const hoverImages = cardMedia.hoverImages.slice(0, PROJECT_CARD_HOVER_IMAGE_COUNT)
    const activeImage =
        isHovered && !previewVideoUrl && hoverImages.length > 0
            ? hoverImages[activeHoverIndex % hoverImages.length]
            : cardMedia.cardImage
    const showPlaceholder = !activeImage

    useEffect(() => {
        if (previewVideoUrl) return
        if (!isHovered || hoverImages.length <= 1) return

        const intervalId = window.setInterval(() => {
            setActiveHoverIndex((currentIndex) => (currentIndex + 1) % hoverImages.length)
        }, CAROUSEL_INTERVAL_MS)

        return () => window.clearInterval(intervalId)
    }, [hoverImages.length, isHovered, previewVideoUrl])

    useEffect(() => {
        const video = previewVideoRef.current

        if (!video || !previewVideoUrl) return

        if (!isHovered) {
            video.pause()
            video.currentTime = 0
            return
        }

        video.currentTime = 0
        video.play().catch(() => {
            // Muted inline playback should be allowed, but ignore browser-level refusal.
        })
    }, [isHovered, previewVideoUrl])

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        setIsHovered(true)
        setActiveHoverIndex(0)
        onHoverStart(e)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        setActiveHoverIndex(0)
    }

    const renderHoverMedia = () => {
        if (previewVideoUrl) {
            return (
                <video
                    ref={previewVideoRef}
                    src={previewVideoUrl}
                    className={`${styles.projectCardMedia} ${!isHovered || !isPreviewReady ? styles.projectCardMediaHidden : ''}`}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onCanPlay={() => setIsPreviewReady(true)}
                    aria-label={`Preview video for ${project.title ?? 'project'}`}
                    width="300"
                    height="300"
                />
            )
        }

        return null
    }

    return (
        <Link
            href={href}
            className={`${styles.projectCard} ${showPlaceholder ? styles.projectCardLoading : ''}`}
            aria-label={`View ${project.title ?? 'project'}`}
            onMouseEnter={handleMouseEnter}
            onMouseMove={onHoverMove}
            onMouseLeave={handleMouseLeave}
            onClick={onOpen}
        >
            {activeImage && (
                <Image
                    src={activeImage.url}
                    alt={activeImage.alt}
                    className={`${styles.projectCardImage} ${styles.projectCardImageLoaded}`}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    priority={shouldPrioritizeImage}
                    unoptimized
                />
            )}
            {!previewVideoUrl &&
                hoverImages.map((hoverImage) => (
                    <Image
                        key={hoverImage.url}
                        src={hoverImage.url}
                        alt=""
                        aria-hidden="true"
                        className={styles.projectCardPreloadImage}
                        width={PROJECT_CARD_IMAGE_SIZE}
                        height={PROJECT_CARD_IMAGE_SIZE}
                        loading="eager"
                        unoptimized
                    />
                ))}
            {renderHoverMedia()}
        </Link>
    )
}

export default React.memo(ProjectCard)
