'use client'

import type {SidebarFiltersQueryResult} from '@/sanity.types'
import ArrowIcon from '@/features/site-shell/components/ArrowIcon/ArrowIcon'
import WorkIndexMenu from '../WorkSidebar/WorkIndexMenu'
import {Filter} from '@/types'
import styles from './MobileMenu.module.css'

type MobileMenuProps = {
    sidebarFilters: SidebarFiltersQueryResult | null
    filter: Filter
}

export function MobileMenu({sidebarFilters, filter}: MobileMenuProps) {
    return (
        <details className={styles.details}>
            <summary className={styles.summary}>
                <span>[INDEX]</span>
                <span className={styles.arrow} aria-hidden="true">
                    <ArrowIcon direction="down" />
                </span>
            </summary>
            <div className={`${styles.scrollContent} scrollbar`}>
                <WorkIndexMenu sidebarFilters={sidebarFilters} filter={filter} variant="mobile" />
            </div>
        </details>
    )
}
