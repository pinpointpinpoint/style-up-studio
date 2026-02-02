'use client'

import {Category, Project, Video, VideoUrls} from '@/types'
import {FC, useEffect, useState, useMemo} from 'react'
import {getYouTubeId, urlFor} from '@/sanity/lib/utils'
import {PortableText} from 'next-sanity'
import Thumbnails from './Thumbnails'
import {allProjectsQuery} from '@/sanity/lib/queries'
import Image from 'next/image'
import {Image as ImageType} from 'sanity'
import PlayButton from '../public/play.svg'
import VideoPlayer from './VideoPlayer'

import ReactPlayer from 'react-player'
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
  MediaFullscreenButton,
} from "media-chrome/react";


interface WorkProps {
  projects: Project[] | null
  categories: Category[]
}

export const Work: FC<WorkProps> = ({projects, categories}) => {
    const [playing, setPlaying] = useState(false);

  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [isLocked, setIsLocked] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string>()
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
    {_id: 'all', title: 'All', subcategories: [], referenceCount: projects?.length || 0},
  ]

  const allCategories = [...staticCategories, ...categories]

  const displayedProject =
    hoveredProject && hoveredProject !== activeProject ? hoveredProject : activeProject

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

  const allProjectAssets: any[] = [
    ...(displayedProject?.gallery ?? []).map((image) => ({
      kind: 'image',
      value: image as ImageType,
    })),

    ...(displayedProject?.videoUrls ?? []).map((videoUrl) => ({
      kind: 'videoUrl',
      value: videoUrl as VideoUrls,
    })),

    ...(displayedProject?.videos ?? []).map((video) => ({
      kind: 'video',
      value: video as Video,
    })),
  ]

  const filteredProjects = useMemo(() => {
    if (!projects) return []

    console.log(projects)

    // only fire if a category or subcategory was clicked?

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

  useEffect(() => {
    console.log(allProjectAssets)
    if (!isLocked || !activeProject) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      console.log(target)

      const activeCard = document.querySelector('.work__project-card--active')
      const projectDetails = document.querySelector('.work__project-details')

      if (activeCard && !activeCard.contains(target) && !projectDetails?.contains(target)) {
        setActiveProject(null)
        setIsLocked(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLocked, activeProject])

  useEffect(() => {
    const slider = document.querySelector('.work__project-images') as HTMLElement

    if (!slider) return

    let isDown = false
    let startX = 0
    let scrollLeft = 0

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      slider.classList.add('is-dragging')
      startX = e.pageX - slider.offsetLeft
      scrollLeft = slider.scrollLeft
    }

    const onMouseLeave = () => {
      isDown = false
      slider.classList.remove('is-dragging')
    }

    const onMouseUp = () => {
      isDown = false
      slider.classList.remove('is-dragging')
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - slider.offsetLeft
      const walk = (x - startX) * 1.2 // scroll speed
      slider.scrollLeft = scrollLeft - walk
    }

    slider.addEventListener('pointerdown', onMouseDown)
    slider.addEventListener('pointerleave', onMouseLeave)
    slider.addEventListener('pointerup', onMouseUp)
    slider.addEventListener('pointermove', onMouseMove)

    return () => {
      slider.removeEventListener('pointerdown', onMouseDown)
      slider.removeEventListener('pointerleave', onMouseLeave)
      slider.removeEventListener('pointerup', onMouseUp)
      slider.removeEventListener('pointermove', onMouseMove)
    }
  }, [])

  const handleCategoryHover = (categoryId: string) => {
    setHoveredCategory(categoryId)
  }

  const handleCategoryLeave = () => {
    setHoveredCategory('')
  }

  const handleCategoryClick = (categoryId: string) => {
    setFilter((prev) =>
      prev.category === categoryId
        ? {
            category: 'featured',
            subcategories: [],
          }
        : {
            category: categoryId,
            subcategories: [],
          },
    )
  }

  const handleSubcategoryClick = (subId: string, parentId: string) => {
    setFilter((prev) => {
      const isSameParent = prev.category === parentId
      const isActive = prev.subcategories.includes(subId)

      if (!isSameParent) {
        return {
          category: parentId,
          subcategories: [subId],
        }
      }

      return {
        category: parentId,
        subcategories: isActive
          ? prev.subcategories.filter((id) => id !== subId)
          : [...prev.subcategories, subId],
      }
    })
  }

  const handleHover = (project: Project) => {
    if (isLocked) return

    setHoveredProject(project)
  }

  const handleLeave = () => {
    if (isLocked) return
    setHoveredProject(null)
  }

  const handleClick = (project: Project) => {
    const possibleRotations = [-3, -2, 2, 3] // never 0 or ±1/2
    const randomIndex = Math.floor(Math.random() * possibleRotations.length)
    const rotation = possibleRotations[randomIndex]

    setHoveredProject(project)

    setRotations((prev) => {
      if (prev[project._id]) return prev
      return {
        ...prev,
        [project._id]: rotation,
      }
    })

    setActiveProject(project)
    setHoveredProject(null)
    setIsLocked(true)
  }

    function withYouTubeParams(url: string) {
      const u = new URL(url);

      u.searchParams.set("modestbranding", "1");
      u.searchParams.set("controls", "0");
      u.searchParams.set("rel", "0");
      u.searchParams.set("playsinline", "1");
      u.searchParams.set("cc_load_policy", "0");

      console.log(u)
      return u.toString();
  }


  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});

const handlePlay = (key: string) => {
  setPlayingMap((prev) => ({ ...prev, [key]: true }));
};



  return (
    <div className="work">
      <div className="work__projects">
        {filteredProjects.map((project) => (
          <Thumbnails
            key={project._id}
            project={project}
            activeProject={activeProject}
            rotations={rotations}
            handleClick={handleClick}
            handleHover={handleHover}
            handleLeave={handleLeave}
          />
        ))}
      </div>

      <aside className="work__sidebar">
        <div className="work__filter">
          {allCategories.map((cat) => (
            // if the cat is in the current filtered projects, get the count of it

            // Categories
            <div
              key={cat._id}
              className={`work__filter-category-group work__filter-category-group--${cat._id}`}
              onMouseEnter={() => handleCategoryHover(cat._id)}
              onMouseLeave={handleCategoryLeave}
            >
              {/* Category button */}
              <div className="work__filter-category">
                <button
                  className={`work__filter-category-btn ${filter.category === cat._id ? 'work__filter-category-btn--active' : ''}`}
                  onClick={() => handleCategoryClick(cat._id)}
                  onFocus={() => handleCategoryHover(cat._id)}
                >
                  <span>{cat.title}</span>
                  <span>({cat.referenceCount})</span>
                </button>
              </div>

              {/* Subcategories */}

              {cat.subcategories && cat.subcategories?.length > 0 && (
                <div
                  className={`work__filter-subcategories work__filter-subcategories${
                    hoveredCategory === cat._id ? '--expanded' : ''
                  }`}
                >
                  {cat.subcategories.map((sub) => (
                    <div key={sub._id} className="work__filter-subcategory">
                      <button
                        className={`work__filter-subcategory-btn work__filter-subcategory-btn${
                          filter.subcategories.includes(sub._id) ? '--active' : ''
                        }`}
                        onClick={() => handleSubcategoryClick(sub._id, cat._id)}
                      >
                        <span>{sub.title}</span>
                        <span>({sub.referenceCount})</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {displayedProject && (
          <div className="work__project-details">
            <div className="work__project-details-body">
              <div className="work__project-details-title">{displayedProject?.title}</div>
              <div className="work__project-details__categories">
                {displayedProject?.categories?.map((cat) => (
                  <span key={cat._id} className="work__project-details__category">
                    {cat.title}
                  </span>
                ))}
                {displayedProject?.subcategory && (
                  <span className="work__project-details__subcategory">
                    {displayedProject.subcategory.title}
                  </span>
                )}
              </div>
              {displayedProject?.credits && (
                <div className="work__project-details-credits">
                  <details>
                    <summary>Credits</summary>
                    <div>
                      <ul>
                        {displayedProject?.credits.map((credit, idx) => (
                          <li key={idx}>
                            <span>{credit.role}:</span>
                            {credit.link ? (
                              <span>
                                <a href={credit.link} target="_blank">
                                  {credit.name}
                                </a>
                              </span>
                            ) : (
                              <span>{credit.name}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </div>
              )}
              {displayedProject?.description && (
                <div className="work__project-details-description">
                  <details>
                    <summary>Description</summary>
                    <div>
                      <PortableText value={displayedProject.description} />
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* If there is only one thing, make it take the whole widht? but if there is mroe have the horizontal scrolling */}
            <div
              className="work__project-assets"
              // className="video-wrapper"
              onWheel={(e) => {
                const el = e.currentTarget

                const canScrollHorizontally = el.scrollWidth > el.clientWidth

                if (!canScrollHorizontally) return

                // Only prevent default if we actually scroll horizontally
                e.preventDefault()
                el.scrollLeft += e.deltaY
              }}
            >

            {/* <Image
              className="play"
              alt="Play button"
              src={PlayButton}
            />

            <Image
              alt={
                typeof displayedProject.coverImage.alt === 'string'
                  ? displayedProject.coverImage.alt
                  : `Cover image for ${displayedProject.title}`
              }
              style={{ objectFit: "cover" }}
              fill
              src={urlFor(displayedProject.coverImage)
                .auto('format')
                .url()}
            /> */}


            
                  
              {allProjectAssets.map((asset, idx) => {
                switch (asset.kind) {
                  case 'image':
                    return <Image key={idx} src={asset.value.image} alt={asset.value.alt} />;
                  case 'videoUrl':


  return (
    <MediaController
      key={asset.value._key}
      style={{ width: "100%", aspectRatio: "16/9", position: "relative" }}
    >

      <ReactPlayer
        slot="media"
        light={true}
        controls={true}
        playIcon={<div style={{background: "white", padding: "10px", border: "1px solid black"}}>Play</div>}
        onClickPreview={() => setPlaying(true)}
        style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}
        playing={playing}
        src={`https://www.youtube.com/watch?v=${getYouTubeId(asset.value.url)}`}
      />

      {/* <MediaControlBar>
        <MediaTimeRange />
        <MediaTimeDisplay showDuration />
        <MediaMuteButton />
        <MediaVolumeRange />
        <MediaFullscreenButton />
      </MediaControlBar> */}
    </MediaController>
  );


                    // <div
                    //   key={asset.value._key} 
                    //   style={{ position: "relative", width: "100%", aspectRatio: "16/9", cursor: "pointer" }}
                    //   onClick={() => setPlaying(true)}
                    // >
                    //   <ReactPlayer 
                    //     src={`https://www.youtube.com/watch?v=${getYouTubeId(asset.value.url)}`}
                    //     // light={true} 
                    //     playing={playing} 
                    //     controls={false} 
                    //     width="100%" 
                    //     height="100%" 
                    //           onClickPreview={() => setPlaying(true)} // optional

                    //   />
                    //   {!playing && (
                    //     <div
                    //       style={{
                    //         position: "absolute",
                    //         inset: 0,
                    //         display: "flex",
                    //         alignItems: "center",
                    //         justifyContent: "center",
                    //         fontSize: 60,
                    //         color: "white",
                    //         background: "rgba(0,0,0,0.3)",
                    //       }}
                    //     >
                    //       ▶
                    //     </div>
                    //   )}
                    // </div>

                      // <VideoPlayer key={asset.value._key} type="youtube" src={`https://www.youtube.com/embed/${getYouTubeId(asset.value.url)}`} />
                      

                  case 'video':
                    return (
                      <ReactPlayer 
                        style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
                        key={asset.value._key} 
                        src={asset.value.fileUrl} 
                        controls={false}
                      />

                      // <VideoPlayer key={asset.value._key} type="mp4" src={asset.value.fileUrl} />

                      // <video
                      //   controls
                      //   key={asset.value._key}
                      //   width="100%"
                      //   height="250px"
                      // >
                      //   <source src={asset.value.fileUrl} type="video/mp4" />
                      //   Your browser does not support the video tag.
                      // </video>
                    )
                }
              })}

              {/* {displayedProject?.videoUrls &&
                displayedProject?.videoUrls.map((videoUrl, idx) => (
                  <div className="work__project-video-embed" key={idx}>
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl.url)}`}
                      allowFullScreen
                    />
                  </div>
                ))} */}

              {/* {displayedProject?.videos &&
                displayedProject?.videos.map((video, idx) => (
                  <video
                    controls
                    key={video._key}
                    poster={urlFor(displayedProject.coverImage)?.width(800).height(450).url()}
                  >
                    <source src={video.fileUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ))} */}
            </div>
            {/* calculate total count of all assets and display here */}
          </div>
        )}
      </aside>
    </div>
  )
}
