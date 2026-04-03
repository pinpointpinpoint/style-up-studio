import { Category, Project } from '@/types';
import FilterMenu from './FilterMenu';
import ProjectDetails from './ProjectDetails';
import { Filter } from '@/types';
import styles from "./Sidebar.module.css";
import { useEffect, useRef, useState } from 'react';

type SidebarProps = {
    displayedProject: Project | null
    allCategories: Category[]
    filter: Filter
    hoveredCategoryId?: string
    setHoveredCategory: (id: string) => void
    setFilter: (filter: Filter) => void
    openModal: (data: any) => void
    renderAsset: (asset: any) => React.ReactNode
}

export function Sidebar({
    displayedProject,
    allCategories,
    filter,
    hoveredCategoryId,
    setHoveredCategory,
    setFilter,
    openModal,
    renderAsset,
}: SidebarProps) {

    return (
        <aside className={styles.container}>
            <div className={styles.section}>
                <div className={styles.title}>FILTER</div>
                <FilterMenu
                    categories={allCategories}
                    filter={filter}
                    hoveredCategoryId={hoveredCategoryId}
                    setHoveredCategory={setHoveredCategory}
                    setFilter={setFilter}
                />
            </div>

            {/* {displayedProject && ( */}
                {/* <div className={styles.bottomWrapper}> */}

            <div className={styles.section}>
                <div className={styles.title}>PROJECT INFORMATION</div>
                <ProjectDetails
                    displayedProject={displayedProject}
                    onOpenModal={openModal}
                    renderAsset={renderAsset}
                />
            </div>

                {/* </div> */}

            {/* )} */}
        </aside>
    )
}