'use client'

import {lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {getExternalVideoPoster} from '@/features/video/services/externalVideoService'
import {getVideoMediaProviderPosterRequest} from '@/features/video/lib/videoMedia'
import ProjectInfoPanel from '@/features/work/components/WorkSidebar/ProjectInfoPanel'
import DelayedLoadingMessage from '@/shared/components/DelayedLoadingMessage/DelayedLoadingMessage'
import type {Project} from '@/types'
import styles from './ProjectDetailView.module.css'
import {
    createProjectDetailMediaView,
    getProjectDetailMediaScrollSelection,
    selectProjectDetailMedia,
} from '../../lib/media/projectDetailMediaView'
import {getSanityProjectImageUrl} from '../../lib/media/sanityProjectImageUrl'

const DeferredVideoPlayer = lazy(
    () => import('@/features/video/components/VideoPlayer/VideoPlayer'),
)

type ProjectDetailViewProps = {
    project: Project
}

type ProjectImageProps = {
    src: string
    alt: string
    eager: boolean
}

function ProjectImage({src, alt, eager}: ProjectImageProps) {
    return (
        <img
            src={src}
            alt={alt}
            className={styles.image}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
        />
    )
}

function VideoPlayerLoading({poster, title}: {poster?: string; title?: string}) {
    return (
        <div className={styles.videoLoading}>
            {poster ? <img src={poster} alt="" className={styles.videoLoadingPoster} /> : null}
            <span className={styles.videoLoadingMessage}>
                <DelayedLoadingMessage>{`[LOADING ${title ?? 'VIDEO'}...]`}</DelayedLoadingMessage>
            </span>
        </div>
    )
}

export default function ProjectDetailView({project}: ProjectDetailViewProps) {
    const mediaPaneRef = useRef<HTMLDivElement | null>(null)
    const mediaFrameRefs = useRef<Record<number, HTMLDivElement | null>>({})
    const [selectedMedia, setSelectedMedia] = useState<{
        projectId: string
        mediaIndex: number
    } | null>(null)
    const [videoPosterState, setVideoPosterState] = useState<{
        key: string
        posters: Record<string, string | null>
    } | null>(null)
    const mediaView = useMemo(
        () =>
            createProjectDetailMediaView(project, {
                imageUrl: getSanityProjectImageUrl,
                externalVideoPosterUrl: (url) =>
                    videoPosterState?.key === project._id ? videoPosterState.posters[url] : null,
            }),
        [project, videoPosterState],
    )
    const videoPosterStateKey = project._id
    const activeMediaIndex =
        selectedMedia?.projectId === project._id
            ? selectedMedia.mediaIndex
            : mediaView.activeMediaIndex
    const handleAssetSelect = useCallback(
        (mediaIndex: number) => {
            const selection = selectProjectDetailMedia(
                {
                    ...mediaView,
                    activeMediaIndex,
                },
                mediaIndex,
            )

            mediaFrameRefs.current[selection.scrollTargetMediaIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        },
        [activeMediaIndex, mediaView],
    )

    useEffect(() => {
        let cancelled = false

        async function resolveVideoPosters() {
            const posterRequests = project.media
                .map((item) => {
                    if (item._type !== 'videoUrl' || !item.url) return null

                    return getVideoMediaProviderPosterRequest({
                        sourceKind: 'videoUrl',
                        sourceUrl: item.url,
                        sanityThumbnail: item.thumbnail,
                        sanityThumbnailUrl: getSanityProjectImageUrl,
                    })
                })
                .filter((request): request is NonNullable<typeof request> => Boolean(request))

            const resolvedPosters = await Promise.all(
                posterRequests.map(async ({sourceUrl}) => ({
                    sourceUrl,
                    posterUrl: await getExternalVideoPoster(sourceUrl),
                })),
            )

            if (!cancelled) {
                setVideoPosterState({
                    key: videoPosterStateKey,
                    posters: Object.fromEntries(
                        resolvedPosters.map(({sourceUrl, posterUrl}) => [sourceUrl, posterUrl]),
                    ),
                })
            }
        }

        resolveVideoPosters()

        return () => {
            cancelled = true
        }
    }, [project, videoPosterStateKey])

    const handleMediaScroll = useCallback(() => {
        const mediaPane = mediaPaneRef.current

        if (!mediaPane) return

        const paneRect = mediaPane.getBoundingClientRect()
        const nextActiveMediaIndex = getProjectDetailMediaScrollSelection({
            currentActiveMediaIndex: activeMediaIndex,
            paneRect: {
                top: paneRect.top,
                height: paneRect.height,
            },
            frameRects: Object.entries(mediaFrameRefs.current)
                .map(([index, element]) => {
                    if (!element) return null

                    const frameRect = element.getBoundingClientRect()

                    return {
                        mediaIndex: Number(index),
                        top: frameRect.top,
                        height: frameRect.height,
                    }
                })
                .filter((item): item is {mediaIndex: number; top: number; height: number} =>
                    Boolean(item),
                ),
        })

        if (nextActiveMediaIndex !== activeMediaIndex) {
            setSelectedMedia({
                projectId: project._id,
                mediaIndex: nextActiveMediaIndex,
            })
        }
    }, [activeMediaIndex, project._id])

    return (
        <section className={styles.container} aria-label={`${project.title ?? 'Project'} details`}>
            <div className={styles.mediaPane} ref={mediaPaneRef} onScroll={handleMediaScroll}>
                <div className={styles.mediaList}>
                    {mediaView.media.map((item) => {
                        if (item.kind === 'image') {
                            return (
                                <div
                                    key={item.key}
                                    className={styles.mediaFrame}
                                    ref={(element) => {
                                        mediaFrameRefs.current[item.mediaIndex] = element
                                    }}
                                >
                                    <ProjectImage
                                        src={item.url}
                                        alt={item.alt}
                                        eager={item.eager}
                                    />
                                </div>
                            )
                        }

                        if (item.kind === 'uploadedVideo') {
                            return (
                                <div
                                    key={item.key}
                                    className={styles.mediaFrame}
                                    ref={(element) => {
                                        mediaFrameRefs.current[item.mediaIndex] = element
                                    }}
                                >
                                    <Suspense
                                        fallback={
                                            <VideoPlayerLoading
                                                poster={item.poster}
                                                title={item.title}
                                            />
                                        }
                                    >
                                        <DeferredVideoPlayer
                                            key={item.fileUrl}
                                            src={item.fileUrl}
                                            poster={item.poster}
                                            title={item.title}
                                        />
                                    </Suspense>
                                </div>
                            )
                        }

                        return (
                            <div
                                key={item.key}
                                className={styles.mediaFrame}
                                ref={(element) => {
                                    mediaFrameRefs.current[item.mediaIndex] = element
                                }}
                            >
                                <Suspense
                                    fallback={
                                        <VideoPlayerLoading
                                            poster={item.poster}
                                            title={item.title}
                                        />
                                    }
                                >
                                    <DeferredVideoPlayer
                                        key={item.url}
                                        src={item.url}
                                        poster={item.poster}
                                        title={item.title}
                                    />
                                </Suspense>
                            </div>
                        )
                    })}
                </div>
            </div>
            <aside className={styles.sidebar}>
                <ProjectInfoPanel
                    displayedProject={project}
                    expandDetails
                    onAssetSelect={handleAssetSelect}
                    activeAssetIndex={activeMediaIndex}
                />
            </aside>
        </section>
    )
}
