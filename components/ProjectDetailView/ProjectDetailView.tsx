'use client';

import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import { urlForImage } from '@/sanity/lib/utils'
import type { Project } from '@/types'
import styles from './ProjectDetailView.module.css'

type ProjectDetailViewProps = {
  project: Project
}

export default function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const gallery = project.gallery ?? []
  const videos = project.videos ?? []
  const videoUrls = project.videoUrls ?? []

  return (
    <section className={styles.container} aria-label={`${project.title ?? 'Project'} details`}>
      <div className={styles.mediaList}>
        {gallery.map((image, idx) => {
          const src = urlForImage(image)?.width(1800).quality(85).url()

          if (!src) return null

          return (
            <div
              key={image._key ?? image.asset?._ref ?? idx}
              className={styles.mediaFrame}
            >
              <img
                src={src}
                alt={`Project image ${idx + 1} for ${project.title ?? 'project'}`}
                className={styles.image}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          )
        })}
        {videos.map((video, idx) => (
          <div
            key={video._key ?? `video-${idx}`}
            className={styles.mediaFrame}
          >
            <VideoPlayer
              asset={{
                value: {
                  fileUrl: video.fileUrl ?? undefined,
                  poster: urlForImage(video.thumbnail)?.width(1600).quality(80).url(),
                },
              }}
              title={video.title ?? undefined}
            />
          </div>
        ))}
        {videoUrls.map((videoUrl, idx) => (
          <div
            key={videoUrl._key ?? `video-url-${idx}`}
            className={styles.mediaFrame}
          >
            <VideoPlayer
              asset={{
                value: {
                  url: videoUrl.url ?? undefined,
                  poster: urlForImage(videoUrl.thumbnail)?.width(1600).quality(80).url(),
                },
              }}
              title={videoUrl.title ?? undefined}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
