'use client';

import { PortableText } from 'next-sanity'
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Project } from '@/types'
import { urlForImage } from '@/sanity/lib/utils'
import getVimeoId from '@/utils/getVimeoId'
import getYouTubeId from '@/utils/getYouTubeId'
import styles from "./ProjectDetails.module.css";

type SidebarThumbnail = {
    key: string
    url: string
    alt: string
    mediaIndex: number
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
    expandDetails = false,
    headerAction,
    onAssetSelect,
    activeAssetIndex,
}: {
    displayedProject: Project | null
    expandDetails?: boolean
    headerAction?: ReactNode
    onAssetSelect?: (mediaIndex: number) => void
    activeAssetIndex?: number
}) => {
    const [videoUrlThumbnails, setVideoUrlThumbnails] = useState<Record<string, string | null>>({})
    const [visibleThumbnailCount, setVisibleThumbnailCount] = useState<number | null>(null)
    const assetsWrapperRef = useRef<HTMLDivElement | null>(null)
    const measuringWrapperRef = useRef<HTMLDivElement | null>(null)
    const projectYear = getProjectYear(displayedProject?.date)
    const hasDescription = Boolean(displayedProject?.description?.length)
    const hasCredits = Boolean(displayedProject?.credits?.length)
    const shouldRevealDetails = expandDetails && Boolean(displayedProject) && (hasDescription || hasCredits)
    const thumbnailImageHeight = expandDetails ? 400 : 80
    const thumbnails = useMemo(() => (displayedProject?.media ?? [])
        .map((item, idx) => {
            if (item._type === 'image') {
                return {
                    key: item._key ?? item.asset?._ref,
                    url: urlForImage(item)?.height(thumbnailImageHeight).quality(75).url(),
                    alt: `Gallery thumbnail for ${displayedProject?.title ?? 'project'}`,
                    mediaIndex: idx,
                }
            }

            if (item._type === 'uploadedVideo') {
                return {
                    key: item._key ?? `uploaded-video-${idx}`,
                    url: urlForImage(item.thumbnail)?.height(thumbnailImageHeight).quality(75).url(),
                    alt: `Video thumbnail ${idx + 1} for ${displayedProject?.title ?? 'project'}`,
                    mediaIndex: idx,
                }
            }

            if (item._type === 'videoUrl') {
                const key = item._key ?? `video-url-${idx}`
                const url = item.url
                const thumbnailUrl = url
                    ? urlForImage(item.thumbnail)?.height(thumbnailImageHeight).quality(75).url()
                        ?? getYouTubeThumbnail(url)
                        ?? videoUrlThumbnails[key]
                    : null

                return {
                    key,
                    url: thumbnailUrl,
                    alt: `Video link thumbnail ${idx + 1} for ${displayedProject?.title ?? 'project'}`,
                    mediaIndex: idx,
                }
            }

            return null
        })
        .filter((thumbnail): thumbnail is SidebarThumbnail => Boolean(thumbnail?.key && thumbnail.url)),
        [displayedProject?.media, displayedProject?.title, thumbnailImageHeight, videoUrlThumbnails])
    const resolvedVisibleThumbnailCount = expandDetails
        ? thumbnails.length
        : visibleThumbnailCount ?? thumbnails.length
    const hiddenThumbnailCount = Math.max(0, thumbnails.length - resolvedVisibleThumbnailCount)
    const visibleThumbnails = useMemo(
        () => thumbnails.slice(0, resolvedVisibleThumbnailCount),
        [resolvedVisibleThumbnailCount, thumbnails],
    )

    useEffect(() => {
        setVisibleThumbnailCount(null)
    }, [displayedProject?._id])

    useEffect(() => {
        if (expandDetails) {
            setVisibleThumbnailCount(null)
            return
        }

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
    }, [expandDetails, thumbnails.length])

    useEffect(() => {
        let cancelled = false

        async function resolveVideoThumbnails() {
            const videoUrlItems = (displayedProject?.media ?? [])
                .map((item, idx) => ({item, key: item._key ?? `video-url-${idx}`}))
                .filter(({item}) => item._type === 'videoUrl' && item.url)
                .filter(({item}) => !urlForImage(item.thumbnail)?.height(80).quality(75).url())
                .filter(({item}) => !getYouTubeThumbnail(item.url ?? ''))

            const nextThumbnails = await Promise.all(videoUrlItems.map(async ({item, key}) => ({
                key,
                url: item.url ? await getVimeoThumbnail(item.url) : null,
            })))

            if (!cancelled) {
                setVideoUrlThumbnails(Object.fromEntries(
                    nextThumbnails.map((thumbnail) => [thumbnail.key, thumbnail.url]),
                ))
            }
        }

        setVideoUrlThumbnails({})
        resolveVideoThumbnails()

        return () => {
            cancelled = true
        }
    }, [displayedProject])

    return (
        <div className={styles.container}>
            <div className={`${styles.heading} ${!displayedProject ? styles.headingEmpty : ''}`}>
                <span>INFO</span>
                {headerAction}
            </div>
            <div className={styles.body}>
            <div className={`${styles.title} ${!displayedProject?.client ? styles.titleEmpty : ''}`}>
                {displayedProject?.client || 'Client'}
            </div>
            <div className={`${styles.title} ${!displayedProject?.title ? styles.titleEmpty : ''}`}>
                {displayedProject?.title || 'Title'}
            </div>
            </div>
            {shouldRevealDetails && (
                <div className={styles.revealedDetails}>
                    <div className={`${styles.title} ${!projectYear ? styles.titleEmpty : ''}`}>
                        {projectYear || 'Year'}
                    </div>
                    {hasDescription && displayedProject?.description && (
                        <section className={styles.description}>
                            <div className={styles.portableText}>
                                <PortableText value={displayedProject.description} />
                            </div>
                        </section>
                    )}
                    {hasCredits && displayedProject?.credits && (
                        <section className={styles.credits}>
                            <ul>
                                {displayedProject.credits.map((credit, index) => {
                                    const key = `${credit.role ?? 'credit'}-${credit.name ?? index}`
                                    const name = credit.name ?? ''
                                    const content = credit.link ? (
                                        <a href={credit.link} target="_blank" rel="noopener noreferrer">
                                            {name}
                                        </a>
                                    ) : (
                                        <span>{name}</span>
                                    )

                                    return (
                                        <li key={key}>
                                            <span>{credit.role}</span>
                                            {content}
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    )}
                </div>
            )}
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
                    <div
                        className={`${styles.assetsWrapper} ${expandDetails ? styles.assetsWrapperExpanded : ''}`}
                        ref={assetsWrapperRef}
                    >
                        {visibleThumbnails.map((thumbnail, idx) => {
                            const isInactiveAsset = activeAssetIndex !== undefined
                                && thumbnail.mediaIndex !== activeAssetIndex
                            const assetImage = (
                                <img
                                    src={thumbnail.url}
                                    alt={thumbnail.alt}
                                    className={`${styles.asset} ${expandDetails ? styles.assetExpanded : ''} ${isInactiveAsset ? styles.assetInactive : ''}`}
                                    height={expandDetails ? 80 : 30}
                                    loading={idx < 6 ? 'eager' : 'lazy'}
                                    decoding="async"
                                    fetchPriority={idx < 6 ? 'high' : 'low'}
                                />
                            )

                            return onAssetSelect ? (
                                <button
                                    key={`${thumbnail.key}-${idx}`}
                                    className={styles.assetButton}
                                    type="button"
                                    onClick={() => onAssetSelect(thumbnail.mediaIndex)}
                                    aria-label={`Go to ${thumbnail.alt}`}
                                >
                                    {assetImage}
                                </button>
                            ) : (
                                <React.Fragment key={`${thumbnail.key}-${idx}`}>
                                    {assetImage}
                                </React.Fragment>
                            )
                        })}
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
