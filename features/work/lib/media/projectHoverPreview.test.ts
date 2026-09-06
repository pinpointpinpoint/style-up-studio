import {describe, expect, it, vi} from 'vitest'
import {startProjectHoverPreview} from './projectHoverPreview'

function createVideo(play: () => Promise<void> = () => Promise.resolve()) {
    return {muted: false, defaultMuted: false, playsInline: false, play, pause: vi.fn()}
}

describe('project hover previews', () => {
    it('sets muted and inline playback before starting the video', () => {
        const onFailure = vi.fn()
        const video = createVideo(
            vi.fn(() => {
                expect(video.muted).toBe(true)
                expect(video.defaultMuted).toBe(true)
                expect(video.playsInline).toBe(true)
                return Promise.resolve()
            }),
        )

        startProjectHoverPreview(video, onFailure)
        expect(video.play).toHaveBeenCalledOnce()
        expect(onFailure).not.toHaveBeenCalled()
    })

    it('reports a rejected play request so the card can restore its image', async () => {
        const error = new DOMException('Playback blocked', 'NotAllowedError')
        const onFailure = vi.fn()
        startProjectHoverPreview(
            createVideo(() => Promise.reject(error)),
            onFailure,
        )
        await Promise.resolve()
        expect(onFailure).toHaveBeenCalledWith(error)
    })

    it('pauses on hover exit and ignores the resulting late rejection', async () => {
        let rejectPlay!: (error: Error) => void
        const video = createVideo(
            () =>
                new Promise((_, reject) => {
                    rejectPlay = reject
                }),
        )
        const onFailure = vi.fn()
        const stop = startProjectHoverPreview(video, onFailure)
        stop()
        rejectPlay(new DOMException('Playback interrupted', 'AbortError'))
        await Promise.resolve()
        expect(video.pause).toHaveBeenCalledOnce()
        expect(onFailure).not.toHaveBeenCalled()
    })

    it('handles synchronous playback failures', () => {
        const error = new Error('Video unavailable')
        const onFailure = vi.fn()
        startProjectHoverPreview(
            createVideo(() => {
                throw error
            }),
            onFailure,
        )
        expect(onFailure).toHaveBeenCalledWith(error)
    })
})
