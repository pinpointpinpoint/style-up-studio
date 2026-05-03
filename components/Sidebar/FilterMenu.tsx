'use client'

import {Filter} from '@/types'
import {Dispatch, SetStateAction, useEffect, useState} from 'react'
import styles from './FilterMenu.module.css'
import {normalizeSidebarFilters} from '@/lib/normalizeSidebarFilters'
import ArrowIcon from '../ArrowIcon/ArrowIcon'

type CollaboratorFilterType = 'brand' | 'personality'
const FEATURED_ACTIVE_IMAGE_SRC = '/featured.svg'

type FilterMenuProps = {
    sidebarFilters: any | null
    filter: Filter
    setFilter: Dispatch<SetStateAction<Filter>>
}

export default function FilterMenu({sidebarFilters, filter, setFilter}: FilterMenuProps) {
    const {projectTypes, collaborators} = normalizeSidebarFilters(sidebarFilters)

    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

    const handleProjectTypeClick = (projectTypeId: string) => {
        if (projectTypeId === 'featured') {
            setFilter({type: 'featured'})
            return
        }

        if (projectTypeId === 'all') {
            setFilter({type: 'all'})
            return
        }

        setFilter((prev) =>
            prev.type === 'projectType' && prev.id === projectTypeId
                ? {type: 'featured'}
                : {type: 'projectType', id: projectTypeId},
        )
    }

    const handleCollaboratorClick = (
        filterType: CollaboratorFilterType,
        collaboratorId: string,
    ) => {
        setFilter((prev) =>
            prev.type === filterType && prev.id === collaboratorId
                ? {type: 'featured'}
                : {type: filterType, id: collaboratorId},
        )
    }

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
                        if (type.referenceCount <= 0 || !type.slug) return null

                        const isActive =
                            (filter.type === 'featured' && type._id === 'featured') ||
                            (filter.type === 'all' && type._id === 'all') ||
                            (filter.type === 'projectType' && filter.id === type._id)

                        return (
                            <button
                                key={type._id}
                                className={styles.projectTypeButton}
                                type="button"
                                onMouseEnter={() => {
                                    setHoveredId(type._id)
                                }}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => handleProjectTypeClick(type._id)}
                            >
                                <span className={styles.filterLabel}>
                                    {filter.type === 'featured' &&
                                    type._id === 'featured' &&
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
                                <span className={styles.filterCount}>({type.referenceCount})</span>
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
                                ? c.items.find((item) => item._id === filter.id)
                                : undefined

                        return (
                            <details
                                key={c.label}
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
                                    onMouseEnter={() => {
                                        setHoveredId(c._id)
                                    }}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    <span className={styles.filterLabel}>
                                        {isActiveGroup && !isOpen && (
                                            <span className={styles.collapsedMarker}></span>
                                        )}
                                        {c.label}
                                        {isActiveGroup && !isOpen && activeItem?.title && (
                                            <span>
                                                ({activeItem.title})
                                            </span>
                                        )}
                                    </span>
                                    <span className={styles.collaboratorArrow} aria-hidden="true">
                                        <ArrowIcon direction={isOpen ? 'up' : 'down'} />
                                    </span>
                                </summary>

                                <div className={styles.collaboratorOptions}>
                                    {c.items
                                        .filter((i) => i.slug)
                                        .map((i) => (
                                            <button
                                                className={styles.collaboratorOption}
                                                key={i._id}
                                                type="button"
                                                onMouseEnter={() => {
                                                    setHoveredId(i._id)
                                                }}
                                                onMouseLeave={() => setHoveredId(null)}
                                                onClick={() =>
                                                    handleCollaboratorClick(
                                                        c.filterType as CollaboratorFilterType,
                                                        i._id,
                                                    )
                                                }
                                            >
                                                <span className={styles.filterLabel}>
                                                    {'id' in filter &&
                                                        filter.type === c.filterType &&
                                                        filter.id === i._id && (
                                                            <span
                                                                className={styles.collaboratorActiveMarker}
                                                            ></span>
                                                        )}
                                                    {i.title}
                                                </span>
                                                <span className={styles.filterCount}>
                                                    ({i.referenceCount})
                                                </span>
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
