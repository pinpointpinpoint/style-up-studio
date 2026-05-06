'use client'

import {PortableText} from 'next-sanity'
import React, {ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import {createExternalVideoThumbnailResolver, getExternalVideoThumbnailUrl} from '@/features/video/lib/videoMedia'
import {Project} from '@/types'
import {urlForImage} from '@/sanity/lib/utils'
import styles from './ProjectInfoPanel.module.css'
import { getProjectSidebarMedia, getVisibleSidebarThumbnailCount } from '../../lib/media/projectSidebarMedia'
import { getSanityProjectImageUrl } from '../../lib/media/sanityProjectImageUrl'

const THUMBNAIL_WIDTH = 30
const THUMBNAIL_GAP = 5
const ASSETS_HORIZONTAL_PADDING = 60
const COUNT_BADGE_WIDTH = 30
const resolveExternalVideoThumbnail = createExternalVideoThumbnailResolver({
    vimeoWidth: 295,
    fetchJson: async (url) => {
        const response = await fetch(url)

        if (!response.ok) return null

        return response.json()
    },
})

function getProjectYear(date?: string | null) {
    if (!date) return null

    const year = new Date(date).getFullYear()

    return Number.isNaN(year) ? null : String(year)
}

const ProjectInfoPanel = ({
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
    const shouldRevealDetails =
        expandDetails && Boolean(displayedProject) && (hasDescription || hasCredits)
    const thumbnailImageHeight = expandDetails ? 400 : 80
    const resolvedVisibleThumbnailCount = expandDetails
        ? undefined
        : visibleThumbnailCount
    const sidebarMedia = useMemo(() => {
        if (!displayedProject) {
            return {
                thumbnails: [],
                visibleThumbnails: [],
                hiddenThumbnailCount: 0,
            }
        }

        return getProjectSidebarMedia(displayedProject, {
            imageUrl: getSanityProjectImageUrl,
            externalVideoThumbnailUrl: (url) =>
                getExternalVideoThumbnailUrl(url) ?? videoUrlThumbnails[url],
            thumbnailHeight: thumbnailImageHeight,
            visibleThumbnailCount: resolvedVisibleThumbnailCount,
        })
    }, [displayedProject, resolvedVisibleThumbnailCount, thumbnailImageHeight, videoUrlThumbnails])
    const {thumbnails, visibleThumbnails, hiddenThumbnailCount} = sidebarMedia

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
            const thumbnailWidths = thumbnailElements.map(
                (thumbnail) => thumbnail.getBoundingClientRect().width || THUMBNAIL_WIDTH,
            )

            setVisibleThumbnailCount(
                getVisibleSidebarThumbnailCount({
                    availableWidth: contentWidth,
                    thumbnailWidths,
                    thumbnailGap: THUMBNAIL_GAP,
                    countBadgeWidth: COUNT_BADGE_WIDTH,
                }),
            )
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
                .map((item) => ({item, url: item.url}))
                .filter(({item}) => item._type === 'videoUrl' && item.url)
                .filter(({item}) => !urlForImage(item.thumbnail)?.height(80).quality(75).url())
                .filter(({item}) => !getExternalVideoThumbnailUrl(item.url ?? ''))

            const nextThumbnails = await Promise.all(
                videoUrlItems.map(async ({url}) => ({
                    sourceUrl: url,
                    thumbnailUrl: url ? await resolveExternalVideoThumbnail(url) : null,
                })),
            )

            if (!cancelled) {
                setVideoUrlThumbnails(
                    Object.fromEntries(
                        nextThumbnails.map((thumbnail) => [
                            thumbnail.sourceUrl,
                            thumbnail.thumbnailUrl,
                        ]),
                    ),
                )
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
                <div
                    className={`${styles.title} ${!displayedProject?.client ? styles.titleEmpty : ''}`}
                >
                    {displayedProject?.client || 'Client'}
                </div>
                <div
                    className={`${styles.title} ${!displayedProject?.title ? styles.titleEmpty : ''}`}
                >
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
                                        <a
                                            href={credit.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
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
                    <div
                        className={styles.assetsMeasurer}
                        ref={measuringWrapperRef}
                        aria-hidden="true"
                    >
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
                            const isInactiveAsset =
                                activeAssetIndex !== undefined &&
                                thumbnail.mediaIndex !== activeAssetIndex
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
                            <div
                                className={styles.assetCount}
                                aria-label={`${hiddenThumbnailCount} hidden assets`}
                            >
                                +{hiddenThumbnailCount}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className={styles.assetsWrapper}>
                    <div className={styles.assetEmpty}></div>
                    <div className={styles.assetEmpty}></div>
                    <div className={styles.assetEmpty}></div>
                    <div className={styles.assetEmpty}></div>
                </div>
            )}
        </div>
    )
}

export default React.memo(ProjectInfoPanel)
