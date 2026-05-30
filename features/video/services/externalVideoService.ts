import {
    getExternalVideoProvider,
    getExternalVideoPoster as getProviderPoster,
    getVimeoOEmbedUrl,
    normalizeVimeoThumbnailUrl,
    type ExternalVideoFetchers,
} from '../lib/videoMedia'

const VIMEO_THUMBNAIL_WIDTH = 295

export type ExternalVideoThumbnailOptions = {
    width?: number
}

const browserExternalVideoFetchers: ExternalVideoFetchers = {
    head: async (url) => fetch(url, {method: 'HEAD'}),
    fetchJson: async (url) => {
        const response = await fetch(url)

        if (!response.ok) return null

        return response.json()
    },
}

const vimeoThumbnailCaches = new WeakMap<ExternalVideoFetchers, Map<string, string | null>>()

function getVimeoThumbnailCache(fetchers: ExternalVideoFetchers) {
    const existingCache = vimeoThumbnailCaches.get(fetchers)

    if (existingCache) return existingCache

    const cache = new Map<string, string | null>()
    vimeoThumbnailCaches.set(fetchers, cache)

    return cache
}

export function getExternalVideoPoster(
    url: string,
    fetchers: ExternalVideoFetchers = browserExternalVideoFetchers,
): Promise<string | null> {
    return getProviderPoster(url, fetchers)
}

export async function getExternalVideoThumbnail(
    url: string,
    options: ExternalVideoThumbnailOptions = {},
    fetchers: ExternalVideoFetchers = browserExternalVideoFetchers,
): Promise<string | null> {
    const provider = getExternalVideoProvider(url)
    const width = options.width ?? VIMEO_THUMBNAIL_WIDTH

    if (provider?.provider === 'youtube') {
        return `https://img.youtube.com/vi/${provider.id}/default.jpg`
    }

    const vimeoOEmbedUrl = getVimeoOEmbedUrl(url)

    if (!vimeoOEmbedUrl) return null

    const cacheKey = `${url}:${width}`
    const vimeoThumbnailCache = getVimeoThumbnailCache(fetchers)

    if (vimeoThumbnailCache.has(cacheKey)) {
        return vimeoThumbnailCache.get(cacheKey) ?? null
    }

    try {
        const data = await fetchers.fetchJson(vimeoOEmbedUrl)
        const thumbnailUrl =
            data && typeof data === 'object' && 'thumbnail_url' in data ? data.thumbnail_url : null
        const normalizedThumbnailUrl =
            typeof thumbnailUrl === 'string'
                ? normalizeVimeoThumbnailUrl(thumbnailUrl, width)
                : null

        vimeoThumbnailCache.set(cacheKey, normalizedThumbnailUrl)

        return normalizedThumbnailUrl
    } catch {
        vimeoThumbnailCache.set(cacheKey, null)

        return null
    }
}
