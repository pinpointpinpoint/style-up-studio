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
    width?: number
    height?: number
    alt: string
    eager: boolean
    srcSet?: string
    sizes?: string
}

function ProjectImage({src, alt, eager, srcSet, sizes, width, height}: ProjectImageProps) {
    return (
        <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            width={width}
            height={height}
            alt={alt}
            className={styles.image}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
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
    const [selectedMedia, setSelectedMedia] = useState<{
        projectId: string
        mediaIndex: number
        imageKey?: string
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
    const activeItem = mediaView.media.find(item => item.mediaIndex === activeMediaIndex)
    const activeImageKey = selectedMedia?.projectId === project._id && selectedMedia.imageKey
        ? selectedMedia.imageKey
        : activeItem?.kind === 'gallery' ? activeItem.images[0]?.key : undefined
    const handleAssetSelect = useCallback((mediaIndex: number, imageKey?: string) => {
        const frames = mediaPaneRef.current?.querySelectorAll<HTMLElement>('[data-media-index]')
        const target = Array.from(frames ?? []).find(frame =>
            Number(frame.dataset.mediaIndex) === mediaIndex
            && (!frame.dataset.imageKey || frame.dataset.imageKey === imageKey),
        )
        target?.scrollIntoView({behavior: 'smooth', block: 'center'})
    }, [])

    useEffect(() => {
        const frames = mediaPaneRef.current?.querySelectorAll<HTMLElement>('[data-media-index]')
        if (!frames?.length) return

        // The browser tracks visibility; no layout measurements on scroll.
        const visibility = new Map<Element, number>()
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) visibility.set(entry.target, entry.intersectionRatio)
                else visibility.delete(entry.target)
            }
            const active = [...visibility].sort((a, b) => b[1] - a[1])[0]?.[0] as HTMLElement | undefined
            if (!active) return

            const mediaIndex = Number(active.dataset.mediaIndex)
            const imageKey = active.dataset.imageKey
            setSelectedMedia(current =>
                current?.projectId === project._id && current.mediaIndex === mediaIndex && current.imageKey === imageKey
                    ? current
                    : {projectId: project._id, mediaIndex, imageKey},
            )
        }, {
            root: scrollContainerRef?.current ?? null,
            threshold: [0, 0.25, 0.5, 0.75, 1],
        })
        frames.forEach(frame => observer.observe(frame))
        return () => observer.disconnect()
    }, [project._id, project.media, scrollContainerRef])

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
                    activeAssetKey={activeImageKey}
                    onAssetSelect={handleAssetSelect}
                />
            </div>
            <div className={styles.mediaPane} ref={mediaPaneRef}>
                <div className={styles.mediaList}>
                    {mediaView.media.map((item) => {
                        if (item.kind === 'gallery') {
                            return (
                                <div key={item.key} className={styles.galleryContainer}>
                                    <div
                                        className={styles.galleryFrame}
                                    >
                                        {item.images.map((image) => (
                                            <div
                                                key={image.key}
                                                className={styles.mediaFrame}
                                                data-media-index={item.mediaIndex}
                                                data-image-key={image.key}
                                            >
                                            <ProjectImage
                                                src={image.url}
                                                width={image.width}
                                                height={image.height}
                                                srcSet={image.srcSet}
                                                sizes={image.sizes}
                                                alt={image.alt}
                                                eager={image.eager}
                                            />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                        if (item.kind === 'image') {
                            return (
                                <div
                                    key={item.key}
                                    className={styles.mediaFrame}
                                    data-media-index={item.mediaIndex}
                                >
                                    <ProjectImage
                                        src={item.url}
                                        width={item.width}
                                        height={item.height}
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
                                    className={`${styles.mediaFrame} ${styles.videoFrame}`}
                                    data-media-index={item.mediaIndex}
                                >
                                    <Suspense
                                        fallback={
                                            <VideoPlayerLoading
                                                poster={item.poster}
                                            />
                                        }
                                    >
                                        <DeferredVideoPlayer
                                            key={item.fileUrl}
                                            activeVideoId={activeVideoId}
                                            onPlay={setActiveVideoId}
                                            src={item.fileUrl}
                                            poster={item.poster}
                                            videoId={`${project._id}:${item.key}`}
                                        />
                                    </Suspense>
                                </div>
                            )
                        }

                        return (
                            <div
                                key={item.key}
                                className={`${styles.mediaFrame} ${styles.videoFrame}`}
                                data-media-index={item.mediaIndex}
                            >
                                <Suspense
                                    fallback={
                                        <VideoPlayerLoading
                                            poster={item.poster}
                                        />
                                    }
                                >
                                    <DeferredVideoPlayer
                                        key={item.url}
                                        activeVideoId={activeVideoId}
                                        onPlay={setActiveVideoId}
                                        src={item.url}
                                        poster={item.poster}
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
                    activeAssetKey={activeImageKey}
                />
            </aside>
        </section>
    )
}
