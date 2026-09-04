'use client'

import styles from './ProjectGallery.module.css'
import ProjectCard from '../ProjectCard/ProjectCard'
import {Project} from '@/types'

const PROJECT_LOADING_CELL_COUNT = 12

// function getStableDelay(id: string) {
//     let hash = 0
//
//     for (let index = 0; index < id.length; index += 1) {
//         hash = (hash * 31 + id.charCodeAt(index)) % 1000
//     }
//
//     return (hash / 1000) * 0.28
// }

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
	const shouldShowLoadingCells = isLoading && projects.length === 0

	return (
		<div className={styles.projectGallery}>
			{shouldShowLoadingCells &&
				Array.from({length: PROJECT_LOADING_CELL_COUNT}, (_, index) => (
					<div
						key={`project-loading-cell-${index}`}
						className={styles.loadingCell}
						aria-hidden="true"
					/>
				))}
			{projects?.map((project, idx) => (
				<div
                    key={project._id}
                    // initial={{opacity: 0}}
                    // animate={{opacity: 1}}
                    // transition={{
                    //     duration: 0.11,
                    //     delay: getStableDelay(project._id),
                    //     ease: 'easeOut',
                    // }}
                    onMouseEnter={() => onProjectHover?.(project)}
                    onMouseLeave={() => onProjectLeave?.()}
                >
                    <ProjectCard
                        project={project}
                        index={idx}
                        href={getProjectHref(project)}
                        onOpen={onProjectOpen}
                    />
                </div>
            ))}
            {hasMore && (
                <button onClick={onLoadMore} disabled={isLoading} className={styles.viewMoreButton}>
                    <div>{isLoading ? '[LOADING...]' : '[LOAD MORE]'}</div>
                </button>
            )}
        </div>
    )
}
