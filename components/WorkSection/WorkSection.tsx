import { FC, useEffect, useState, useMemo, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Sidebar } from '../Sidebar/Sidebar'
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import { ProjectType, Project } from '@/types'
import '@vidstack/react/player/styles/base.css'
import styles from'./WorkSection.module.css'
import ProjectGallery from '../ProjectGallery/ProjectGallery'
import { useMouseMoved } from '@/hooks/useMouseInitiatedHover'

interface WorkSectionProps {
  projects: Project[] | null
  projectTypes: ProjectType[]
}

export const WorkSection: FC<WorkSectionProps> = ({ projects, projectTypes }) => {
  const targetRef = useRef<null | HTMLVideoElement>(null)

  const [visibleProjects, setVisibleProjects] = useState<Project[]>(projects || [])


  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [hoveredCategoryId, setHoveredCategory] = useState<string>()
  const [filter, setFilter] = useState({ category: 'featured', subcategories: [] as string[] })
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  // TODO: hook in loading state from parent component when fetching projects, for shimmer state
  const [isProjectsLoading, setIsProjectsLoading] = useState(false)

  const displayedProject = activeProject ?? hoveredProject


  const STATIC = [
    {
       _id:'featured',
       title: 'Featured',
       referenceCount: projects?.filter((p) => p.featured).length || 0,
    }, 
    {
      _id:'all',
      title: 'All',
      referenceCount: projects?.length || 0,
    }
  ]

  const merged = new Map<string, ProjectType>()

  STATIC.forEach((t) => merged.set(t._id, t))
  
  projectTypes.forEach((t) => merged.set(t._id, t)) 
  
  const allProjectTypes = Array.from(merged.values())

  const handleHover = useCallback((project: Project) => {
    if (!isLocked) setHoveredProject(project)
  }, [isLocked])

  const renderAsset = (asset: any) => {
    switch (asset.kind) {
      case 'image':
        return <Image key={asset.value._key} src={asset.value.image} alt={asset.value.alt} width={600} height={400} className="rounded-lg" />
      case 'videoUrl':
      case 'video':
        return <VideoPlayer key={asset.value._key} asset={asset} title={asset.value.title} />
      default:
        return null
    }
  }

  // Sync visibleProjects with prop
  useEffect(() => {
    setVisibleProjects(projects || [])
  }, [projects])

  return (
    <div className={styles.workSection}>
      <ProjectGallery 
        projects={visibleProjects}
        hasMouseMoved={useMouseMoved()}
        isLoading={isProjectsLoading}
        // activeProject={activeProject}
        // rotations={rotations}
        // hoveredProject={hoveredProject}
        // handleClick={handleClick}
        // handleHover={handleHover}
        // handleLeave={handleLeave}
      />
      <Sidebar
        displayedProject={displayedProject}
        allProjectTypes={allProjectTypes}
        filter={filter}
        hoveredCategoryId={hoveredCategoryId}
        setHoveredCategory={setHoveredCategory}
        setFilter={setFilter}
        renderAsset={renderAsset}
      />
    </div>
  )
}