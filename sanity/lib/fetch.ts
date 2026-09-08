import 'server-only'

import {client} from './client'

type SanityFetchArgs = {
    query: string
    params?: Record<string, unknown>
    stega?: boolean
}

export async function sanityFetch<T>({
    query,
    params = {},
    stega = false
}: SanityFetchArgs): Promise<{data: T}> {
    const data = await client.fetch<T>(query, params, {
        perspective: 'published',
        useCdn: false,
        stega,
        cache: 'no-store'
    })

    return {data}
}