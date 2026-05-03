'use client';

import { useCallback, useRef, useState } from 'react'
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import ProjectDetails from '@/components/Sidebar/ProjectDetails'
import { urlForImage } from '@/sanity/lib/utils'
import type { Project } from '@/types'
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

function ProjectImage({ src, alt, eager }: ProjectImageProps) {
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

export default function ProjectDetailView({ project, onClose }: ProjectDetailViewProps) {
  const media = project.media ?? []
  const mediaPaneRef = useRef<HTMLDivElement | null>(null)
  const mediaFrameRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)

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
      <div
        className={styles.mediaPane}
        ref={mediaPaneRef}
        onScroll={handleMediaScroll}
      >
        <div className={styles.mediaList}>
          {media.map((item, idx) => {
            if (item._type === 'image') {
              const src = urlForImage(item)?.width(1800).quality(85).url()

              if (!src) return null

              return (
                <div
                  key={item._key ?? item.asset?._ref ?? idx}
                  className={styles.mediaFrame}
                  ref={(element) => {
                    mediaFrameRefs.current[idx] = element
                  }}
                >
                  <ProjectImage
                    src={src}
                    alt={`Project image ${idx + 1} for ${project.title ?? 'project'}`}
                    eager={idx === 0}
                  />
                </div>
              )
            }

            if (item._type === 'uploadedVideo') {
              return (
                <div
                  key={item._key ?? `uploaded-video-${idx}`}
                  className={styles.mediaFrame}
                  ref={(element) => {
                    mediaFrameRefs.current[idx] = element
                  }}
                >
                  <VideoPlayer
                    asset={{
                      value: {
                        fileUrl: item.fileUrl ?? undefined,
                        poster: urlForImage(item.thumbnail)?.width(1600).quality(80).url(),
                      },
                    }}
                    title={item.title ?? undefined}
                  />
                </div>
              )
            }

            if (item._type === 'videoUrl') {
              return (
                <div
                  key={item._key ?? `video-url-${idx}`}
                  className={styles.mediaFrame}
                  ref={(element) => {
                    mediaFrameRefs.current[idx] = element
                  }}
                >
                  <VideoPlayer
                    asset={{
                      value: {
                        url: item.url ?? undefined,
                        poster: urlForImage(item.thumbnail)?.width(1600).quality(80).url(),
                      },
                    }}
                    title={item.title ?? undefined}
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
          headerAction={onClose ? (
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
            >
              [CLOSE]
            </button>
          ) : undefined}
        />
      </aside>
    </section>
  )
}
