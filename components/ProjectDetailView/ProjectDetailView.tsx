'use client'

import {useCallback, useMemo, useRef, useState} from 'react'
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import ProjectDetails from '@/components/Sidebar/ProjectDetails'
import {getProjectDetailMedia} from '@/lib/projectMediaPresentation'
import {getSanityProjectImageUrl} from '@/lib/sanityProjectImageUrl'
import type {Project} from '@/types'
import styles from './ProjectDetailView.module.css'

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
    const media = project.media ?? []
    const mediaPaneRef = useRef<HTMLDivElement | null>(null)
    const mediaFrameRefs = useRef<Record<number, HTMLDivElement | null>>({})
    const [activeMediaIndex, setActiveMediaIndex] = useState(0)
    const detailMediaByIndex = useMemo(() => {
        const detailMedia = getProjectDetailMedia(project, {
            imageUrl: getSanityProjectImageUrl,
        })

        return new Map(detailMedia.map((item) => [item.mediaIndex, item]))
    }, [project])

    const handleAssetSelect = useCallback((mediaIndex: number) => {
        setActiveMediaIndex(mediaIndex)
        mediaFrameRefs.current[mediaIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    }, [])

    const handleMediaScroll = useCallback(() => {
        const mediaPane = mediaPaneRef.current

        if (!mediaPane) return

        const paneRect = mediaPane.getBoundingClientRect()
        const paneCenter = paneRect.top + paneRect.height / 2
        let nearestIndex = activeMediaIndex
        let nearestDistance = Number.POSITIVE_INFINITY

        Object.entries(mediaFrameRefs.current).forEach(([index, element]) => {
            if (!element) return

            const frameRect = element.getBoundingClientRect()
            const frameCenter = frameRect.top + frameRect.height / 2
            const distance = Math.abs(frameCenter - paneCenter)

            if (distance < nearestDistance) {
                nearestDistance = distance
                nearestIndex = Number(index)
            }
        })

        if (nearestIndex !== activeMediaIndex) {
            setActiveMediaIndex(nearestIndex)
        }
    }, [activeMediaIndex])

    return (
        <section className={styles.container} aria-label={`${project.title ?? 'Project'} details`}>
            <div className={styles.mediaPane} ref={mediaPaneRef} onScroll={handleMediaScroll}>
                <div className={styles.mediaList}>
                    {media.map((item, idx) => {
                        if (item._type === 'image') {
                            const image = detailMediaByIndex.get(idx)

                            if (!image || image.kind !== 'image') return null

                            return (
                                <div
                                    key={item._key ?? item.asset?._ref ?? idx}
                                    className={styles.mediaFrame}
                                    ref={(element) => {
                                        mediaFrameRefs.current[idx] = element
                                    }}
                                >
                                    <ProjectImage
                                        src={image.url}
                                        alt={image.alt}
                                        eager={image.eager}
                                    />
                                </div>
                            )
                        }

                        if (item._type === 'uploadedVideo') {
                            const uploadedVideo = detailMediaByIndex.get(idx)

                            if (!uploadedVideo || uploadedVideo.kind !== 'uploadedVideo') {
                                return null
                            }

                            return (
                                <div
                                    key={uploadedVideo.key}
                                    className={styles.mediaFrame}
                                    ref={(element) => {
                                        mediaFrameRefs.current[idx] = element
                                    }}
                                >
                                    <VideoPlayer
                                        asset={uploadedVideo.asset}
                                        title={uploadedVideo.title}
                                    />
                                </div>
                            )
                        }

                        if (item._type === 'videoUrl') {
                            const externalVideo = detailMediaByIndex.get(idx)

                            if (!externalVideo || externalVideo.kind !== 'videoUrl') {
                                return null
                            }

                            return (
                                <div
                                    key={externalVideo.key}
                                    className={styles.mediaFrame}
                                    ref={(element) => {
                                        mediaFrameRefs.current[idx] = element
                                    }}
                                >
                                    <VideoPlayer
                                        asset={externalVideo.asset}
                                        title={externalVideo.title}
                                    />
                                </div>
                            )
                        }

                        return null
                    })}
                </div>
            </div>
            <aside className={styles.sidebar}>
                <ProjectDetails
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
