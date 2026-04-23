'use client';

import { useEffect, useRef, useState } from 'react'
import styles from'./ProjectGallery.module.css'
import ProjectCard from '../ProjectCard/ProjectCard'
import { Project } from '@/types'
import { motion } from "framer-motion";
import { useIntro } from '@/contexts/IntroContext'

type ProjectGalleryProps = {
  projects: Project[]
  hasMore: boolean
  isLoading?: boolean
  onLoadMore: () => void
  getProjectHref: (project: Project) => string
  onProjectOpen?: () => void
  onProjectHover?: (project: Project) => void
  onProjectLeave?: () => void
  hasMouseMoved?: boolean
}

function getStableDelay(id: string) {
  let hash = 0

  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000
  }

  return (hash / 1000) * 0.4
}

export default function ProjectGallery({
  projects,
  hasMore,
  isLoading = false,
  onLoadMore,
  getProjectHref,
  onProjectOpen,
  onProjectHover,
  onProjectLeave,
  hasMouseMoved = false
}: ProjectGalleryProps) {
  const introDone = useIntro()
  const [hasPlayedIntro, setHasPlayedIntro] = useState(introDone)
  const shouldRunIntroAnimation = introDone && !hasPlayedIntro

  const galleryRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!shouldRunIntroAnimation) return

    const animationTimer = setTimeout(() => {
      setHasPlayedIntro(true)
    }, 700)

    return () => {
      clearTimeout(animationTimer)
    }
  }, [shouldRunIntroAnimation])

  useEffect(() => {
    const el = galleryRef.current
  if (!el) return

  const saved = sessionStorage.getItem('projectGalleryScrollY')
  if (saved) el.scrollTop = Number(saved)

  const onScroll = () => {
    sessionStorage.setItem('projectGalleryScrollY', String(el.scrollTop))
  }

  el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const onEnter = (project: Project) => (e: React.MouseEvent) => {
    onProjectHover?.(project)
  }

  const onLeave = () => {
    onProjectLeave?.()
  }

  if (projects.length < 1) {
    return (
      <div className={styles.projectGallery}>
        No projects
      </div>
    )
  }

  return (
    <div
      ref={galleryRef}
      className={styles.projectGallery}
      onMouseLeave={onLeave}
    >
        {projects?.map((project, idx) => (
        <motion.div
          key={project._id}
          initial={hasPlayedIntro ? false : { opacity: 0 }}
          animate={introDone ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: shouldRunIntroAnimation ? 0.25 : 0,
            ease: 'easeOut',
            delay: shouldRunIntroAnimation ? getStableDelay(project._id) : 0,
          }}
        >
          <ProjectCard
            project={project}
            index={idx}
            href={getProjectHref(project)}
            onOpen={onProjectOpen}
            onHoverStart={onEnter(project)}
            onHoverMove={() => {}}
            hasMouseMoved={hasMouseMoved}
          />
        </motion.div>
        ))}
        {hasMore && (
        <button 
          onClick={onLoadMore} 
          disabled={isLoading}
          className={styles.viewMoreButton}        >
          {isLoading ? '[LOADING...]' : '[LOAD MORE]'}
        </button>
)}
    </div>
  )
}
