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
}

export function Sidebar({
    displayedProject,
    sidebarFilters,
    filter,
    setFilter,
}: SidebarProps) {

    return (
        <aside className={styles.container}>
            <div className={styles.section}>
                <FilterMenu
                    sidebarFilters={sidebarFilters}
                    filter={filter}
                    setFilter={setFilter}
                />
            </div>
            <div
                className={styles.section}
            >
                <div className={styles.title}>
                    <span>INFO</span>
                </div>
                <ProjectDetails
                    displayedProject={displayedProject}
                />
            </div>
        </aside>
    )
}
