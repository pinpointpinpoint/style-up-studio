'use client'

import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type RefObject,
} from 'react'
import ProjectInfoPanel from '@/features/work/components/WorkSidebar/ProjectInfoPanel'
import {getYouTubePosterCandidates} from '@/features/video/lib/videoMedia'
import {getExternalVideoPoster} from '@/features/video/services/externalVideoService'
import DelayedLoadingMessage from '@/shared/components/DelayedLoadingMessage/DelayedLoadingMessage'
import type {Project} from '@/types'
import styles from './ProjectDetailView.module.css'
import {
    createProjectDetailMediaView,
    getProjectDetailMediaScrollSelection,
    selectProjectDetailMedia,
} from '../../lib/media/projectDetailMediaView'
import {
    getSanityProjectImageSourceSet,
    getSanityProjectImageUrl,
} from '../../lib/media/sanityProjectImageUrl'
import { MobileProjectInfo } from '../MobileProjectInfo/MobileProjectInfo'

const DeferredVideoPlayer = lazy(
    () => import('@/features/video/components/VideoPlayer/VideoPlayer'),
)

type ProjectDetailViewProps = {
    project: Project
    scrollContainerRef?: RefObject<HTMLDivElement | null>
}

type ProjectImageProps = {
    src: string
    alt: string
    eager: boolean
    srcSet?: string
    sizes?: string
}

function ProjectImage({src, alt, eager, srcSet, sizes}: ProjectImageProps) {
    return (
        <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
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
            {poster ? (
                <img src={poster} alt="" className={styles.videoLoadingPoster} aria-hidden="true" />
            ) : null}
            <span className={styles.videoLoadingMessage}>
                <DelayedLoadingMessage>{`[LOADING ${title ?? 'VIDEO'}...]`}</DelayedLoadingMessage>
            </span>
        </div>
    )
}

export default function ProjectDetailView({project, scrollContainerRef}: ProjectDetailViewProps) {
    const mediaPaneRef = useRef<HTMLDivElement | null>(null)
    const mediaFrameRefs = useRef<Record<number, HTMLDivElement | null>>({})
    const [selectedMedia, setSelectedMedia] = useState<{
        projectId: string
        mediaIndex: number
    } | null>(null)
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
    const [externalVideoPosterUrls, setExternalVideoPosterUrls] = useState<
        Record<string, string | null>
    >({})
    const mediaView = useMemo(
        () =>
            createProjectDetailMediaView(project, {
                imageUrl: getSanityProjectImageUrl,
                imageSourceSet: getSanityProjectImageSourceSet,
                externalVideoPosterUrl: (url) =>
                    externalVideoPosterUrls[url] ?? getYouTubePosterCandidates(url)?.fallback,
            }),
        [externalVideoPosterUrls, project],
    )
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

    const handleMediaScroll = useCallback(() => {
        const scrollContainer = scrollContainerRef?.current ?? mediaPaneRef.current

        if (!scrollContainer) return

        const paneRect = scrollContainer.getBoundingClientRect()
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
    }, [activeMediaIndex, project._id, scrollContainerRef])

    useEffect(() => {
        const scrollContainer = scrollContainerRef?.current

        if (!scrollContainer) return

        scrollContainer.addEventListener('scroll', handleMediaScroll, {passive: true})

        return () => scrollContainer.removeEventListener('scroll', handleMediaScroll)
    }, [handleMediaScroll, scrollContainerRef])

    useEffect(() => {
        setActiveVideoId(null)
        setExternalVideoPosterUrls({})
    }, [project._id])

    useEffect(() => {
        const missingExternalPosterUrls = Array.from(
            new Set(
                mediaView.media
                    .filter(
                        (item): item is Extract<(typeof mediaView.media)[number], {kind: 'videoUrl'}> =>
                            item.kind === 'videoUrl',
                    )
                    .filter((item) => {
                        const youtubeFallbackPoster = getYouTubePosterCandidates(item.url)?.fallback

                        return !item.poster || item.poster === youtubeFallbackPoster
                    })
                    .map((item) => item.url)
                    .filter((url) => externalVideoPosterUrls[url] === undefined),
            ),
        )

        if (missingExternalPosterUrls.length === 0) return

        let cancelled = false

        Promise.all(
            missingExternalPosterUrls.map(async (url) => ({
                url,
                poster: await getExternalVideoPoster(url),
            })),
        ).then((posters) => {
            if (cancelled) return

            setExternalVideoPosterUrls((currentPosterUrls) => {
                const nextPosterUrls = {...currentPosterUrls}

                for (const {url, poster} of posters) {
                    if (nextPosterUrls[url] === undefined) {
                        nextPosterUrls[url] = poster
                    }
                }

                return nextPosterUrls
            })
        })

        return () => {
            cancelled = true
        }
    }, [externalVideoPosterUrls, mediaView.media])

    return (
        <section className={styles.container} aria-label={`${project.title ?? 'Project'} details`}>
            <div className={styles.mobileInfoPanel}>
                <MobileProjectInfo
                    project={project}
                    activeAssetIndex={activeMediaIndex}
                    onAssetSelect={handleAssetSelect}
                />
            </div>
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
                                        srcSet={item.srcSet}
                                        sizes={item.sizes}
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
                                            activeVideoId={activeVideoId}
                                            onPlay={setActiveVideoId}
                                            src={item.fileUrl}
                                            poster={item.poster}
                                            title={item.title}
                                            videoId={`${project._id}:${item.key}`}
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
                                        activeVideoId={activeVideoId}
                                        onPlay={setActiveVideoId}
                                        src={item.url}
                                        poster={item.poster}
                                        title={item.title}
                                        videoId={`${project._id}:${item.key}`}
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
