'use server'

import {
    createProjectService,
    type ProjectServiceFetch,
} from '@/features/work/services/projectService'
import type {AllStyleUpsQueryResult} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/fetch'
import {allStyleUpsQuery} from '@/sanity/lib/queries'
import {STYLE_UPS_PAGE_SIZE} from '@/features/style-ups/lib/constants'

const projectService = createProjectService({
    sanityFetch: ((args) => sanityFetch(args)) as ProjectServiceFetch,
})

export const getProjects = projectService.getProjects
export const getProjectBySlug = projectService.getProjectBySlug

export async function getStyleUps(input: {
    cursor?: {id: string; createdAt: string} | null
    limit?: number
} = {}) {
    const {data} = await sanityFetch<AllStyleUpsQueryResult>({
        query: allStyleUpsQuery,
        stega: false,
        params: {
            cursorDate: input.cursor?.createdAt ?? null,
            cursorId: input.cursor?.id ?? '',
            limit: input.limit ?? STYLE_UPS_PAGE_SIZE,
        },
    })

    return data
}
