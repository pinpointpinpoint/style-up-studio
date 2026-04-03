'use client'

import { FC, useEffect, useState, useMemo, useRef, useCallback } from 'react'
import Image from 'next/image'
import Thumbnail from './Thumbnail'
import Modal from './Modal'
import { Sidebar } from './Sidebar/Sidebar'
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import { Category, Project } from '@/types'
import '@vidstack/react/player/styles/base.css'

interface WorkProps {
  projects: Project[] | null
  categories: Category[]
}

export const Work: FC<WorkProps> = ({ projects, categories }) => {
  // -------------------------
  // Refs
  // -------------------------
  const targetRef = useRef<null | HTMLVideoElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // -------------------------
  // State
  // -------------------------
  const [localProjects, setLocalProjects] = useState<Project[]>(projects || [])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [isLocked, setIsLocked] = useState(false)
  const [hoveredCategoryId, setHoveredCategory] = useState<string>()
  const [filter, setFilter] = useState({ category: 'featured', subcategories: [] as string[] })
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<any>(null)

  // -------------------------
  // Derived Data
  // -------------------------
  const displayedProject = activeProject ?? hoveredProject

  const staticCategories: Category[] = useMemo(() => [
    {
      _id: 'featured',
      title: 'Featured',
      subcategories: [],
      referenceCount: projects?.filter((p) => p.featured).length || 0,
    },
    {
      _id: 'all',
      title: 'All',
      subcategories: [],
      referenceCount: projects?.length || 0,
    },
  ], [projects])

  const allCategories = useMemo(() => [...staticCategories, ...(categories || [])], [categories, staticCategories])

  const filteredProjects = useMemo(() => {
    if (!localProjects.length) return []

    if (filter.category === 'featured') return localProjects.filter((p) => p.featured)
    if (filter.category === 'all') return localProjects

    return localProjects.filter((project) => {
      const matchesCategory = project.categories?.some((cat) => cat._id === filter.category)
      const matchesSubcategories =
        filter.subcategories.length === 0 ||
        (project.subcategory && filter.subcategories.includes(project.subcategory._id))
      return matchesCategory && matchesSubcategories
    })
  }, [localProjects, filter])

  // -------------------------
  // Handlers
  // -------------------------
  const handleHover = useCallback((project: Project) => {
    if (!isLocked) setHoveredProject(project)
  }, [isLocked])

  const handleLeave = useCallback(() => {
    if (!isLocked) setHoveredProject(null)
  }, [isLocked])

  const handleClick = (project: Project) => {
    setActiveProject(project)
    setHoveredProject(null)
    setIsLocked(true)
  }

  const handlePreviewClick = (playingId: string) => {
    setPlayingVideoId(playingId)
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const openModal = (data: any) => {
    setModalData(data)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalData(null)
    setModalOpen(false)
  }

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

  // -------------------------
  // Effects
  // -------------------------

  // Sync localProjects with prop
  useEffect(() => {
    setLocalProjects(projects || [])
  }, [projects])

  // Click outside to unlock active project
  useEffect(() => {
    if (!isLocked || !activeProject) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const activeCard = document.querySelector('.work__project-card--active')
      const projectDetails = document.querySelector('.ProjectDetails-module__ESnuvG__container')
      const modal = document.querySelector('.modal__container')

      if (activeCard && !activeCard.contains(target) &&
          !projectDetails?.contains(target) &&
          !modal?.contains(target)) {
        setActiveProject(null)
        setHoveredProject(null)
        setIsLocked(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLocked, activeProject])

  // Slider drag scrolling
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    let isDown = false
    let startX = 0
    let scrollLeft = 0

    const onPointerDown = (e: PointerEvent) => {
      isDown = true
      startX = e.pageX - slider.offsetLeft
      scrollLeft = slider.scrollLeft
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return
      requestAnimationFrame(() => {
        const x = e.pageX - slider.offsetLeft
        slider.scrollLeft = scrollLeft - (x - startX) * 1.2
      })
    }

    const stop = () => (isDown = false)

    slider.addEventListener('pointerdown', onPointerDown)
    slider.addEventListener('pointermove', onPointerMove)
    slider.addEventListener('pointerup', stop)
    slider.addEventListener('pointerleave', stop)

    return () => {
      slider.removeEventListener('pointerdown', onPointerDown)
      slider.removeEventListener('pointermove', onPointerMove)
      slider.removeEventListener('pointerup', stop)
      slider.removeEventListener('pointerleave', stop)
    }
  }, [])

  return (
    <div className="work">
      <div className="work__projects">
        {filteredProjects.map((project) => (
          <Thumbnail
            key={project._id}
            project={project}
            activeProject={activeProject}
            rotations={rotations}
            hoveredProject={hoveredProject}
            handleClick={handleClick}
            handleHover={handleHover}
            handleLeave={handleLeave}
          />
        ))}
      </div>

      <Sidebar
        displayedProject={displayedProject}
        allCategories={allCategories}
        filter={filter}
        hoveredCategoryId={hoveredCategoryId}
        setHoveredCategory={setHoveredCategory}
        setFilter={setFilter}
        openModal={openModal}
        renderAsset={renderAsset}
      />

      {modalOpen && <Modal onClose={closeModal} data={modalData} renderAsset={renderAsset} />}
    </div>
  )
}