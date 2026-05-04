import {describe, expect, it} from 'vitest'
import {
    getExternalVideoProvider,
    getExternalVideoThumbnailUrl,
    getVimeoOEmbedUrl,
    getYouTubePosterCandidates,
    normalizeVimeoThumbnailUrl,
} from './videoMedia'

describe('video media provider helpers', () => {
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
})
