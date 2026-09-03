'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import type {MouseEvent} from 'react'
import type {Filter} from '@/types'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import {useState} from 'react'
import styles from './WorkIndexMenu.module.css'
import {createWorkIndexCatalog} from '@/features/work/lib/workIndex'
import ArrowIcon from '@/features/site-shell/components/ArrowIcon/ArrowIcon'

const FEATURED_ACTIVE_IMAGE_SRC = '/featured.svg'

type WorkIndexMenuProps = {
    sidebarFilters: SidebarFiltersQueryResult | null
    filter: Filter
    variant?: 'sidebar' | 'mobile'
}

type OptimisticFilter = {
    filter: Filter
    fromPathname: string
    targetPathname: string
}

function isModifiedLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    return (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
    )
}

function getHrefPathname(href: string) {
    return href.split('?')[0]?.split('#')[0] || '/'
}

export default function WorkIndexMenu({sidebarFilters, filter, variant = 'sidebar'}: WorkIndexMenuProps) {
    const showHeading = variant === 'sidebar'
    const pathname = usePathname()
    const indexCatalog = createWorkIndexCatalog(sidebarFilters)
    const {projectTypes, collaborators} = indexCatalog.filters

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
    const [optimisticFilter, setOptimisticFilter] = useState<OptimisticFilter | null>(null)
    const activeFilter =
        optimisticFilter &&
        (optimisticFilter.fromPathname === pathname || optimisticFilter.targetPathname === pathname)
            ? optimisticFilter.filter
            : filter

    const getNextFilter = (nextFilter: Filter) =>
        indexCatalog.toggleFilter(activeFilter, nextFilter)
    const handleIndexClick =
        (nextFilter: Filter, href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
            if (isModifiedLinkClick(event)) return

            setOptimisticFilter({
                filter: nextFilter,
                fromPathname: pathname,
                targetPathname: getHrefPathname(href),
            })
        }

    return (
        <div className={styles.menu} data-variant={variant}>
            {showHeading && <div className={styles.heading}>INDEX</div>}
            <div className={`${styles.scroller} scrollbar`} data-sidebar-scroll-area>
                <div className={styles.projectTypeList}>
                    {projectTypes.map((type) => {
                        const nextFilter = getNextFilter(type.filter)
                        const href = indexCatalog.getHref(nextFilter)
                        const isActive =
                            (activeFilter.type === 'featured' && type.filter.type === 'featured') ||
                            (activeFilter.type === 'all' && type.filter.type === 'all') ||
                            ('id' in activeFilter &&
                                'id' in type.filter &&
                                activeFilter.type === type.filter.type &&
                                activeFilter.id === type.filter.id)

                        return (
                            <Link
                                key={type.id}
                                className={styles.projectTypeButton}
                                href={href}
                                onClick={handleIndexClick(nextFilter, href)}
                            >
                                <span className={styles.filterLabel}>
                                    {activeFilter.type === 'featured' &&
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
                        const isActiveGroup = activeFilter.type === c.filterType
                        const isOpen = openGroups[c.filterType] ?? false
                        const activeItem =
                            'id' in activeFilter && isActiveGroup
                                ? c.options.find((item) => item.id === activeFilter.id)
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
                                    {c.options.map((i) => {
                                        const nextFilter = getNextFilter(i.filter)
                                        const href = indexCatalog.getHref(nextFilter)

                                        return (
                                            <Link
                                                className={styles.collaboratorOption}
                                                key={i.id}
                                                href={href}
                                                onClick={handleIndexClick(nextFilter, href)}
                                            >
                                                <span className={styles.filterLabel}>
                                                    {'id' in activeFilter &&
                                                        activeFilter.type === c.filterType &&
                                                        activeFilter.id === i.id && (
                                                            <span
                                                                className={
                                                                    styles.collaboratorActiveMarker
                                                                }
                                                            ></span>
                                                        )}
                                                    {i.title}
                                                </span>
                                                <span className={styles.filterCount}>
                                                    ({i.count})
                                                </span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </details>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
