import React, { useState } from 'react'
import { urlFor } from '@/sanity/lib/utils'
import { Project } from '@/types'
import Image from 'next/image'
import { useMouseMoved } from '@/hooks/useMouseInitiatedHover'

// Props interface
interface ThumbnailProps {
    project: Project
    activeProject: Project | null
    rotations: Record<string, number>
    hoveredProject: Project | null
    handleClick: (project: Project) => void
    handleLeave: () => void
    handleHover: (project: Project) => void
}

// Functional component
const Thumbnail: React.FC<ThumbnailProps> = ({
    handleClick,
    handleHover,
    handleLeave,
    hoveredProject,
    activeProject,
    project,
}) => {
    const isActive = activeProject?._id === project._id
    const isHovered = hoveredProject?._id === project._id
    const [loading, setLoading] = useState(true);


  const hasMouseMoved = useMouseMoved();

    return (
        <button
            className={`work__project-card 
                    ${activeProject === project ? 'work__project-card--active' : ''}
                `}
            onMouseEnter={() => hasMouseMoved && handleHover(project)}
            onMouseLeave={handleLeave}
            onClick={() => handleClick(project)}
        >
            


{loading && (
        <div
          style={{
            background: "transparent",
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
        />
      )}
            
            {/* <Image
                className="work__project-card-img"
                src={urlFor(project.coverImage)?.height(600).width(600).auto('format').url()}
                width={500}
                height={500}
                alt={
                    typeof project.coverImage.alt === 'string'
                        ? project.coverImage.alt
                        : `Cover image for ${project.title}`
                }
        onLoadingComplete={() => setLoading(false)}
            /> */}

            <img
            className="work__project-card-img"
            src={urlFor(project.coverImage)?.height(600).width(600).auto('format').url()}
            alt={project.title}
            loading="lazy"
            style={{
                opacity: loading ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
            }}
            onLoad={() => setLoading(true)}
            />
            {/* <img
                src="/Union.svg"
                className={`shape-mask ${isActive ? 'shape-mask--active' : ''} ${isHovered ? 'shape-mask--hover' : ''}`}
            /> */}
        </button>
    )
}

export default React.memo(Thumbnail)


