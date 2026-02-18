'use client'

import { Category, Project, Video, VideoUrls } from '@/types'
import { FC, useEffect, useState, useMemo, useRef, useCallback } from 'react'
import Thumbnail from './Thumbnail'
import { Image as ImageType } from 'sanity'
import FilterMenu from './FilterMenu'
import ProjectDetails from './ProjectDetails'
import Modal from './Modal'
import Image from 'next/image'
import ReactPlayer from 'react-player'
import VideoPlayer from './VideoPlayer'
import { getYouTubeId } from '@/sanity/lib/utils'

//  TO DO SOMETHING WEIRD IS HAPPENING WITH CLICK AND HOVERING ON THUMBNAILS
// SHOWING PROJ DETAILS, DOUBLE CHECK THESE 

interface WorkProps {
  projects: Project[] | null
  categories: Category[]
}

export const Work: FC<WorkProps> = ({ projects, categories }) => {
  type ImageAsset = {
    kind: string
    value: ImageType // replace with your actual image type
  }

  type VideoUrlAsset = {
    kind: string
    value: VideoUrls
  }

  type VideoAsset = {
    kind: string
    value: Video // replace with your actual video type
  }

  type ProjectAsset = ImageAsset | VideoUrlAsset | VideoAsset

  const targetRef = useRef<null | HTMLVideoElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [isLocked, setIsLocked] = useState(false)
  const [hoveredCategoryId, setHoveredCategory] = useState<string>()
  const [filter, setFilter] = useState<{
    category: string
    subcategories: string[]
  }>({
    category: 'featured',
    subcategories: [],
  })

  const staticCategories: Category[] = [
    {
      _id: 'featured',
      title: 'Featured',
      subcategories: [],
      referenceCount: projects?.filter((proj) => proj.featured).length || 0,
    },
    { _id: 'all', title: 'All', subcategories: [], referenceCount: projects?.length || 0 },
  ]

  const allCategories = useMemo(() => {
    return [...staticCategories, ...categories]
  }, [categories, projects])

  const displayedProject = activeProject ?? hoveredProject;

  const filteredProjects = useMemo(() => {
    if (!projects) return []

    // Featured
    if (filter.category === 'featured') {
      return projects.filter((p) => p.featured)
    }

    // All
    if (filter.category === 'all') {
      return projects
    }

    return projects.filter((project) => {
      const matchesCategory = project.categories?.some((cat) => cat._id === filter.category)

      const matchesSubcategories =
        filter.subcategories?.length === 0 ||
        (project.subcategory && filter.subcategories?.includes(project.subcategory._id))

      return matchesCategory && matchesSubcategories
    })
  }, [projects, filter])

  // for testing
  useEffect(() => {
    console.log(`displayed: ${displayedProject}`)
    console.log(`active: ${activeProject}`)
    console.log(`hover:${hoveredProject}`)
  }, [activeProject, hoveredProject, displayedProject])

  useEffect(() => {
    if (!isLocked || !activeProject) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const activeCard = document.querySelector('.work__project-card--active')
      const projectDetails = document.querySelector('.work__project-details')
      const modal = document.querySelector('.modal__container');

      if (activeCard && !activeCard.contains(target) && !projectDetails?.contains(target) && !modal?.contains(target)) {
        setActiveProject(null)
        setIsLocked(false)
        setHoveredProject(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLocked, activeProject])


  // CHECK THIS FUNCTION
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

  const handleHover = useCallback(
    (project: Project) => {
      if (isLocked) return
      setHoveredProject(project)
    },
    [isLocked],
  )

  const handleLeave = useCallback(() => {
    if (isLocked) return
    setHoveredProject(null)
  }, [isLocked])


  const handleClick = (project: Project) => {
    setActiveProject(project)
    setHoveredProject(null)
    setIsLocked(true)
  }

  const handlePreviewClick = (playingId: string) => {
    setPlayingVideoId(playingId)

    if (targetRef.current) {
      // 3. Use scrollIntoView() to scroll to the element
      targetRef.current.scrollIntoView({
        behavior: 'smooth', // Optional: adds a smooth scrolling animation
        block: 'end', // Optional: aligns the top of the element to the top of the viewport
      })
    }
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<any>(null)

  const openModal = (data: any) => {
    setModalData(data)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalData(null)
  }


  const renderAsset = (asset: any) => {
    switch (asset.kind) {
      case 'image':
        return <Image key={asset.value._key} src={asset.value.image} alt={asset.value.alt} />
      case 'videoUrl':
        return (
          <ReactPlayer
            key={asset.value._key}
            light
            controls
            playing={playingVideoId === asset.value._key}
            playIcon={
              <div style={{ background: 'white', padding: '3px 15px', border: '1px solid black' }}>
                Play
              </div>
            }
            onClickPreview={() => setPlayingVideoId(asset.value._key)}
            src={`https://www.youtube.com/watch?v=${getYouTubeId(asset.value.url)}`}
          />
        )
      case 'video':
        return <VideoPlayer key={asset.value._key} videoSrc={asset.value.fileUrl} />
    }
  }


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
      <aside className="work__sidebar">
        <div>
          <div className="work__sidebar-title">FILTER</div>
          <FilterMenu
            categories={allCategories}
            filter={filter}
            hoveredCategoryId={hoveredCategoryId}
            setHoveredCategory={setHoveredCategory}
            setFilter={setFilter}
          />
        </div>
        {displayedProject && (
          <div>
            <div className="work__sidebar-title">PROJECT INFO</div>
            <ProjectDetails
              displayedProject={displayedProject}
              onOpenModal={openModal}
              renderAsset={renderAsset}
            />
          </div>
        )}
      </aside>
      {modalOpen && (
        <Modal onClose={closeModal} data={modalData} renderAsset={renderAsset}></Modal>
      )}
    </div>
  )
}