import 'server-only'

import type {Metadata} from 'next'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import {SANITY_PROJECTS_TAG, SANITY_PUBLIC_TAG, SANITY_SITE_SHELL_TAG} from '@/sanity/lib/cacheTags'
import {sanityFetch} from '@/sanity/lib/fetch'
import {sidebarFiltersQuery} from '@/sanity/lib/queries'
import {createWorkIndexCatalog} from '@/features/work/lib/workIndex'

export async function getWorkIndexRouteMetadata({
    pathname,
    canonical,
}: {
    pathname: string
    canonical: string
}): Promise<Metadata> {
    const {data: sidebarFilters} = await sanityFetch<SidebarFiltersQueryResult>({
        query: sidebarFiltersQuery,
        stega: false,
        tags: [SANITY_PUBLIC_TAG, SANITY_SITE_SHELL_TAG, SANITY_PROJECTS_TAG],
    })
    const indexCatalog = createWorkIndexCatalog(sidebarFilters)
    const filter = indexCatalog.parsePath(pathname)

    return {
        title: indexCatalog.getTitle(filter) ?? 'Work',
        alternates: {
            canonical,
        },
    }
}
