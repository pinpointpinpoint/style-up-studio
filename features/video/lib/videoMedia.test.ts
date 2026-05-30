import {describe, expect, it} from 'vitest'
import {
    getExternalVideoMediaPresentation,
    getExternalVideoProvider,
    getExternalVideoThumbnailUrl,
    getExternalVideoPoster,
    getVideoMediaAsset,
    getVideoMediaProviderPosterRequest,
    getVideoMediaProviderThumbnailRequest,
    getVimeoOEmbedUrl,
    getYouTubePosterCandidates,
    normalizeVimeoThumbnailUrl,
} from './videoMedia'

describe('video media provider helpers', () => {
    it('resolves uploaded video assets from the Sanity thumbnail only', () => {
        const providerPosterUrls: string[] = []
        const providerThumbnailUrls: string[] = []

        expect(
            getVideoMediaAsset({
                sourceKind: 'uploadedVideo',
                sourceUrl: 'https://cdn.example.com/video.mp4',
                assetUse: 'poster',
                sanityThumbnail: 'sanity-thumbnail',
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
                providerPosterUrl: (url) => {
                    providerPosterUrls.push(url)
                    return `provider-poster:${url}`
                },
                providerThumbnailUrl: (url) => {
                    providerThumbnailUrls.push(url)
                    return `provider-thumbnail:${url}`
                },
            }),
        ).toBe('sanity-thumbnail:video-poster')

        expect(providerPosterUrls).toEqual([])
        expect(providerThumbnailUrls).toEqual([])
    })

    it('resolves video URL posters from Sanity first, then provider fallback', () => {
        const sourceUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        const providerPosterUrls: string[] = []

        expect(
            getVideoMediaAsset({
                sourceKind: 'videoUrl',
                sourceUrl,
                assetUse: 'poster',
                sanityThumbnail: 'sanity-thumbnail',
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
                providerPosterUrl: (url) => {
                    providerPosterUrls.push(url)
                    return `provider-poster:${url}`
                },
            }),
        ).toBe('sanity-thumbnail:video-poster')
        expect(providerPosterUrls).toEqual([])

        expect(
            getVideoMediaAsset({
                sourceKind: 'videoUrl',
                sourceUrl,
                assetUse: 'poster',
                sanityThumbnail: null,
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
                providerPosterUrl: (url) => {
                    providerPosterUrls.push(url)
                    return `provider-poster:${url}`
                },
            }),
        ).toBe(`provider-poster:${sourceUrl}`)
        expect(providerPosterUrls).toEqual([sourceUrl])
    })

    it('resolves video URL thumbnails with project info presets before provider fallback', () => {
        const sourceUrl = 'https://vimeo.com/123456789'
        const providerThumbnailRequests: Array<{url: string; preset: `thumbnail-${number}`}> = []

        expect(
            getVideoMediaAsset({
                sourceKind: 'videoUrl',
                sourceUrl,
                assetUse: 'projectInfoThumbnail',
                sanityThumbnail: 'sanity-thumbnail',
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
                providerThumbnailUrl: (url, preset) => {
                    providerThumbnailRequests.push({url, preset})
                    return `provider-thumbnail:${url}:${preset}`
                },
            }),
        ).toBe('sanity-thumbnail:thumbnail-80')
        expect(providerThumbnailRequests).toEqual([])

        expect(
            getVideoMediaAsset({
                sourceKind: 'videoUrl',
                sourceUrl,
                assetUse: 'expandedProjectInfoThumbnail',
                sanityThumbnail: null,
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
                providerThumbnailUrl: (url, preset) => {
                    providerThumbnailRequests.push({url, preset})
                    return `provider-thumbnail:${url}:${preset}`
                },
            }),
        ).toBe(`provider-thumbnail:${sourceUrl}:thumbnail-400`)
        expect(providerThumbnailRequests).toEqual([{url: sourceUrl, preset: 'thumbnail-400'}])
    })

    it('returns no asset when a video URL has no Sanity asset or provider fallback', () => {
        expect(
            getVideoMediaAsset({
                sourceKind: 'videoUrl',
                sourceUrl: 'https://example.com/video',
                assetUse: 'projectInfoThumbnail',
                sanityThumbnail: null,
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
                providerThumbnailUrl: () => null,
            }),
        ).toBeUndefined()
    })

    it('requests provider thumbnails only for video URLs missing a Sanity thumbnail URL', () => {
        expect(
            getVideoMediaProviderThumbnailRequest({
                sourceKind: 'uploadedVideo',
                sourceUrl: 'https://cdn.example.com/video.mp4',
                assetUse: 'projectInfoThumbnail',
                sanityThumbnail: null,
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
            }),
        ).toBeNull()

        expect(
            getVideoMediaProviderThumbnailRequest({
                sourceKind: 'videoUrl',
                sourceUrl: 'https://vimeo.com/123456789',
                assetUse: 'projectInfoThumbnail',
                sanityThumbnail: 'sanity-thumbnail',
                sanityThumbnailUrl: () => null,
            }),
        ).toEqual({
            sourceUrl: 'https://vimeo.com/123456789',
            preset: 'thumbnail-80',
            width: 80,
        })

        expect(
            getVideoMediaProviderThumbnailRequest({
                sourceKind: 'videoUrl',
                sourceUrl: 'https://vimeo.com/123456789',
                assetUse: 'expandedProjectInfoThumbnail',
                sanityThumbnail: 'sanity-thumbnail',
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
            }),
        ).toBeNull()
    })

    it('requests provider posters only for video URLs missing a Sanity poster URL', () => {
        expect(
            getVideoMediaProviderPosterRequest({
                sourceKind: 'uploadedVideo',
                sourceUrl: 'https://cdn.example.com/video.mp4',
                sanityThumbnail: 'sanity-thumbnail',
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
            }),
        ).toBeNull()

        expect(
            getVideoMediaProviderPosterRequest({
                sourceKind: 'videoUrl',
                sourceUrl: 'https://youtu.be/dQw4w9WgXcQ',
                sanityThumbnail: null,
                sanityThumbnailUrl: () => null,
            }),
        ).toEqual({
            sourceUrl: 'https://youtu.be/dQw4w9WgXcQ',
        })

        expect(
            getVideoMediaProviderPosterRequest({
                sourceKind: 'videoUrl',
                sourceUrl: 'https://vimeo.com/123456789',
                sanityThumbnail: 'sanity-thumbnail',
                sanityThumbnailUrl: (thumbnail, preset) => `${thumbnail}:${preset}`,
            }),
        ).toBeNull()
    })

    it('parses YouTube and Vimeo URLs through one provider interface', () => {
        expect(getExternalVideoProvider('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
            provider: 'youtube',
            id: 'dQw4w9WgXcQ',
        })
        expect(getExternalVideoProvider('https://youtu.be/dQw4w9WgXcQ')).toEqual({
            provider: 'youtube',
            id: 'dQw4w9WgXcQ',
        })
        expect(getExternalVideoProvider('https://vimeo.com/123456789')).toEqual({
            provider: 'vimeo',
            id: '123456789',
        })
        expect(getExternalVideoProvider('https://example.com/video')).toBeNull()
    })

    it('builds provider thumbnail and poster URLs from parsed providers', () => {
        expect(getExternalVideoThumbnailUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
            'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg',
        )
        expect(getYouTubePosterCandidates('https://youtu.be/dQw4w9WgXcQ')).toEqual({
            primary: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            fallback: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        })
        expect(getVimeoOEmbedUrl('https://vimeo.com/123456789')).toBe(
            'https://vimeo.com/api/oembed.json?url=https://vimeo.com/123456789',
        )
        expect(
            normalizeVimeoThumbnailUrl('https://i.vimeocdn.com/video/123_295x166.jpg', 1280),
        ).toBe('https://i.vimeocdn.com/video/123_1280.jpg')
    })

    it('resolves external video posters through provider adapters without real network access', async () => {
        const youtubePoster = await getExternalVideoPoster('https://youtu.be/dQw4w9WgXcQ', {
            head: async (url) => ({ok: url.includes('maxresdefault')}),
            fetchJson: async () => {
                throw new Error('Vimeo lookup should not be used for YouTube')
            },
        })

        expect(youtubePoster).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg')

        const vimeoPoster = await getExternalVideoPoster('https://vimeo.com/123456789', {
            head: async () => ({ok: false}),
            fetchJson: async () => ({
                thumbnail_url: 'https://i.vimeocdn.com/video/123_295x166.jpg',
            }),
        })

        expect(vimeoPoster).toBe('https://i.vimeocdn.com/video/123_1280.jpg')

        const unsupportedPoster = await getExternalVideoPoster('https://example.com/video', {
            head: async () => ({ok: false}),
            fetchJson: async () => ({thumbnail_url: null}),
        })

        expect(unsupportedPoster).toBeNull()
    })

    it('presents external video media with Sanity assets before provider fallbacks', () => {
        expect(
            getExternalVideoMediaPresentation({
                url: 'https://youtu.be/dQw4w9WgXcQ',
                sanityPosterUrl: 'sanity:poster',
                sanityThumbnailUrl: 'sanity:thumbnail',
                providerPosterUrl: () => 'provider:poster',
                providerThumbnailUrl: () => 'provider:thumbnail',
            }),
        ).toEqual({
            poster: 'sanity:poster',
            thumbnail: 'sanity:thumbnail',
        })

        expect(
            getExternalVideoMediaPresentation({
                url: 'https://youtu.be/dQw4w9WgXcQ',
                sanityPosterUrl: undefined,
                sanityThumbnailUrl: null,
                providerPosterUrl: () => 'provider:poster',
                providerThumbnailUrl: () => 'provider:thumbnail',
            }),
        ).toEqual({
            poster: 'provider:poster',
            thumbnail: 'provider:thumbnail',
        })
    })

    it('presents external video media without fallback assets for unsupported provider results', () => {
        expect(
            getExternalVideoMediaPresentation({
                url: 'https://example.com/video',
                sanityPosterUrl: null,
                sanityThumbnailUrl: undefined,
                providerPosterUrl: () => null,
                providerThumbnailUrl: () => undefined,
            }),
        ).toEqual({
            poster: undefined,
            thumbnail: undefined,
        })
    })
})
