import {describe, expect, it} from 'vitest'
import type {Project} from '@/types'
import {
    createProjectDetailMediaView,
    getProjectDetailMediaScrollSelection,
    selectProjectDetailMedia,
} from './projectDetailMediaView'

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
}: {
    fileUrl?: string | null
    key?: string
} = {}) {
    return {
        _key: key,
        _type: 'uploadedVideo' as const,
        asset: {_ref: 'video-asset', _type: 'reference' as const},
        crop: null,
        hotspot: null,
        title: 'video.mp4',
        fileUrl,
        url: null,
        thumbnail: null,
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

describe('project detail media view', () => {
    it('builds ordered renderable media and starts on the first available media index', () => {
        const view = createProjectDetailMediaView(
            project({
                media: [
                    uploadedVideo({fileUrl: null, key: 'missing-video'}),
                    image('first-image', 'first-image'),
                    uploadedVideo({key: 'behind-scenes'}),
                ],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
            },
        )

        expect(view).toEqual({
            media: [
                {
                    kind: 'image',
                    key: 'first-image',
                    mediaIndex: 1,
                    eager: false,
                    url: 'first-image:detail',
                    alt: 'Project image 2 for Editorial Story',
                },
                {
                    kind: 'uploadedVideo',
                    key: 'behind-scenes',
                    mediaIndex: 2,
                    fileUrl: 'https://cdn.example.com/video.mp4',
                    poster: undefined,
                    title: 'video.mp4',
                },
            ],
            activeMediaIndex: 1,
        })
    })

    it('includes provider poster fallback when the detail view supplies one', () => {
        const view = createProjectDetailMediaView(
            project({
                media: [
                    {
                        _key: 'campaign-film',
                        _type: 'videoUrl' as const,
                        asset: null,
                        crop: null,
                        hotspot: null,
                        title: null,
                        fileUrl: null,
                        url: 'https://vimeo.com/123456789',
                        thumbnail: null,
                    },
                ],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
                externalVideoPosterUrl: (url) => `provider-poster:${url}`,
            },
        )

        expect(view.media).toEqual([
            {
                kind: 'videoUrl',
                key: 'campaign-film',
                mediaIndex: 0,
                url: 'https://vimeo.com/123456789',
                poster: 'provider-poster:https://vimeo.com/123456789',
                title: undefined,
            },
        ])
    })

    it('selects a renderable media item and returns its scroll target', () => {
        const view = createProjectDetailMediaView(
            project({
                media: [image('first-image', 'first-image'), uploadedVideo({key: 'behind-scenes'})],
            }),
            {
                imageUrl: (source, preset) => `${source.asset?._ref}:${preset}`,
            },
        )

        expect(selectProjectDetailMedia(view, 1)).toEqual({
            ...view,
            activeMediaIndex: 1,
            scrollTargetMediaIndex: 1,
        })
    })

    it('selects the media frame nearest the scroll pane center', () => {
        expect(
            getProjectDetailMediaScrollSelection({
                currentActiveMediaIndex: 0,
                paneRect: {top: 100, height: 200},
                frameRects: [
                    {mediaIndex: 0, top: 20, height: 80},
                    {mediaIndex: 1, top: 160, height: 80},
                    {mediaIndex: 2, top: 300, height: 80},
                ],
            }),
        ).toBe(1)
    })

    it('keeps the current active media index when no frames can be measured', () => {
        expect(
            getProjectDetailMediaScrollSelection({
                currentActiveMediaIndex: 2,
                paneRect: {top: 100, height: 200},
                frameRects: [],
            }),
        ).toBe(2)
    })
})
