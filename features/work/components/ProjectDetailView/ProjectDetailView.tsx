'use client'

import {useCallback, useMemo, useRef, useState} from 'react'
import VideoPlayer from '@/features/video/components/VideoPlayer/VideoPlayer'
import ProjectInfoPanel from '@/features/work/components/WorkInspector/ProjectInfoPanel'
import type {Project} from '@/types'
import styles from './ProjectDetailView.module.css'
import { createProjectDetailMediaView, getProjectDetailMediaScrollSelection, selectProjectDetailMedia } from '../../lib/media/projectDetailMediaView'
import { getSanityProjectImageUrl } from '../../lib/media/sanityProjectImageUrl'

type ProjectDetailViewProps = {
    project: Project
    onClose?: () => void
}

type ProjectImageProps = {
    src: string
    alt: string
    eager: boolean
}

function ProjectImage({src, alt, eager}: ProjectImageProps) {
    const [isLoaded, setIsLoaded] = useState(false)

    return (
        <img
            src={src}
            alt={alt}
            className={`${styles.image} ${isLoaded ? styles.imageLoaded : ''}`}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
        />
    )
}

export default function ProjectDetailView({project, onClose}: ProjectDetailViewProps) {
    const mediaPaneRef = useRef<HTMLDivElement | null>(null)
    const mediaFrameRefs = useRef<Record<number, HTMLDivElement | null>>({})
    const [selectedMedia, setSelectedMedia] = useState<{
        projectId: string
        mediaIndex: number
    } | null>(null)
    const mediaView = useMemo(
        () =>
            createProjectDetailMediaView(project, {
                imageUrl: getSanityProjectImageUrl,
            }),
        [project],
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

            setSelectedMedia({
                projectId: project._id,
                mediaIndex: selection.activeMediaIndex,
            })
            mediaFrameRefs.current[selection.scrollTargetMediaIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        },
        [activeMediaIndex, mediaView, project._id],
    )

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
                                    <VideoPlayer asset={item.asset} title={item.title} />
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
                                <VideoPlayer asset={item.asset} title={item.title} />
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
                    headerAction={
                        onClose ? (
                            <button type="button" className={styles.closeButton} onClick={onClose}>
                                [CLOSE]
                            </button>
                        ) : undefined
                    }
                />
            </aside>
        </section>
    )
}
