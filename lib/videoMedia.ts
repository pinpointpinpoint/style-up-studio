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

export function getYouTubePosterCandidates(url: string) {
    const video = getExternalVideoProvider(url)

    if (video?.provider !== 'youtube') return null

    return {
        primary: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
        fallback: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
    }
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
