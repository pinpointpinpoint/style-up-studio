'use client';

import React, { useEffect, useRef, useState } from 'react'
import { urlForImage } from '@/sanity/lib/utils'
import { Project } from '@/types'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
    project: Project
    index: number
    onHoverStart: (e: React.MouseEvent<HTMLButtonElement>) => void
    onHoverMove: (e: React.MouseEvent<HTMLButtonElement>) => void
    onHoverEnd: () => void
    hasMouseMoved: boolean
}

const ProjectCard = ({
    project,
    index,
    onHoverEnd,
    onHoverMove,
    onHoverStart
}: ProjectCardProps) => {
    const [loading, setLoading] = useState(true);
    const imageUrl = urlForImage(project.coverImage)?.height(1200).width(1200).url()

    return (
        <button
            className={`${styles.projectCard} ${loading ? styles.projectCardLoading : ''}`}
            onMouseEnter={onHoverStart}
            onMouseMove={onHoverMove}
            onMouseLeave={onHoverEnd}
        >
            <img
                src={imageUrl}
                alt={`Cover image for ${project.title ?? "project"}`}     
                className={`${styles.projectCardImage} ${!loading ? styles.projectCardImageLoaded : ''}`}
                loading={index < 6 ? "eager" : "lazy"} 
                fetchPriority={index < 6 ? "high" : "low"}               
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
            />
        </button>
    )
}

export default React.memo(ProjectCard)
