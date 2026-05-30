export type ExternalVideoProvider =
    | {
          provider: 'youtube'
          id: string
      }
    | {
          provider: 'vimeo'
          id: string
      }

export type VideoMediaSourceKind = 'uploadedVideo' | 'videoUrl'
export type VideoMediaAssetUse = 'poster' | 'projectInfoThumbnail' | 'expandedProjectInfoThumbnail'
export type VideoMediaSanityPreset = 'video-poster' | `thumbnail-${number}`

export type VideoMediaAssetRequest<TSanityThumbnail> = {
    sourceKind: VideoMediaSourceKind
    sourceUrl: string
    assetUse: VideoMediaAssetUse
    sanityThumbnail?: TSanityThumbnail | null
    sanityThumbnailUrl: (
        thumbnail: TSanityThumbnail,
        preset: VideoMediaSanityPreset,
    ) => string | null | undefined
    providerPosterUrl?: (url: string) => string | null | undefined
    providerThumbnailUrl?: (url: string, preset: `thumbnail-${number}`) => string | null | undefined
}

export type VideoMediaProviderThumbnailRequest = {
    sourceUrl: string
    preset: `thumbnail-${number}`
    width: number
}

export type VideoMediaProviderPosterRequest = {
    sourceUrl: string
}

export function getVideoMediaSanityPreset(assetUse: VideoMediaAssetUse): VideoMediaSanityPreset {
    if (assetUse === 'poster') return 'video-poster'
    if (assetUse === 'expandedProjectInfoThumbnail') return 'thumbnail-400'

    return 'thumbnail-80'
}

function getVideoMediaProviderThumbnailWidth(assetUse: VideoMediaAssetUse): number {
    if (assetUse === 'expandedProjectInfoThumbnail') return 400

    return 80
}

export function getVideoMediaAsset<TSanityThumbnail>({
    sourceKind,
    sourceUrl,
    assetUse,
    sanityThumbnail,
    sanityThumbnailUrl,
    providerPosterUrl,
    providerThumbnailUrl,
}: VideoMediaAssetRequest<TSanityThumbnail>): string | undefined {
    const sanityPreset = getVideoMediaSanityPreset(assetUse)
    const sanityAssetUrl = sanityThumbnail
        ? sanityThumbnailUrl(sanityThumbnail, sanityPreset)
        : null

    if (sanityAssetUrl) return sanityAssetUrl

    if (sourceKind === 'videoUrl' && assetUse === 'poster') {
        return providerPosterUrl?.(sourceUrl) ?? undefined
    }

    if (sourceKind === 'videoUrl' && sanityPreset !== 'video-poster') {
        return providerThumbnailUrl?.(sourceUrl, sanityPreset) ?? undefined
    }

    return undefined
}

export function getVideoMediaProviderThumbnailRequest<TSanityThumbnail>({
    sourceKind,
    sourceUrl,
    assetUse,
    sanityThumbnail,
    sanityThumbnailUrl,
}: VideoMediaAssetRequest<TSanityThumbnail>): VideoMediaProviderThumbnailRequest | null {
    if (sourceKind !== 'videoUrl') return null

    const sanityPreset = getVideoMediaSanityPreset(assetUse)

    if (sanityPreset === 'video-poster') return null

    const sanityAssetUrl = sanityThumbnail
        ? sanityThumbnailUrl(sanityThumbnail, sanityPreset)
        : null

    if (sanityAssetUrl) return null

    return {
        sourceUrl,
        preset: sanityPreset,
        width: getVideoMediaProviderThumbnailWidth(assetUse),
    }
}

export function getVideoMediaProviderPosterRequest<TSanityThumbnail>({
    sourceKind,
    sourceUrl,
    sanityThumbnail,
    sanityThumbnailUrl,
}: Pick<
    VideoMediaAssetRequest<TSanityThumbnail>,
    'sourceKind' | 'sourceUrl' | 'sanityThumbnail' | 'sanityThumbnailUrl'
>): VideoMediaProviderPosterRequest | null {
    if (sourceKind !== 'videoUrl') return null

    const sanityAssetUrl = sanityThumbnail ? sanityThumbnailUrl(sanityThumbnail, 'video-poster') : null

    if (sanityAssetUrl) return null

    return {sourceUrl}
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

export function getExternalVideoSourceUrl(url: string): string | null {
    const video = getExternalVideoProvider(url)

    if (video?.provider === 'youtube') {
        return `https://www.youtube.com/watch?v=${video.id}`
    }

    if (video?.provider === 'vimeo') {
        return `https://vimeo.com/${video.id}`
    }

    return null
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

export function getYouTubePosterCandidates(url: string) {
    const video = getExternalVideoProvider(url)

    if (video?.provider !== 'youtube') return null

    return {
        primary: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
        fallback: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
    }
}

export type ExternalVideoFetchers = {
    head: (url: string) => Promise<{ok: boolean}>
    fetchJson: (url: string) => Promise<unknown>
}

export async function getExternalVideoPoster(
    url: string,
    fetchers: ExternalVideoFetchers,
): Promise<string | null> {
    const youtubePoster = getYouTubePosterCandidates(url)

    if (youtubePoster) {
        try {
            const response = await fetchers.head(youtubePoster.primary)

            return response.ok ? youtubePoster.primary : youtubePoster.fallback
        } catch {
            return youtubePoster.fallback
        }
    }

    const vimeoOEmbedUrl = getVimeoOEmbedUrl(url)

    if (vimeoOEmbedUrl) {
        try {
            const data = await fetchers.fetchJson(vimeoOEmbedUrl)
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
