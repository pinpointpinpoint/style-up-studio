'use client';

import React, { useEffect, useMemo, useState } from 'react'
import { urlForImage } from '@/sanity/lib/utils'
import { Project } from '@/types'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
    project: Project
    index: number
    onHoverStart: (e: React.MouseEvent<HTMLButtonElement>) => void
    onHoverMove: (e: React.MouseEvent<HTMLButtonElement>) => void
    onHoverEnd: () => void
    hasMouseMoved: boolean
}

type ProjectCardMedia =
    | { kind: 'image'; url: string }

const CAROUSEL_INTERVAL_MS = 900
const PRELOAD_HOVER_IMAGE_COUNT = 2

function getAssetRef(image: Project['coverImage'] | undefined) {
    return image?.asset?._ref
}

const ProjectCard = ({
    project,
    index,
    onHoverEnd,
    onHoverMove,
    onHoverStart
}: ProjectCardProps) => {
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false)
    const [activeMediaIndex, setActiveMediaIndex] = useState(0)
    const imageUrl = urlForImage(project.coverImage)?.height(1200).width(1200).url()
    const hoverMedia = useMemo<ProjectCardMedia[]>(
        () => (project.gallery ?? [])
            .filter((image) => getAssetRef(image) !== getAssetRef(project.coverImage))
            .map((image) => urlForImage(image)?.height(1200).width(1200).url())
            .filter((url): url is string => Boolean(url))
            .map((url) => ({ kind: 'image' as const, url })),
        [project.coverImage, project.gallery]
    )
    const activeHoverMedia = isHovered && hoverMedia.length > 0
        ? hoverMedia[activeMediaIndex % hoverMedia.length]
        : null

    useEffect(() => {
        if (!isHovered || hoverMedia.length <= 1) return

        const intervalId = window.setInterval(() => {
            setActiveMediaIndex((currentIndex) => (currentIndex + 1) % hoverMedia.length)
        }, CAROUSEL_INTERVAL_MS)

        return () => window.clearInterval(intervalId)
    }, [hoverMedia.length, isHovered])

    useEffect(() => {
        if (loading || hoverMedia.length === 0) return

        hoverMedia.slice(0, PRELOAD_HOVER_IMAGE_COUNT).forEach((media) => {
            const image = new Image()
            image.decoding = 'async'
            image.src = media.url
        })
    }, [hoverMedia, loading])

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsHovered(true)
        setActiveMediaIndex(0)
        if (hoverMedia[0]) {
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
        <button
            className={`${styles.projectCard} ${loading ? styles.projectCardLoading : ''}`}
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
        </button>
    )
}

export default React.memo(ProjectCard)
