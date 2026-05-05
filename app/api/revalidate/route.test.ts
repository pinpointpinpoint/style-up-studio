import {NextRequest} from 'next/server'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {
    SANITY_PROJECTS_TAG,
    SANITY_PUBLIC_TAG,
    SANITY_SEO_TAG,
    SANITY_SITE_SHELL_TAG,
    SANITY_STYLE_UPS_TAG,
} from '../../../sanity/lib/cacheTags'
import {getSanityRevalidateTags, POST} from './route'

const mocks = vi.hoisted(() => ({
    revalidateTag: vi.fn(),
}))

vi.mock('next/cache', () => ({
    revalidateTag: mocks.revalidateTag,
}))

function createRequest(body: Record<string, unknown>, secret = 'test-secret') {
    return new NextRequest(`http://localhost:3000/api/revalidate?secret=${secret}`, {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

describe('Sanity revalidate route', () => {
    const originalSecret = process.env.SANITY_REVALIDATE_SECRET

    beforeEach(() => {
        process.env.SANITY_REVALIDATE_SECRET = 'test-secret'
        mocks.revalidateTag.mockClear()
    })

    afterEach(() => {
        process.env.SANITY_REVALIDATE_SECRET = originalSecret
    })

    it('maps project-adjacent document types to project and shell tags', () => {
        const tags = [SANITY_PUBLIC_TAG, SANITY_PROJECTS_TAG, SANITY_SITE_SHELL_TAG]

        expect(getSanityRevalidateTags('project')).toEqual(tags)
        expect(getSanityRevalidateTags('projectType')).toEqual(tags)
        expect(getSanityRevalidateTags('personality')).toEqual(tags)
        expect(getSanityRevalidateTags('brand')).toEqual(tags)
    })

    it('maps public singleton and style-up document types to their tags', () => {
        expect(getSanityRevalidateTags('about')).toEqual([
            SANITY_PUBLIC_TAG,
            SANITY_SITE_SHELL_TAG,
        ])
        expect(getSanityRevalidateTags('contact')).toEqual([
            SANITY_PUBLIC_TAG,
            SANITY_SITE_SHELL_TAG,
        ])
        expect(getSanityRevalidateTags('settings')).toEqual([
            SANITY_PUBLIC_TAG,
            SANITY_SEO_TAG,
            SANITY_SITE_SHELL_TAG,
        ])
        expect(getSanityRevalidateTags('styleup')).toEqual([
            SANITY_PUBLIC_TAG,
            SANITY_STYLE_UPS_TAG,
        ])
    })

    it('revalidates every tag for a known Sanity document type', async () => {
        const response = await POST(createRequest({_type: 'project'}))

        await expect(response.json()).resolves.toEqual({
            revalidated: true,
            documentType: 'project',
            tags: [SANITY_PUBLIC_TAG, SANITY_PROJECTS_TAG, SANITY_SITE_SHELL_TAG],
        })
        expect(mocks.revalidateTag).toHaveBeenCalledTimes(3)
        expect(mocks.revalidateTag).toHaveBeenNthCalledWith(1, SANITY_PUBLIC_TAG, {expire: 0})
        expect(mocks.revalidateTag).toHaveBeenNthCalledWith(2, SANITY_PROJECTS_TAG, {expire: 0})
        expect(mocks.revalidateTag).toHaveBeenNthCalledWith(3, SANITY_SITE_SHELL_TAG, {
            expire: 0,
        })
    })

    it('rejects invalid secrets without revalidating tags', async () => {
        const response = await POST(createRequest({_type: 'project'}, 'wrong-secret'))

        expect(response.status).toBe(401)
        await expect(response.json()).resolves.toEqual({
            revalidated: false,
            message: 'Invalid secret',
        })
        expect(mocks.revalidateTag).not.toHaveBeenCalled()
    })

    it('ignores unknown document types without revalidating tags', async () => {
        const response = await POST(createRequest({_type: 'post'}))

        await expect(response.json()).resolves.toEqual({
            revalidated: false,
            message: 'Ignored document type',
            documentType: 'post',
            tags: [],
        })
        expect(mocks.revalidateTag).not.toHaveBeenCalled()
    })
})
