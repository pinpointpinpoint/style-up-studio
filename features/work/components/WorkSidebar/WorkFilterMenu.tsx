'use client'

import {Filter} from '@/types'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import {Dispatch, SetStateAction, useEffect, useState} from 'react'
import styles from './WorkFilterMenu.module.css'
import {createWorkFilterCatalog} from '@/features/work/lib/workFilterIndex'
import ArrowIcon from '@/features/site-shell/components/ArrowIcon/ArrowIcon'

const FEATURED_ACTIVE_IMAGE_SRC = '/featured.svg'

type WorkFilterMenuProps = {
    sidebarFilters: SidebarFiltersQueryResult | null
    filter: Filter
    setFilter: Dispatch<SetStateAction<Filter>>
}

export default function WorkFilterMenu({sidebarFilters, filter, setFilter}: WorkFilterMenuProps) {
    const filterCatalog = createWorkFilterCatalog(sidebarFilters)
    const {projectTypes, collaborators} = filterCatalog.filters

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (!['brand', 'personality'].includes(filter.type)) return

        setOpenGroups((current) => ({
            ...current,
            [filter.type]: current[filter.type] ?? true,
        }))
    }, [filter.type])

    return (
        <div className={styles.menu}>
            <div className={styles.heading}>INDEX</div>
            <div className={styles.scroller} data-sidebar-scroll-area>
                <div className={styles.projectTypeList}>
                    {projectTypes.map((type) => {
                        const isActive =
                            (filter.type === 'featured' && type.filter.type === 'featured') ||
                            (filter.type === 'all' && type.filter.type === 'all') ||
                            ('id' in filter &&
                                'id' in type.filter &&
                                filter.type === type.filter.type &&
                                filter.id === type.filter.id)

                        return (
                            <button
                                key={type.id}
                                className={styles.projectTypeButton}
                                type="button"
                                onClick={() =>
                                    setFilter((prev) =>
                                        filterCatalog.toggleFilter(prev, type.filter),
                                    )
                                }
                            >
                                <span className={styles.filterLabel}>
                                    {filter.type === 'featured' &&
                                    type.filter.type === 'featured' &&
                                    FEATURED_ACTIVE_IMAGE_SRC ? (
                                        <img
                                            src={FEATURED_ACTIVE_IMAGE_SRC}
                                            alt=""
                                            className={styles.featuredIcon}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        isActive && <span className={styles.activeMarker}></span>
                                    )}
                                    {type.title}
                                </span>
                                <span className={styles.filterCount}>({type.count})</span>
                            </button>
                        )
                    })}
                </div>
                <div className={styles.collaboratorSection} data-sidebar-scroll-area>
                    {collaborators.map((c) => {
                        const isActiveGroup = filter.type === c.filterType
                        const isOpen = openGroups[c.filterType] ?? isActiveGroup
                        const activeItem =
                            'id' in filter && isActiveGroup
                                ? c.options.find((item) => item.id === filter.id)
                                : undefined

                        return (
                            <details
                                key={c.title}
                                className={styles.collaboratorGroup}
                                open={isOpen}
                                onToggle={(event) => {
                                    const isGroupOpen = event.currentTarget.open

                                    setOpenGroups((current) => ({
                                        ...current,
                                        [c.filterType]: isGroupOpen,
                                    }))
                                }}
                            >
                                <summary
                                    className={styles.collaboratorSummary}
                                >
                                    <span className={styles.filterLabel}>
                                        {isActiveGroup && !isOpen && (
                                            <span className={styles.collapsedMarker}></span>
                                        )}
                                        {c.title}
                                        {isActiveGroup && !isOpen && activeItem?.title && (
                                            <span>({activeItem.title})</span>
                                        )}
                                    </span>
                                    <span className={styles.collaboratorArrow} aria-hidden="true">
                                        <ArrowIcon direction={isOpen ? 'up' : 'down'} />
                                    </span>
                                </summary>

                                <div className={styles.collaboratorOptions}>
                                    {c.options.map((i) => (
                                        <button
                                            className={styles.collaboratorOption}
                                            key={i.id}
                                            type="button"
                                            onClick={() =>
                                                setFilter((prev) =>
                                                    filterCatalog.toggleFilter(prev, i.filter),
                                                )
                                            }
                                        >
                                            <span className={styles.filterLabel}>
                                                {'id' in filter &&
                                                    filter.type === c.filterType &&
                                                    filter.id === i.id && (
                                                        <span
                                                            className={
                                                                styles.collaboratorActiveMarker
                                                            }
                                                        ></span>
                                                    )}
                                                {i.title}
                                            </span>
                                            <span className={styles.filterCount}>({i.count})</span>
                                        </button>
                                    ))}
                                </div>
                            </details>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
