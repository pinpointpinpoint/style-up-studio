'use client';

import Link from 'next/link'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { urlForImage } from '@/sanity/lib/utils'
import { Project } from '@/types'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
    project: Project
    index: number
    href: string
    onHoverStart: (e: React.MouseEvent<HTMLAnchorElement>) => void
    onHoverMove: (e: React.MouseEvent<HTMLAnchorElement>) => void
    onHoverEnd: () => void
    hasMouseMoved: boolean
}

type ProjectCardMedia =
    | { kind: 'image'; url: string }

const CAROUSEL_INTERVAL_MS = 900
const PRELOAD_HOVER_IMAGE_COUNT = 2
const MIN_CAROUSEL_IMAGE_COUNT = 3

function getAssetRef(image: Project['coverImage'] | undefined) {
    return image?.asset?._ref
}

const ProjectCard = ({
    project,
    index,
    href,
    onHoverEnd,
    onHoverMove,
    onHoverStart
}: ProjectCardProps) => {
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false)
    const [isPreviewReady, setIsPreviewReady] = useState(false)
    const [activeMediaIndex, setActiveMediaIndex] = useState(0)
    const previewVideoRef = useRef<HTMLVideoElement>(null)
    const imageUrl = urlForImage(project.coverImage)?.height(1200).width(1200).url()
    const previewVideoUrl = project.previewUrl
    const hoverMedia = useMemo<ProjectCardMedia[]>(
        () => {
            const coverAssetRef = getAssetRef(project.coverImage)
            const galleryImages = project.gallery ?? []
            const nonCoverGalleryImages = galleryImages.filter((image) => getAssetRef(image) !== coverAssetRef)

            return [
                ...nonCoverGalleryImages.map((image) => urlForImage(image)?.height(1200).width(1200).url()),
                imageUrl,
            ]
            .filter((url): url is string => Boolean(url))
            .map((url) => ({ kind: 'image' as const, url }))
        },
        [imageUrl, project.gallery]
    )
    const activeHoverMedia = isHovered && hoverMedia.length > 0
        ? hoverMedia[activeMediaIndex % hoverMedia.length]
        : null

    useEffect(() => {
        if (previewVideoUrl) return
        if (!isHovered || hoverMedia.length < MIN_CAROUSEL_IMAGE_COUNT) return

        const intervalId = window.setInterval(() => {
            setActiveMediaIndex((currentIndex) => (currentIndex + 1) % hoverMedia.length)
        }, CAROUSEL_INTERVAL_MS)

        return () => window.clearInterval(intervalId)
    }, [hoverMedia.length, isHovered, previewVideoUrl])

    useEffect(() => {
        if (hoverMedia.length === 0) return
        if (previewVideoUrl) return

        hoverMedia.slice(0, PRELOAD_HOVER_IMAGE_COUNT).forEach((media) => {
            const image = new Image()
            image.decoding = 'async'
            image.src = media.url
        })
    }, [hoverMedia, previewVideoUrl])

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
        setActiveMediaIndex(0)
        if (!previewVideoUrl && hoverMedia[0]) {
            const image = new Image()
            image.decoding = 'async'
            image.src = hoverMedia[0].url
            image.decode?.().catch(() => {})
        }
        onHoverStart(e)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        setActiveMediaIndex(0)
        onHoverEnd()
    }

    const renderHoverMedia = () => {
        if (previewVideoUrl) {
            return (
                <video
                    ref={previewVideoRef}
                    src={previewVideoUrl}
                    poster={imageUrl}
                    className={`${styles.projectCardMedia} ${(!isHovered || !isPreviewReady) ? styles.projectCardMediaHidden : ''}`}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onCanPlay={() => setIsPreviewReady(true)}
                    aria-label={`Preview video for ${project.title ?? "project"}`}
                />
            )
        }

        if (!activeHoverMedia) return null

        if (activeHoverMedia.kind === 'image') {
            return (
                <img
                    src={activeHoverMedia.url}
                    alt={`Gallery image for ${project.title ?? "project"}`}
                    className={styles.projectCardMedia}
                />
            )
        }

        return null
    }

    return (
        <Link
            href={href}
            className={`${styles.projectCard} ${loading ? styles.projectCardLoading : ''}`}
            aria-label={`View ${project.title ?? "project"}`}
            onMouseEnter={handleMouseEnter}
            onMouseMove={onHoverMove}
            onMouseLeave={handleMouseLeave}
        >
            <img
                src={imageUrl}
                alt={`Cover image for ${project.title ?? "project"}`}     
                className={`${styles.projectCardImage} ${!loading ? styles.projectCardImageLoaded : ''}`}
                loading={index < 6 ? "eager" : "lazy"} 
                fetchPriority={index < 6 ? "high" : "low"}               
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
            />
            {renderHoverMedia()}
        </Link>
    )
}

export default React.memo(ProjectCard)
