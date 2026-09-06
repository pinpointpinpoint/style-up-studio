import {describe, expect, it} from 'vitest'
import {isYouTubePlaybackError} from './youtubePlaybackError'

describe('YouTube playback errors', () => {
    const iframeWindow = {} as Window
    const event = (data: unknown, origin = 'https://www.youtube-nocookie.com') => ({
        data,
        origin,
        source: iframeWindow,
    })

    it('recognizes embed errors in JSON messages', () => {
        expect(isYouTubePlaybackError(event('{"event":"onError","info":150}'), iframeWindow)).toBe(
            true,
        )
    })

    it('recognizes errors delivered in video metadata', () => {
        expect(
            isYouTubePlaybackError(
                event({
                    event: 'infoDelivery',
                    info: {videoData: {errorCode: 150}},
                }),
                iframeWindow,
            ),
        ).toBe(true)
    })

    it('supports the regular YouTube origin', () => {
        expect(
            isYouTubePlaybackError(
                event({event: 'onError', info: 101}, 'https://www.youtube.com'),
                iframeWindow,
            ),
        ).toBe(true)
    })

    it('ignores errors from another player or an untrusted origin', () => {
        const error = event({event: 'onError', info: 150})
        expect(isYouTubePlaybackError(error, {} as Window)).toBe(false)
        expect(isYouTubePlaybackError(error, null)).toBe(false)
        expect(
            isYouTubePlaybackError({...error, origin: 'https://example.com'}, iframeWindow),
        ).toBe(false)
    })

    it.each([
        'not JSON',
        null,
        {},
        {event: 'onError', info: 0},
        {event: 'onError', info: '150'},
        {event: 'infoDelivery', info: {playerState: 1}},
        {event: 'infoDelivery', info: {videoData: {errorCode: 0}}},
    ])('ignores malformed messages and normal playback updates: %j', (message) => {
        expect(isYouTubePlaybackError(event(message), iframeWindow)).toBe(false)
    })
})
