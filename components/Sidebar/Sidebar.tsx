import { ProjectType, Project } from '@/types';
import FilterMenu from './FilterMenu';
import ProjectDetails from './ProjectDetails';
import { Filter } from '@/types';
import styles from "./Sidebar.module.css";
import { useEffect, useRef, useState } from 'react';

type SidebarProps = {
    displayedProject: Project | null
    allProjectTypes: ProjectType[]
    filter: Filter
    hoveredCategoryId?: string
    setHoveredCategory: (id: string) => void
    setFilter: (filter: Filter) => void
    renderAsset: (asset: any) => React.ReactNode
}

export function Sidebar({
    displayedProject,
    allProjectTypes,
    filter,
    hoveredCategoryId,
    setHoveredCategory,
    setFilter,
    renderAsset,
}: SidebarProps) {

    return (
        <aside className={styles.container}>
            <div className={styles.section}>
                <FilterMenu
                    projectTypes={allProjectTypes}
                    filter={filter}
                    hoveredCategoryId={hoveredCategoryId}
                    setHoveredCategory={setHoveredCategory}
                    setFilter={setFilter}
                />
            </div>
            <div className={styles.section}>
                <div className={styles.title}>PROJECT INFORMATION</div>
                <ProjectDetails
                    displayedProject={displayedProject}
                    renderAsset={renderAsset}
                />
            </div>
        </aside>
    )
}