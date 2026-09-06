const YOUTUBE_ORIGINS = new Set(['https://www.youtube.com', 'https://www.youtube-nocookie.com'])

export function isYouTubePlaybackError(
    event: Pick<MessageEvent, 'origin' | 'source' | 'data'>,
    iframeWindow: MessageEventSource | null,
): boolean {
    if (!iframeWindow || event.source !== iframeWindow || !YOUTUBE_ORIGINS.has(event.origin)) {
        return false
    }

    let message: unknown = event.data
    if (typeof message === 'string') {
        try {
            message = JSON.parse(message)
        } catch {
            return false
        }
    }

    if (!message || typeof message !== 'object') return false
    if (!('info' in message)) return false

    const info = message.info
    if ('event' in message && message.event === 'onError') {
        return typeof info === 'number' && info > 0
    }

    if (!info || typeof info !== 'object' || !('videoData' in info)) return false
    const videoData = info.videoData
    if (!videoData || typeof videoData !== 'object' || !('errorCode' in videoData)) return false

    return typeof videoData.errorCode === 'number' && videoData.errorCode > 0
}
