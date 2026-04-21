'use client';

import { AnimatePresence, motion } from 'framer-motion'
import { PortableText } from 'next-sanity'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Project } from '@/types'
import { urlForImage } from '@/sanity/lib/utils'
import getVimeoId from '@/utils/getVimeoId'
import getYouTubeId from '@/utils/getYouTubeId'
import styles from "./ProjectDetails.module.css";

type SidebarThumbnail = {
    key: string
    url: string
    alt: string
}

const THUMBNAIL_WIDTH = 30
const THUMBNAIL_GAP = 5
const ASSETS_HORIZONTAL_PADDING = 60
const COUNT_BADGE_WIDTH = 30
const vimeoThumbnailCache = new Map<string, string | null>()

async function getVimeoThumbnail(url: string) {
    const vimeoId = getVimeoId(url)

    if (!vimeoId) return null
    if (vimeoThumbnailCache.has(vimeoId)) return vimeoThumbnailCache.get(vimeoId) ?? null

    try {
        const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`)

        if (!response.ok) {
            vimeoThumbnailCache.set(vimeoId, null)
            return null
        }

        const data = await response.json()
        const thumbnailUrl = typeof data.thumbnail_url === 'string'
            ? data.thumbnail_url.replace(/_\d+x\d+/, '_295x166')
            : null

        vimeoThumbnailCache.set(vimeoId, thumbnailUrl)
        return thumbnailUrl
    } catch {
        vimeoThumbnailCache.set(vimeoId, null)
        return null
    }
}

function getYouTubeThumbnail(url: string) {
    const youtubeId = getYouTubeId(url)

    return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/default.jpg` : null
}

function getProjectYear(date?: string | null) {
    if (!date) return null

    const year = new Date(date).getFullYear()

    return Number.isNaN(year) ? null : String(year)
}

const ProjectDetails = ({
    displayedProject,
    renderAsset,
    expandDetails = false,
}: {
    displayedProject: Project | null
    renderAsset: any
    expandDetails?: boolean
}) => {
    const [videoThumbnails, setVideoThumbnails] = useState<SidebarThumbnail[]>([])
    const [visibleThumbnailCount, setVisibleThumbnailCount] = useState<number | null>(null)
    const assetsWrapperRef = useRef<HTMLDivElement | null>(null)
    const measuringWrapperRef = useRef<HTMLDivElement | null>(null)
    const projectYear = getProjectYear(displayedProject?.date)
    const hasDescription = Boolean(displayedProject?.description?.length)
    const hasCredits = Boolean(displayedProject?.credits?.length)
    const shouldRevealDetails = expandDetails && Boolean(displayedProject) && (hasDescription || hasCredits)
    const galleryThumbnails = useMemo(() => (displayedProject?.gallery ?? [])
        .map((image) => ({
            key: image.asset?._ref,
            url: urlForImage(image)?.height(80).quality(75).url(),
            alt: `Gallery thumbnail for ${displayedProject?.title ?? 'project'}`,
        }))
        .filter((thumbnail): thumbnail is SidebarThumbnail => Boolean(thumbnail.key && thumbnail.url)), [displayedProject?.gallery, displayedProject?.title])
    const thumbnails = useMemo(
        () => [...galleryThumbnails, ...videoThumbnails],
        [galleryThumbnails, videoThumbnails],
    )
    const resolvedVisibleThumbnailCount = visibleThumbnailCount ?? thumbnails.length
    const hiddenThumbnailCount = Math.max(0, thumbnails.length - resolvedVisibleThumbnailCount)
    const visibleThumbnails = useMemo(
        () => thumbnails.slice(0, resolvedVisibleThumbnailCount),
        [resolvedVisibleThumbnailCount, thumbnails],
    )

    useEffect(() => {
        setVisibleThumbnailCount(null)
    }, [displayedProject?._id])

    useEffect(() => {
        const wrapper = assetsWrapperRef.current
        const measuringWrapper = measuringWrapperRef.current

        if (!wrapper || !measuringWrapper) return

        const updateVisibleCount = () => {
            const contentWidth = wrapper.clientWidth - ASSETS_HORIZONTAL_PADDING
            const thumbnailElements = Array.from(measuringWrapper.querySelectorAll('img'))
            let usedWidth = 0
            let count = 0

            for (const thumbnail of thumbnailElements) {
                const thumbnailWidth = thumbnail.getBoundingClientRect().width || THUMBNAIL_WIDTH
                const nextWidth = usedWidth + (count > 0 ? THUMBNAIL_GAP : 0) + thumbnailWidth

                if (nextWidth > contentWidth) break

                usedWidth = nextWidth
                count += 1
            }

            if (count >= thumbnails.length) {
                setVisibleThumbnailCount(thumbnails.length)
                return
            }

            let visibleCount = 0
            usedWidth = 0

            for (const thumbnail of thumbnailElements) {
                const thumbnailWidth = thumbnail.getBoundingClientRect().width || THUMBNAIL_WIDTH
                const nextWidth = usedWidth + (visibleCount > 0 ? THUMBNAIL_GAP : 0) + thumbnailWidth
                const totalWithBadge = nextWidth + THUMBNAIL_GAP + COUNT_BADGE_WIDTH

                if (totalWithBadge > contentWidth) break

                usedWidth = nextWidth
                visibleCount += 1
            }

            setVisibleThumbnailCount(Math.max(0, visibleCount))
        }
        const observer = new ResizeObserver(updateVisibleCount)

        updateVisibleCount()
        observer.observe(wrapper)
        observer.observe(measuringWrapper)

        return () => observer.disconnect()
    }, [thumbnails.length])

    useEffect(() => {
        let cancelled = false

        async function resolveVideoThumbnails() {
            const videos = displayedProject?.videos ?? []
            const videoUrls = displayedProject?.videoUrls ?? []
            const nextThumbnails = await Promise.all([
                ...videos.map(async (video, idx) => {
                    const url = urlForImage(video.thumbnail)?.height(80).quality(75).url()

                    if (!url) return null

                    return {
                        key: video._key ?? `video-${idx}`,
                        url,
                        alt: `Video thumbnail ${idx + 1} for ${displayedProject?.title ?? 'project'}`,
                    }
                }),
                ...videoUrls.map(async (videoUrl, idx) => {
                    const url = videoUrl.url

                    if (!url) return null

                    const thumbnailUrl = urlForImage(videoUrl.thumbnail)?.height(80).quality(75).url()
                        ?? getYouTubeThumbnail(url)
                        ?? await getVimeoThumbnail(url)

                    return thumbnailUrl ? {
                        key: videoUrl._key ?? `video-url-${idx}`,
                        url: thumbnailUrl,
                        alt: `Video link thumbnail ${idx + 1} for ${displayedProject?.title ?? 'project'}`,
                    } : null
                }),
            ])

            if (!cancelled) {
                setVideoThumbnails(
                    nextThumbnails.filter((thumbnail): thumbnail is SidebarThumbnail => Boolean(thumbnail)),
                )
            }
        }

        setVideoThumbnails([])
        resolveVideoThumbnails()

        return () => {
            cancelled = true
        }
    }, [displayedProject])

    return (
        <div className={styles.container}>
            <div className={styles.body}>
            <div className={`${styles.title} ${!displayedProject?.client ? styles.titleEmpty : ''}`}>
                {displayedProject?.client || 'Client'}
            </div>
            <div className={`${styles.title} ${!displayedProject?.title ? styles.titleEmpty : ''}`}>
                {displayedProject?.title || 'Title'}
            </div>
            <AnimatePresence initial={false}>
                {shouldRevealDetails && displayedProject && (
                    <motion.div
                        className={styles.revealedDetails}
                        initial={{ height: 0, opacity: 0, y: 32 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: 32 }}
                        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {projectYear && (
                            <div className={styles.metaRow}>
                                <span>Year</span>
                                <span>{projectYear}</span>
                            </div>
                        )}
                        {hasDescription && (
                            <section className={styles.description}>
                                <h3>Description</h3>
                                <div className={styles.portableText}>
                                    <PortableText value={displayedProject.description ?? []} />
                                </div>
                            </section>
                        )}
                        {hasCredits && (
                            <section className={styles.credits}>
                                <h3>Credits</h3>
                                <ul>
                                    {displayedProject.credits?.map((credit, idx) => (
                                        <li key={`${credit.role}-${credit.name}-${idx}`}>
                                            <span>{credit.role}</span>
                                            {credit.link ? (
                                                <a href={credit.link} target="_blank" rel="noreferrer">
                                                    {credit.name}
                                                </a>
                                            ) : (
                                                <span>{credit.name}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
            {thumbnails.length > 0 ? (
                <>
                    <div className={styles.assetsMeasurer} ref={measuringWrapperRef} aria-hidden="true">
                        {thumbnails.map((thumbnail) => (
                            <img
                                key={thumbnail.key}
                                src={thumbnail.url}
                                alt=""
                                className={styles.asset}
                            />
                        ))}
                    </div>
                    <div className={styles.assetsWrapper} ref={assetsWrapperRef}>
                        {visibleThumbnails.map((thumbnail, idx) => (
                            <img
                                key={`${thumbnail.key}-${idx}`}
                                src={thumbnail.url}
                                alt={thumbnail.alt}
                                className={styles.asset}
                                height={30}
                                loading={idx < 6 ? 'eager' : 'lazy'}
                                decoding="async"
                                fetchPriority={idx < 6 ? 'high' : 'low'}
                            />
                        ))}
                        {hiddenThumbnailCount > 0 && (
                            <div className={styles.assetCount} aria-label={`${hiddenThumbnailCount} hidden assets`}>
                                +{hiddenThumbnailCount}
                            </div>
                        )}
                    </div>
                </>
            ): 
            <div className={styles.assetsWrapper}>
                <div className={styles.assetEmpty}></div>
                <div className={styles.assetEmpty}></div>
                <div className={styles.assetEmpty}></div>
                <div className={styles.assetEmpty}></div>
            </div>}
        </div>
    )
}

export default React.memo(ProjectDetails)
