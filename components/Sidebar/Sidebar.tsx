'use client';

import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
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
            <motion.div
                className={`${styles.section} ${isProjectDetail ? styles.projectDetailSection : ''}`}
                initial={isProjectDetail ? { y: '100%' } : false}
                animate={{ y: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className={`${styles.title} ${isProjectDetail ? styles.projectDetailTitle : ''}`}>
                    <span>PROJECT INFORMATION</span>
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
            </motion.div>
        </aside>
    )
}
