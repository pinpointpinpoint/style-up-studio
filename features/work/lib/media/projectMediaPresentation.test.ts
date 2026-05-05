import {describe, expect, it} from 'vitest'
import type {Project} from '@/types'
import {
    getProjectCardMedia,
    getProjectDetailMedia,
    getProjectDetailImageMedia,
    getProjectImageThumbnails,
    getProjectThumbnails,
} from './projectMediaPresentation'

function image(assetRef: string, key = assetRef) {
    return {
        _key: key,
        _type: 'image' as const,
        asset: {_ref: assetRef, _type: 'reference' as const},
        crop: null,
        hotspot: null,
        title: null,
        fileUrl: null,
        url: null,
        thumbnail: null,
    }
}

function uploadedVideo({
    fileUrl = 'https://cdn.example.com/video.mp4',
    key = 'uploaded-video',
    thumbnailRef = 'video-thumbnail',
    title = 'video.mp4',
}: {
    fileUrl?: string | null
    key?: string
    thumbnailRef?: string | null
    title?: string | null
} = {}) {
    return {
        _key: key,
        _type: 'uploadedVideo' as const,
        asset: {_ref: 'video-asset', _type: 'reference' as const},
        crop: null,
        hotspot: null,
        title,
        fileUrl,
        url: null,
        thumbnail: thumbnailRef
            ? {
                  asset: {_ref: thumbnailRef, _type: 'reference' as const},
                  crop: null,
                  hotspot: null,
              }
            : null,
    }
}

function videoUrl({
    key = 'video-url',
    thumbnailRef = 'video-thumbnail',
    url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
}: {
    key?: string
    thumbnailRef?: string | null
    url?: string | null
} = {}) {
    return {
        _key: key,
        _type: 'videoUrl' as const,
        asset: null,
        crop: null,
        hotspot: null,
        title: null,
        fileUrl: null,
        url,
        thumbnail: thumbnailRef
            ? {
                  asset: {_ref: thumbnailRef, _type: 'reference' as const},
                  crop: null,
                  hotspot: null,
              }
            : null,
    }
}

function project(overrides: Partial<Project>): Project {
    return {
        _id: 'project-1',
        _type: 'project',
        title: 'Editorial Story',
        client: 'Style Up',
        date: '2026-01-01',
        slug: 'editorial-story',
        projectType: [],
        featured: false,
        personalities: [],
        brands: [],
        media: [],
        previewUrl: null,
        coverImage: null,
        description: [],
        credits: [],
        orderRank: null,
        ...overrides,
    }
}

