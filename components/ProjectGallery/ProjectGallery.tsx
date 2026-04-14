import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import styles from'./ProjectGallery.module.css'
import ProjectCard from '../ProjectCard/ProjectCard'
import { Project } from '@/types'
import ProjectHoverCursor from '../ProjectHoverCursor'
import { motion } from "framer-motion";
import { useIntro } from '@/contexts/IntroContext'

type ProjectGalleryProps = {
  projects: Project[] | null
  isLoading?: boolean
  emptyState?: ReactNode
  hasMouseMoved?: boolean
  skeletonCount?: number
}

export default function ProjectGallery({
  projects,
  isLoading,
  hasMouseMoved = false,
  skeletonCount = 12
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

  const onEnter = (e: React.MouseEvent) => {
    setCursor({ show: true, x: e.clientX, y: e.clientY })
  }
  
  const onMove = (e: React.MouseEvent) => {
    setCursor((prev) => ({ ...prev, x: e.clientX, y: e.clientY }))
  }

  const onLeave = () => {
    setCursor((prev) => ({ ...prev, show: false }))
  }

  const delays = useMemo(
    () => (projects ?? []).map(() => Math.random() * 0.9),
    [projects]
  )

  if (isLoading) {
    return (
      <div className={`${styles.projectGallery} ${styles.skeletonGrid}`} aria-busy="true" aria-live="polite">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div key={`skeleton-${idx}`} className={styles.skeletonCard}>
            <div className={styles.skeletonShimmer} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={galleryRef} className={styles.projectGallery}>
        {projects?.map((project, idx) => (
        <motion.div
          key={project._id}
          initial={{ opacity: 0 }}
          animate={introDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, ease: 'easeOut', delay: delays[idx] }}
        >
          <ProjectCard
            project={project}
            onHoverStart={onEnter}
            onHoverMove={onMove}
            onHoverEnd={onLeave}
            hasMouseMoved={hasMouseMoved}
            // activeProject={activeProject}
            // rotations={rotations}
            // hoveredProject={hoveredProject}
            // handleClick={handleClick}
            // handleHover={handleHover}
            // handleLeave={handleLeave}
          />
        </motion.div>
        ))}
        {cursor.show && (
          <ProjectHoverCursor x={cursor.x} y={cursor.y} text="[VIEW]" />
        )}
        <button className={styles.viewMoreButton}>[LOAD MORE]</button>
    </div>
  )
}