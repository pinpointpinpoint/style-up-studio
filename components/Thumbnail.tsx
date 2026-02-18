import React from 'react'
import { urlFor } from '@/sanity/lib/utils'
import { Project } from '@/types'
import Image from 'next/image'

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

    return (
        <button
            className={`work__project-card 
                    ${activeProject === project ? 'work__project-card--active' : ''}
                `}
            onMouseEnter={() => handleHover(project)}
            onMouseLeave={handleLeave}
            onClick={() => handleClick(project)}
        >
            <Image
                className="work__project-card-img"
                src={urlFor(project.coverImage)?.height(600).width(600).auto('format').url()}
                width={500}
                height={500}
                alt={
                    typeof project.coverImage.alt === 'string'
                        ? project.coverImage.alt
                        : `Cover image for ${project.title}`
                }
            />
            <img
                src="/Union.svg"
                className={`shape-mask ${isActive ? 'shape-mask--active' : ''} ${isHovered ? 'shape-mask--hover' : ''}`}
            />
        </button>
    )
}

export default React.memo(Thumbnail)
