import React, { useState } from 'react'
import { urlFor } from '@/sanity/lib/utils'
import { Project } from '@/types'
import { useMouseMoved } from '@/hooks/useMouseInitiatedHover'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
    project: Project
    // activeProject: Project | null
    // rotations: Record<string, number>
    // hoveredProject: Project | null
    // handleClick: (project: Project) => void
    // handleLeave: () => void
    // handleHover: (project: Project) => void
    onHoverStart: (e: React.MouseEvent<HTMLButtonElement>) => void
    onHoverMove: (e: React.MouseEvent<HTMLButtonElement>) => void
    onHoverEnd: () => void
    hasMouseMoved: boolean
}

const ProjectCard = ({
    // handleClick,
    // handleHover,
    // handleLeave,
    // hoveredProject,
    // activeProject,
    project,
    onHoverEnd,
    onHoverMove,
    onHoverStart,
    hasMouseMoved
}: ProjectCardProps) => {
    // const isActive = activeProject?._id === project._id
    // const isHovered = hoveredProject?._id === project._id
    const [loading, setLoading] = useState(true);
    const imageUrl = urlFor(project.coverImage)?.height(600).width(600).auto('format').url()

    return (
        <button
            // className={`work__project-card 
            //         ${activeProject === project ? 'work__project-card--active' : ''}
            //     `}
            // onMouseEnter={() => hasMouseMoved && handleHover(project)}
            // onMouseLeave={handleLeave}
            // onClick={() => handleClick(project)}
            className={`${styles.projectCard} ${loading ? styles.projectCardLoading : ''}`}
            onMouseEnter={onHoverStart}
            onMouseMove={onHoverMove}
            onMouseLeave={onHoverEnd}
        >
            <img
                src={imageUrl}
                alt={`Cover image for ${project.title}`}
                loading="lazy"
                className={`${styles.projectCardImage} ${!loading ? styles.projectCardImageLoaded : ''}`}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
            />
        </button>
    )
}

export default React.memo(ProjectCard)