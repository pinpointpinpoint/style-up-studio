'use client';

import { useEffect, useRef, useState } from 'react'
import styles from'./ProjectGallery.module.css'
import ProjectCard from '../ProjectCard/ProjectCard'
import { Project } from '@/types'
import ProjectHoverCursor from '../ProjectHoverCursor'
import { motion } from "framer-motion";
import { useIntro } from '@/contexts/IntroContext'

type ProjectGalleryProps = {
  projects: Project[]
  hasMore: boolean
  isLoading?: boolean
  onLoadMore: () => void
  onProjectHover?: (project: Project) => void
  onProjectLeave?: () => void
  hasMouseMoved?: boolean
  isFeaturedProjects: boolean
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
  onProjectHover,
  onProjectLeave,
  hasMouseMoved = false,
  isFeaturedProjects
}: ProjectGalleryProps) {
  const introDone = useIntro()
  const [cursor, setCursor] = useState({show: false, x: 0, y: 0 })

  const galleryRef = useRef<HTMLDivElement | null>(null)

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
    setCursor({ show: true, x: e.clientX, y: e.clientY })
  }
  
  const onMove = (e: React.MouseEvent) => {
    setCursor((prev) => ({ ...prev, x: e.clientX, y: e.clientY }))
  }

  const onLeave = () => {
    onProjectLeave?.()
    setCursor((prev) => ({ ...prev, show: false }))
  }

  if (projects.length < 1) {
    return (
      <div className={styles.projectGallery}>No projects</div>
    )
  }

  return (
    <div ref={galleryRef} className={`${styles.projectGallery} ${isFeaturedProjects ? styles.featuredGallery : ""}`}>
        {projects?.map((project, idx) => (
        <motion.div
          key={project._id}
          initial={{ opacity: 0 }}
          animate={introDone ? { opacity: 1} : {}}
          transition={{ duration: 0.25, ease: 'easeOut', delay: getStableDelay(project._id) }}
        >
          <ProjectCard
            project={project}
            index={idx}
            onHoverStart={onEnter(project)}
            onHoverMove={onMove}
            onHoverEnd={onLeave}
            hasMouseMoved={hasMouseMoved}
          />
        </motion.div>
        ))}
        {cursor.show && (
          <ProjectHoverCursor x={cursor.x} y={cursor.y} text="[VIEW]" />
        )}

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
