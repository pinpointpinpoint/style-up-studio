'use client';

import { Dispatch, SetStateAction } from 'react';
import { Project } from '@/types';
import FilterMenu from './FilterMenu';
import ProjectDetails from './ProjectDetails';
import { Filter } from '@/types';
import styles from "./Sidebar.module.css";

type SidebarProps = {
    displayedProject: Project | null
    sidebarFilters: any | null
    filter: Filter
    setFilter: Dispatch<SetStateAction<Filter>>
    renderAsset: (asset: any) => React.ReactNode
    isProjectDetail?: boolean
    onCloseProjectDetail?: () => void
}

export function Sidebar({
    displayedProject,
    sidebarFilters,
    filter,
    setFilter,
    renderAsset,
    isProjectDetail = false,
    onCloseProjectDetail,
}: SidebarProps) {

    return (
        <aside className={`${styles.container} ${isProjectDetail ? styles.projectDetailContainer : ''}`}>
            {!isProjectDetail && (
                <div className={styles.section}>
                    <FilterMenu
                        sidebarFilters={sidebarFilters}
                        filter={filter}
                        setFilter={setFilter}
                    />
                </div>
            )}
            <div
                className={`${styles.section} ${isProjectDetail ? styles.projectDetailSection : ''}`}
            >
                <div className={`${styles.title} ${isProjectDetail ? styles.projectDetailTitle : ''}`}>
                    <span>INFO</span>
                    {isProjectDetail && onCloseProjectDetail && (
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={onCloseProjectDetail}
                        >
                            [CLOSE]
                        </button>
                    )}
                </div>
                <ProjectDetails
                    displayedProject={displayedProject}
                    renderAsset={renderAsset}
                    expandDetails={isProjectDetail}
                />
            </div>
        </aside>
    )
}
