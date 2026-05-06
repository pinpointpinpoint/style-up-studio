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

// is there a way to use cdn and cache for users but bypass for admins? maybe with a cookie that admin users have set on their browsers, and then we can check for that cookie in the sanityFetch function and decide whether to use cdn or not?