'use client'

import {PortableText} from 'next-sanity'
import React, {ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import {getVideoMediaProviderThumbnailRequest} from '@/features/video/lib/videoMedia'
import {getExternalVideoThumbnail} from '@/features/video/services/externalVideoService'
import {Project} from '@/types'
import styles from './ProjectInfoPanel.module.css'
import {
    getProjectSidebarMedia,
    getVisibleSidebarThumbnailCount,
} from '../../lib/media/projectSidebarMedia'
import {getSanityProjectImageUrl} from '../../lib/media/sanityProjectImageUrl'

const COMPACT_THUMBNAIL_HEIGHT = 30
const THUMBNAIL_GAP = 5
const ASSETS_HORIZONTAL_PADDING = 60
const COUNT_BADGE_WIDTH = 30
const EMPTY_VIDEO_URL_THUMBNAILS: Record<string, string | null> = {}

function getProjectInfoVideoThumbnailAssetUse(thumbnailImageHeight: number) {
    return thumbnailImageHeight === 400 ? 'expandedProjectInfoThumbnail' : 'projectInfoThumbnail'
}

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
    const [videoUrlThumbnailState, setVideoUrlThumbnailState] = useState<{
        key: string
        thumbnails: Record<string, string | null>
    } | null>(null)
    const [visibleThumbnailState, setVisibleThumbnailState] = useState<{
        projectId: string
        count: number
    } | null>(null)
    const assetsWrapperRef = useRef<HTMLDivElement | null>(null)
    const projectYear = getProjectYear(displayedProject?.date)
    const hasDescription = Boolean(displayedProject?.description?.length)
    const hasCredits = Boolean(displayedProject?.credits?.length)
    const shouldRevealDetails =
        expandDetails && Boolean(displayedProject) && (hasDescription || hasCredits)
    const thumbnailImageHeight = expandDetails ? 400 : 80
    const videoThumbnailStateKey = `${displayedProject?._id ?? ''}:${thumbnailImageHeight}`
    const videoUrlThumbnails = useMemo(
        () =>
            videoUrlThumbnailState?.key === videoThumbnailStateKey
                ? videoUrlThumbnailState.thumbnails
                : EMPTY_VIDEO_URL_THUMBNAILS,
        [videoThumbnailStateKey, videoUrlThumbnailState],
    )
    const resolvedVisibleThumbnailCount =
        !expandDetails &&
        visibleThumbnailState &&
        visibleThumbnailState.projectId === displayedProject?._id
            ? visibleThumbnailState.count
            : undefined
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
            externalVideoThumbnailUrl: (url) => videoUrlThumbnails[url],
            thumbnailHeight: thumbnailImageHeight,
            displayThumbnailHeight: expandDetails ? thumbnailImageHeight : COMPACT_THUMBNAIL_HEIGHT,
            visibleThumbnailCount: resolvedVisibleThumbnailCount,
        })
    }, [
        displayedProject,
        expandDetails,
        resolvedVisibleThumbnailCount,
        thumbnailImageHeight,
        videoUrlThumbnails,
    ])
    const {thumbnails, visibleThumbnails, hiddenThumbnailCount} = sidebarMedia
    const thumbnailDisplayWidthKey = thumbnails
        .map((thumbnail) => String(thumbnail.displayWidth))
        .join(',')

    useEffect(() => {
        if (expandDetails) return

        const wrapper = assetsWrapperRef.current
        const projectId = displayedProject?._id

        if (!wrapper || !projectId) return

        const updateVisibleCount = () => {
            const contentWidth = wrapper.clientWidth - ASSETS_HORIZONTAL_PADDING
            const thumbnailWidths = thumbnailDisplayWidthKey
                ? thumbnailDisplayWidthKey.split(',').map(Number)
                : []

            setVisibleThumbnailState({
                projectId,
                count: getVisibleSidebarThumbnailCount({
                    availableWidth: contentWidth,
                    thumbnailWidths,
                    thumbnailGap: THUMBNAIL_GAP,
                    countBadgeWidth: COUNT_BADGE_WIDTH,
                }),
            })
        }
        const observer = new ResizeObserver(updateVisibleCount)

        updateVisibleCount()
        observer.observe(wrapper)

        return () => observer.disconnect()
    }, [displayedProject?._id, expandDetails, thumbnailDisplayWidthKey])

    useEffect(() => {
        let cancelled = false

        async function resolveVideoThumbnails() {
            const providerThumbnailRequests = (displayedProject?.media ?? [])
                .map((item) => {
                    if (item._type !== 'videoUrl' || !item.url) return null

                    return getVideoMediaProviderThumbnailRequest({
                        sourceKind: 'videoUrl',
                        sourceUrl: item.url,
                        assetUse: getProjectInfoVideoThumbnailAssetUse(thumbnailImageHeight),
                        sanityThumbnail: item.thumbnail,
                        sanityThumbnailUrl: getSanityProjectImageUrl,
                    })
                })
                .filter((request): request is NonNullable<typeof request> => Boolean(request))

            const nextThumbnails = await Promise.all(
                providerThumbnailRequests.map(async ({sourceUrl, width}) => ({
                    sourceUrl,
                    thumbnailUrl: await getExternalVideoThumbnail(sourceUrl, {
                        width,
                    }),
                })),
            )

            if (!cancelled) {
                setVideoUrlThumbnailState({
                    key: videoThumbnailStateKey,
                    thumbnails: Object.fromEntries(
                        nextThumbnails.map((thumbnail) => [
                            thumbnail.sourceUrl,
                            thumbnail.thumbnailUrl,
                        ]),
                    ),
                })
            }
        }

        resolveVideoThumbnails()

        return () => {
            cancelled = true
        }
    }, [displayedProject, thumbnailImageHeight, videoThumbnailStateKey])

    return (
        <div className={`${styles.container} scrollbar`}>
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
                                    const people = credit.people ?? []
                                    const key = `${credit.role ?? 'credit'}-${people.map((person) => person.name).join('-') || index}`

                                    return (
                                        <li key={key}>
                                            <span>{credit.role}</span>
                                            <span className={styles.creditPeople}>
                                                {people.map((person, personIndex) => (
                                                    <span
                                                        key={`${person.name ?? 'person'}-${personIndex}`}
                                                    >
                                                        {person.link ? (
                                                            <a
                                                                href={person.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {person.name}
                                                            </a>
                                                        ) : (
                                                            person.name
                                                        )}
                                                    </span>
                                                ))}
                                            </span>
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
                        className={`${styles.assetsWrapper} ${expandDetails ? styles.assetsWrapperExpanded : ''}`}
                        ref={assetsWrapperRef}
                    >
                        {visibleThumbnails.map((thumbnail, idx) => {
                            const isActiveAsset =
                                expandDetails &&
                                activeAssetIndex !== undefined &&
                                thumbnail.mediaIndex === activeAssetIndex
                            const isInactiveAsset =
                                expandDetails &&
                                activeAssetIndex !== undefined &&
                                thumbnail.mediaIndex !== activeAssetIndex
                            const assetImage = (
                                <img
                                    src={thumbnail.url}
                                    alt={thumbnail.alt}
                                    className={`${styles.asset} ${expandDetails ? styles.assetExpanded : ''} ${isActiveAsset ? styles.assetActive : ''} ${isInactiveAsset ? styles.assetInactive : ''}`}
                                    height={expandDetails ? 80 : 30}
                                    loading="lazy"
                                    decoding="async"
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
