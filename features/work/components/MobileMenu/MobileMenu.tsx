'use client'

import type {SidebarFiltersQueryResult} from '@/sanity.types'
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
            <summary className={styles.summary}>[INDEX]</summary>
            <WorkIndexMenu sidebarFilters={sidebarFilters} filter={filter} variant="mobile" />
        </details>
    )
}
