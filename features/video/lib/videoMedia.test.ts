import {describe, expect, it} from 'vitest'
import {
    createExternalVideoThumbnailResolver,
    getExternalVideoMediaPresentation,
    getExternalVideoProvider,
    getExternalVideoThumbnailUrl,
    getExternalVideoPoster,
    getVideoAssetSource,
    getVimeoOEmbedUrl,
    getYouTubePosterCandidates,
    normalizeVimeoThumbnailUrl,
} from './videoMedia'

describe('video media provider helpers', () => {
    it('resolves the playable source for Sanity video assets', () => {
        expect(getVideoAssetSource({value: {url: 'https://example.com/embed'}})).toBe(
            'https://example.com/embed',
        )
        expect(getVideoAssetSource({value: {fileUrl: 'https://cdn.example.com/video.mp4'}})).toBe(
            'https://cdn.example.com/video.mp4',
        )
        expect(
            getVideoAssetSource({
                value: {
                    url: 'https://example.com/embed',
                    fileUrl: 'https://cdn.example.com/video.mp4',
                },
            }),
        ).toBe('https://example.com/embed')
        expect(getVideoAssetSource({value: {}})).toBe('')
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
        expect(normalizeVimeoThumbnailUrl('https://i.vimeocdn.com/video/123_295x166.jpg', 1280)).toBe(
            'https://i.vimeocdn.com/video/123_1280.jpg',
        )
    })

    it('resolves external video posters through provider adapters without real network access', async () => {
        const youtubePoster = await getExternalVideoPoster('https://youtu.be/dQw4w9WgXcQ', {
            head: async (url) => ({ok: url.includes('maxresdefault')}),
            fetchJson: async () => {
                throw new Error('Vimeo lookup should not be used for YouTube')
            },
        })

        expect(youtubePoster).toBe(
            'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        )

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

    it('resolves external video thumbnails with Vimeo lookup cached behind the provider adapter', async () => {
        const requestedUrls: string[] = []
        const resolveThumbnail = createExternalVideoThumbnailResolver({
            vimeoWidth: 295,
            fetchJson: async (url) => {
                requestedUrls.push(url)

                return {
                    thumbnail_url: 'https://i.vimeocdn.com/video/123_640x360.jpg',
                }
            },
        })

        await expect(resolveThumbnail('https://vimeo.com/123456789')).resolves.toBe(
            'https://i.vimeocdn.com/video/123_295.jpg',
        )
        await expect(resolveThumbnail('https://vimeo.com/123456789')).resolves.toBe(
            'https://i.vimeocdn.com/video/123_295.jpg',
        )
        expect(requestedUrls).toEqual([
            'https://vimeo.com/api/oembed.json?url=https://vimeo.com/123456789',
        ])

        await expect(resolveThumbnail('https://youtu.be/dQw4w9WgXcQ')).resolves.toBe(
            'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg',
        )
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
