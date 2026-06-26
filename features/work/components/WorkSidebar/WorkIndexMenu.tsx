'use client'

import Link from 'next/link'
import {Filter} from '@/types'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import {useState} from 'react'
import styles from './WorkIndexMenu.module.css'
import {createWorkIndexCatalog} from '@/features/work/lib/workIndex'
import ArrowIcon from '@/features/site-shell/components/ArrowIcon/ArrowIcon'

const FEATURED_ACTIVE_IMAGE_SRC = '/featured.svg'

type WorkIndexMenuProps = {
    sidebarFilters: SidebarFiltersQueryResult | null
    filter: Filter
}

export default function WorkIndexMenu({sidebarFilters, filter}: WorkIndexMenuProps) {
    const indexCatalog = createWorkIndexCatalog(sidebarFilters)
    const {projectTypes, collaborators} = indexCatalog.filters

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

    const getNextFilter = (nextFilter: Filter) => indexCatalog.toggleFilter(filter, nextFilter)

    return (
        <div className={styles.menu}>
            <div className={styles.heading}>INDEX</div>
            <div className={`${styles.scroller} scrollbar`} data-sidebar-scroll-area>
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
                            <Link
                                key={type.id}
                                className={styles.projectTypeButton}
                                href={indexCatalog.getHref(getNextFilter(type.filter))}
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
                            </Link>
                        )
                    })}
                </div>
                <div className={`${styles.collaboratorSection} scrollbar`} data-sidebar-scroll-area>
                    {collaborators.map((c) => {
                        const isActiveGroup = filter.type === c.filterType
                        const isOpen = openGroups[c.filterType] ?? false
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
                                <summary className={styles.collaboratorSummary}>
                                    <span className={styles.filterLabel}>
                                        {isActiveGroup && !isOpen && (
                                            <span className={styles.activeMarker}></span>
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
                                        <Link
                                            className={styles.collaboratorOption}
                                            key={i.id}
                                            href={indexCatalog.getHref(getNextFilter(i.filter))}
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
                                        </Link>
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
