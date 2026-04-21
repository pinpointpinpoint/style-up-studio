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
            <img
              key={image._key ?? image.asset?._ref ?? idx}
              src={src}
              alt={`Project image ${idx + 1} for ${project.title ?? 'project'}`}
              className={styles.image}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          )
        })}
        {videos.map((video, idx) => (
          <VideoPlayer
            key={video._key ?? `video-${idx}`}
            asset={{
              value: {
                fileUrl: video.fileUrl ?? undefined,
                poster: urlForImage(video.thumbnail)?.width(1600).quality(80).url(),
              },
            }}
            title={video.title ?? undefined}
          />
        ))}
        {videoUrls.map((videoUrl, idx) => (
          <VideoPlayer
            key={videoUrl._key ?? `video-url-${idx}`}
            asset={{
              value: {
                url: videoUrl.url ?? undefined,
                poster: urlForImage(videoUrl.thumbnail)?.width(1600).quality(80).url(),
              },
            }}
            title={videoUrl.title ?? undefined}
          />
        ))}
      </div>
    </section>
  )
}
