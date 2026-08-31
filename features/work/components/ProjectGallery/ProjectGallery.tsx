'use client'

import {useRef} from 'react'
import styles from './ProjectGallery.module.css'
import ProjectCard from '../ProjectCard/ProjectCard'
import {Project} from '@/types'
import {useProjectGalleryScrollRestoration} from '@/features/work/hooks/useProjectGalleryScrollRestoration'

type ProjectGalleryProps = {
    projects: Project[]
    hasMore: boolean
    isLoading?: boolean
    onLoadMore: () => void
    getProjectHref: (project: Project) => string
    onProjectOpen?: () => void
    onProjectHover?: (project: Project) => void
    onProjectLeave?: () => void
}

export default function ProjectGallery({
    projects,
    hasMore,
    isLoading = false,
    onLoadMore,
    getProjectHref,
    onProjectOpen,
    onProjectHover,
    onProjectLeave,
}: ProjectGalleryProps) {
    const galleryRef = useRef<HTMLDivElement | null>(null)
    useProjectGalleryScrollRestoration(galleryRef)

    const onEnter = (project: Project) => () => {
        onProjectHover?.(project)
    }

    const onLeave = () => {
        onProjectLeave?.()
    }

    return (
        <div
            ref={galleryRef}
            className={styles.projectGallery}
            onMouseLeave={onLeave}
        >
            {projects?.map((project, idx) => (
                <div key={project._id}>
                    <ProjectCard
                        project={project}
                        index={idx}
                        href={getProjectHref(project)}
                        onOpen={onProjectOpen}
                        onHoverStart={onEnter(project)}
                    />
                </div>
            ))}
            {hasMore && (
                <button onClick={onLoadMore} disabled={isLoading} className={styles.viewMoreButton}>
                    {isLoading ? '[LOADING...]' : '[LOAD MORE]'}
                </button>
            )}
        </div>
    )
}
