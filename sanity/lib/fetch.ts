import 'server-only'

import {client} from './client'

type SanityFetchArgs = {
    query: string
    params?: Record<string, unknown>
    stega?: boolean
    tags?: string[]
}

export async function sanityFetch<T>({
    query,
    params = {},
    stega = false,
    tags,
}: SanityFetchArgs): Promise<{data: T}> {
    const data = await client.fetch<T>(query, params, {
        perspective: 'published',
        useCdn: false,
        stega,
        next: {
            tags,
        },
    })

    return {data}
}