describe('getProjectCardMedia', () => {
    it('uses the cover image as the card image and only uses non-cover media images for hover', () => {
        const media = getProjectCardMedia(
            project({
                coverImage: {
                    asset: {_ref: 'cover-asset', _type: 'reference'},
                    crop: null,
                    hotspot: null,
                },
                media: [
                    image('cover-asset', 'duplicate-cover'),
                    image('gallery-asset', 'gallery-image'),
                ],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
            },
        )

        expect(media).toEqual({
            cardImage: {
                url: 'cover-asset:card',
                alt: 'Cover image for Editorial Story',
            },
            hoverImages: [
                {
                    url: 'gallery-asset:card',
                    alt: 'Gallery image for Editorial Story',
                },
            ],
            previewVideoUrl: null,
        })
    })
})

describe('getProjectDetailImageMedia', () => {
    it('returns ordered image frames with their original media index', () => {
        const media = getProjectDetailImageMedia(
            project({
                title: 'Editorial Story',
                media: [
                    image('first-image', 'first'),
                    {
                        _key: 'external-video',
                        _type: 'videoUrl',
                        asset: null,
                        crop: null,
                        hotspot: null,
                        title: null,
                        fileUrl: null,
                        url: 'https://vimeo.com/123',
                        thumbnail: null,
                    },
                    image('second-image', 'second'),
                ],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
            },
        )

        expect(media).toEqual([
            {
                key: 'first',
                mediaIndex: 0,
                url: 'first-image:detail',
                alt: 'Project image 1 for Editorial Story',
                eager: true,
            },
            {
                key: 'second',
                mediaIndex: 2,
                url: 'second-image:detail',
                alt: 'Project image 3 for Editorial Story',
                eager: false,
            },
        ])
    })
})

describe('getProjectDetailMedia', () => {
    it('returns uploaded video detail media with playable source, poster, and original media index', () => {
        const media = getProjectDetailMedia(
            project({
                media: [image('first-image', 'first'), uploadedVideo({key: 'behind-scenes'})],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
            },
        )

        expect(media).toEqual([
            {
                kind: 'image',
                key: 'first',
                mediaIndex: 0,
                url: 'first-image:detail',
                alt: 'Project image 1 for Editorial Story',
                eager: true,
            },
            {
                kind: 'uploadedVideo',
                key: 'behind-scenes',
                mediaIndex: 1,
                asset: {
                    value: {
                        fileUrl: 'https://cdn.example.com/video.mp4',
                        poster: 'video-thumbnail:video-poster',
                    },
                },
                fileUrl: 'https://cdn.example.com/video.mp4',
                poster: 'video-thumbnail:video-poster',
                title: 'video.mp4',
            },
        ])
    })

    it('returns external video detail media with playable URL and Sanity poster', () => {
        const media = getProjectDetailMedia(
            project({
                media: [videoUrl({key: 'campaign-film'})],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
            },
        )

        expect(media).toEqual([
            {
                kind: 'videoUrl',
                key: 'campaign-film',
                mediaIndex: 0,
                asset: {
                    value: {
                        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        poster: 'video-thumbnail:video-poster',
                    },
                },
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                poster: 'video-thumbnail:video-poster',
                title: undefined,
            },
        ])
    })

    it('returns external video detail media with provider poster when Sanity poster is missing', () => {
        const media = getProjectDetailMedia(
            project({
                media: [videoUrl({key: 'campaign-film', thumbnailRef: null})],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
                externalVideoPosterUrl: (url) => `provider-poster:${url}`,
            },
        )

        expect(media).toEqual([
            {
                kind: 'videoUrl',
                key: 'campaign-film',
                mediaIndex: 0,
                asset: {
                    value: {
                        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        poster: 'provider-poster:https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    },
                },
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                poster: 'provider-poster:https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                title: undefined,
            },
        ])
    })
})

describe('getProjectImageThumbnails', () => {
    it('returns image thumbnails with the same media index used by detail media', () => {
        const thumbnails = getProjectImageThumbnails(
            project({
                title: 'Editorial Story',
                media: [
                    image('first-image', 'first'),
                    image('missing-image', 'missing'),
                    image('third-image', 'third'),
                ],
            }),
            {
                imageUrl: (source, preset) =>
                    source.asset?._ref === 'missing-image'
                        ? null
                        : `${source.asset?._ref}:${preset}`,
                thumbnailHeight: 80,
            },
        )

        expect(thumbnails).toEqual([
            {
                key: 'first',
                mediaIndex: 0,
                url: 'first-image:thumbnail-80',
                alt: 'Gallery thumbnail for Editorial Story',
            },
            {
                key: 'third',
                mediaIndex: 2,
                url: 'third-image:thumbnail-80',
                alt: 'Gallery thumbnail for Editorial Story',
            },
        ])
    })
})

describe('getProjectThumbnails', () => {
    it('returns uploaded video thumbnails with the same media index used by detail media', () => {
        const thumbnails = getProjectThumbnails(
            project({
                media: [
                    image('first-image', 'first'),
                    uploadedVideo({key: 'behind-scenes', thumbnailRef: 'video-thumbnail'}),
                    uploadedVideo({key: 'missing-thumbnail', thumbnailRef: null}),
                ],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
                thumbnailHeight: 80,
            },
        )

        expect(thumbnails).toEqual([
            {
                kind: 'image',
                key: 'first',
                mediaIndex: 0,
                url: 'first-image:thumbnail-80',
                alt: 'Gallery thumbnail for Editorial Story',
            },
            {
                kind: 'uploadedVideo',
                key: 'behind-scenes',
                mediaIndex: 1,
                url: 'video-thumbnail:thumbnail-80',
                alt: 'Video thumbnail 2 for Editorial Story',
            },
        ])
    })

    it('returns external video thumbnails using Sanity thumbnail before provider fallback', () => {
        const thumbnails = getProjectThumbnails(
            project({
                media: [
                    videoUrl({key: 'custom-thumbnail', thumbnailRef: 'custom-video-thumbnail'}),
                    videoUrl({
                        key: 'provider-thumbnail',
                        thumbnailRef: null,
                        url: 'https://vimeo.com/123456789',
                    }),
                    videoUrl({
                        key: 'missing-thumbnail',
                        thumbnailRef: null,
                        url: 'https://example.com/video',
                    }),
                ],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
                externalVideoThumbnailUrl: (url, preset) =>
                    url.includes('vimeo.com') ? `provider:${url}:${preset}` : null,
                thumbnailHeight: 80,
            },
        )

        expect(thumbnails).toEqual([
            {
                kind: 'videoUrl',
                key: 'custom-thumbnail',
                mediaIndex: 0,
                url: 'custom-video-thumbnail:thumbnail-80',
                alt: 'Video link thumbnail 1 for Editorial Story',
            },
            {
                kind: 'videoUrl',
                key: 'provider-thumbnail',
                mediaIndex: 1,
                url: 'provider:https://vimeo.com/123456789:thumbnail-80',
                alt: 'Video link thumbnail 2 for Editorial Story',
            },
        ])
    })
})
