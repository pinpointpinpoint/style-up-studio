import {describe, expect, it} from 'vitest'
import type {Project} from '@/types'
import {getProjectSidebarMedia, getVisibleSidebarThumbnailCount} from './projectSidebarMedia'

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

function uploadedVideo(key: string, thumbnailRef: string | null) {
    return {
        _key: key,
        _type: 'uploadedVideo' as const,
        asset: {_ref: `${key}-asset`, _type: 'reference' as const},
        crop: null,
        hotspot: null,
        title: null,
        fileUrl: 'https://cdn.example.com/video.mp4',
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

function videoUrl(key: string, url: string, thumbnailRef: string | null = null) {
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

describe('getProjectSidebarMedia', () => {
    it('prepares ordered visible sidebar thumbnails and hidden count', () => {
        const sidebarMedia = getProjectSidebarMedia(
            project({
                media: [
                    image('first-image', 'first'),
                    uploadedVideo('behind-scenes', 'video-thumbnail'),
                    videoUrl('external-video', 'https://vimeo.com/123'),
                    image('last-image', 'last'),
                ],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
                externalVideoThumbnailUrl: (url, preset) => `provider:${url}:${preset}`,
                thumbnailHeight: 80,
                visibleThumbnailCount: 3,
            },
        )

        expect(sidebarMedia.visibleThumbnails).toEqual([
            {
                kind: 'image',
                key: 'first',
                mediaIndex: 0,
                displayWidth: 80,
                url: 'first-image:thumbnail-80',
                alt: 'Gallery thumbnail for Editorial Story',
            },
            {
                kind: 'uploadedVideo',
                key: 'behind-scenes',
                mediaIndex: 1,
                displayWidth: 142.22222222222223,
                url: 'video-thumbnail:thumbnail-80',
                alt: 'Video thumbnail 2 for Editorial Story',
            },
            {
                kind: 'videoUrl',
                key: 'external-video',
                mediaIndex: 2,
                displayWidth: 142.22222222222223,
                url: 'provider:https://vimeo.com/123:thumbnail-80',
                alt: 'Video link thumbnail 3 for Editorial Story',
            },
        ])
        expect(sidebarMedia.hiddenThumbnailCount).toBe(1)
    })
})

describe('getVisibleSidebarThumbnailCount', () => {
    it('reserves room for the hidden-count badge when thumbnails overflow', () => {
        expect(
            getVisibleSidebarThumbnailCount({
                availableWidth: 105,
                thumbnailWidths: [30, 30, 30, 30],
                thumbnailGap: 5,
                countBadgeWidth: 30,
            }),
        ).toBe(2)
    })

    it('returns all thumbnails when they fit without a badge', () => {
        expect(
            getVisibleSidebarThumbnailCount({
                availableWidth: 135,
                thumbnailWidths: [30, 30, 30, 30],
                thumbnailGap: 5,
                countBadgeWidth: 30,
            }),
        ).toBe(4)
    })
})
