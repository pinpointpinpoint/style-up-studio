import 'server-only'

import {client} from './client'

const DEFAULT_REVALIDATE_SECONDS = 60
export const SANITY_PROJECTS_TAG = 'sanity:projects'

type SanityFetchArgs = {
    query: string
    params?: Record<string, unknown>
    stega?: boolean
    revalidate?: number | false
    tags?: string[]
}

export async function sanityFetch<T>({
    query,
    params = {},
    stega = false,
    revalidate = DEFAULT_REVALIDATE_SECONDS,
    tags,
}: SanityFetchArgs): Promise<{data: T}> {
    const data = await client.fetch<T>(query, params, {
        perspective: 'published',
        useCdn: true,
        stega,
        next: {
            revalidate,
            tags,
        },
    })

    return {data}
}
