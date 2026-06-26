'use server'

import {
    createProjectService,
    type ProjectServiceFetch,
} from '@/features/work/services/projectService'
import type {AllStyleUpsQueryResult} from '@/sanity.types'
import {SANITY_PUBLIC_TAG, SANITY_STYLE_UPS_TAG} from '@/sanity/lib/cacheTags'
import {sanityFetch} from '@/sanity/lib/fetch'
import {allStyleUpsQuery} from '@/sanity/lib/queries'

const projectService = createProjectService({
    sanityFetch: ((args) => sanityFetch(args)) as ProjectServiceFetch,
})

export const getProjects = projectService.getProjects
export const getProjectBySlug = projectService.getProjectBySlug

export async function getStyleUps() {
    const {data} = await sanityFetch<AllStyleUpsQueryResult>({
        query: allStyleUpsQuery,
        stega: false,
        tags: [SANITY_PUBLIC_TAG, SANITY_STYLE_UPS_TAG],
    })

    return data
}
