import type {SanityAsset} from '@/types'

export function getVideoAssetSource(asset: SanityAsset): string {
    return asset.value.url ?? asset.value.fileUrl ?? ''
}

export type ExternalVideoProvider =
    | {
          provider: 'youtube'
          id: string
      }
    | {
          provider: 'vimeo'
          id: string
      }

export function getExternalVideoProvider(url: string): ExternalVideoProvider | null {
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ]

    for (const pattern of youtubePatterns) {
        const match = url.match(pattern)

        if (match) return {provider: 'youtube', id: match[1]}
    }

    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)

    return vimeoMatch ? {provider: 'vimeo', id: vimeoMatch[1]} : null
}

export function getExternalVideoThumbnailUrl(url: string): string | null {
    const video = getExternalVideoProvider(url)

    if (video?.provider === 'youtube') {
        return `https://img.youtube.com/vi/${video.id}/default.jpg`
    }

    return null
}

export type ExternalVideoMediaPresentationInput = {
    url: string
    sanityPosterUrl?: string | null
    sanityThumbnailUrl?: string | null
    providerPosterUrl?: (url: string) => string | null | undefined
    providerThumbnailUrl?: (url: string) => string | null | undefined
}

export function getExternalVideoMediaPresentation({
    url,
    sanityPosterUrl,
    sanityThumbnailUrl,
    providerPosterUrl,
    providerThumbnailUrl,
}: ExternalVideoMediaPresentationInput) {
    return {
        poster: sanityPosterUrl ?? providerPosterUrl?.(url) ?? undefined,
        thumbnail: sanityThumbnailUrl ?? providerThumbnailUrl?.(url) ?? undefined,
    }
}

export type ExternalVideoThumbnailResolverOptions = {
    fetchJson: (url: string) => Promise<unknown>
    vimeoWidth: number
}

export function createExternalVideoThumbnailResolver({
    fetchJson,
    vimeoWidth,
}: ExternalVideoThumbnailResolverOptions) {
    const vimeoThumbnailCache = new Map<string, string | null>()

    return async function resolveExternalVideoThumbnail(url: string): Promise<string | null> {
        const providerThumbnailUrl = getExternalVideoThumbnailUrl(url)

        if (providerThumbnailUrl) return providerThumbnailUrl

        const vimeoOEmbedUrl = getVimeoOEmbedUrl(url)

        if (!vimeoOEmbedUrl) return null
        if (vimeoThumbnailCache.has(url)) return vimeoThumbnailCache.get(url) ?? null

        try {
            const data = await fetchJson(vimeoOEmbedUrl)
            const thumbnailUrl =
                data && typeof data === 'object' && 'thumbnail_url' in data
                    ? data.thumbnail_url
                    : null
            const normalizedThumbnailUrl =
                typeof thumbnailUrl === 'string'
                    ? normalizeVimeoThumbnailUrl(thumbnailUrl, vimeoWidth)
                    : null

            vimeoThumbnailCache.set(url, normalizedThumbnailUrl)

            return normalizedThumbnailUrl
        } catch {
            vimeoThumbnailCache.set(url, null)

            return null
        }
    }
}

export function getYouTubePosterCandidates(url: string) {
    const video = getExternalVideoProvider(url)

    if (video?.provider !== 'youtube') return null

    return {
        primary: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
        fallback: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
    }
}

export type ExternalVideoPosterAdapters = {
    head: (url: string) => Promise<{ok: boolean}>
    fetchJson: (url: string) => Promise<unknown>
}

export async function getExternalVideoPoster(
    url: string,
    adapters: ExternalVideoPosterAdapters,
): Promise<string | null> {
    const youtubePoster = getYouTubePosterCandidates(url)

    if (youtubePoster) {
        try {
            const response = await adapters.head(youtubePoster.primary)

            return response.ok ? youtubePoster.primary : youtubePoster.fallback
        } catch {
            return youtubePoster.fallback
        }
    }

    const vimeoOEmbedUrl = getVimeoOEmbedUrl(url)

    if (vimeoOEmbedUrl) {
        try {
            const data = await adapters.fetchJson(vimeoOEmbedUrl)
            const thumbnailUrl =
                data && typeof data === 'object' && 'thumbnail_url' in data
                    ? data.thumbnail_url
                    : null

            return typeof thumbnailUrl === 'string'
                ? normalizeVimeoThumbnailUrl(thumbnailUrl, 1280)
                : null
        } catch {
            return null
        }
    }

    return null
}

export function getVimeoOEmbedUrl(url: string): string | null {
    const video = getExternalVideoProvider(url)

    return video?.provider === 'vimeo'
        ? `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${video.id}`
        : null
}

export function normalizeVimeoThumbnailUrl(url: string, width: number): string {
    return url.replace(/_\d+x\d+/, `_${width}`)
}
