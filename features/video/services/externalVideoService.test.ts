import {describe, expect, it} from 'vitest'
import {getExternalVideoPoster, getExternalVideoThumbnail} from './externalVideoService'

describe('external video service', () => {
    it('returns the high-resolution YouTube poster when it exists', async () => {
        const checkedUrls: string[] = []
        const fetchers = {
            head: async (url: string) => {
                checkedUrls.push(url)

                return {ok: true}
            },
            fetchJson: async () => {
                throw new Error('Vimeo lookup should not be used for YouTube')
            },
        }

        await expect(
            getExternalVideoPoster('https://youtu.be/dQw4w9WgXcQ', fetchers),
        ).resolves.toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg')
        expect(checkedUrls).toEqual(['https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'])
    })

    it('falls back to the standard YouTube poster when the high-resolution poster is missing', async () => {
        const fetchers = {
            head: async () => ({ok: false}),
            fetchJson: async () => {
                throw new Error('Vimeo lookup should not be used for YouTube')
            },
        }

        await expect(
            getExternalVideoPoster('https://youtu.be/dQw4w9WgXcQ', fetchers),
        ).resolves.toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
    })

    it('returns a large Vimeo poster from oEmbed data', async () => {
        const requestedUrls: string[] = []
        const fetchers = {
            head: async () => {
                throw new Error('YouTube poster lookup should not be used for Vimeo')
            },
            fetchJson: async (url: string) => {
                requestedUrls.push(url)

                return {
                    thumbnail_url: 'https://i.vimeocdn.com/video/123_295x166.jpg',
                }
            },
        }

        await expect(getExternalVideoPoster('https://vimeo.com/123456789', fetchers)).resolves.toBe(
            'https://i.vimeocdn.com/video/123_1280.jpg',
        )
        expect(requestedUrls).toEqual([
            'https://vimeo.com/api/oembed.json?url=https://vimeo.com/123456789',
        ])
    })

    it('returns a direct YouTube thumbnail without provider lookup', async () => {
        const fetchers = {
            head: async () => {
                throw new Error('Poster HEAD lookup should not be used for thumbnails')
            },
            fetchJson: async () => {
                throw new Error('Vimeo lookup should not be used for YouTube thumbnails')
            },
        }

        await expect(
            getExternalVideoThumbnail('https://youtu.be/dQw4w9WgXcQ', undefined, fetchers),
        ).resolves.toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg')
    })

    it('returns cached Vimeo thumbnails at sidebar size', async () => {
        const requestedUrls: string[] = []
        const fetchers = {
            head: async () => {
                throw new Error('Poster HEAD lookup should not be used for thumbnails')
            },
            fetchJson: async (url: string) => {
                requestedUrls.push(url)

                return {
                    thumbnail_url: 'https://i.vimeocdn.com/video/123_640x360.jpg',
                }
            },
        }

        await expect(
            getExternalVideoThumbnail('https://vimeo.com/123456789', undefined, fetchers),
        ).resolves.toBe('https://i.vimeocdn.com/video/123_295.jpg')
        await expect(
            getExternalVideoThumbnail('https://vimeo.com/123456789', undefined, fetchers),
        ).resolves.toBe('https://i.vimeocdn.com/video/123_295.jpg')
        expect(requestedUrls).toEqual([
            'https://vimeo.com/api/oembed.json?url=https://vimeo.com/123456789',
        ])
    })

    it('returns Vimeo thumbnails at the requested display width', async () => {
        const fetchers = {
            head: async () => {
                throw new Error('Poster HEAD lookup should not be used for thumbnails')
            },
            fetchJson: async () => ({
                thumbnail_url: 'https://i.vimeocdn.com/video/123_640x360.jpg',
            }),
        }

        await expect(
            getExternalVideoThumbnail('https://vimeo.com/123456789', {width: 400}, fetchers),
        ).resolves.toBe('https://i.vimeocdn.com/video/123_400.jpg')
    })

    it('keeps YouTube thumbnails on the most reliable generated thumbnail for larger display widths', async () => {
        const fetchers = {
            head: async () => {
                throw new Error('Poster HEAD lookup should not be used for thumbnails')
            },
            fetchJson: async () => {
                throw new Error('Vimeo lookup should not be used for YouTube thumbnails')
            },
        }

        await expect(
            getExternalVideoThumbnail('https://youtu.be/dQw4w9WgXcQ', {width: 400}, fetchers),
        ).resolves.toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg')
    })

    it('returns null for unsupported URLs and failed provider lookups', async () => {
        const fetchers = {
            head: async () => {
                throw new Error('missing poster')
            },
            fetchJson: async () => {
                throw new Error('provider unavailable')
            },
        }

        await expect(
            getExternalVideoPoster('https://example.com/video', fetchers),
        ).resolves.toBeNull()
        await expect(
            getExternalVideoThumbnail('https://example.com/video', undefined, fetchers),
        ).resolves.toBeNull()
        await expect(
            getExternalVideoPoster('https://vimeo.com/123456789', fetchers),
        ).resolves.toBeNull()
        await expect(
            getExternalVideoThumbnail('https://vimeo.com/123456789', undefined, fetchers),
        ).resolves.toBeNull()
    })
})
