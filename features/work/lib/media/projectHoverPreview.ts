export function startProjectHoverPreview(
    video: Pick<HTMLVideoElement, 'muted' | 'defaultMuted' | 'playsInline' | 'play' | 'pause'>,
    onFailure: (error: unknown) => void,
): () => void {
    let cancelled = false

    // Set both the DOM property and reflected attribute before requesting playback.
    video.defaultMuted = true
    video.muted = true
    video.playsInline = true

    try {
        void video.play().catch((error: unknown) => {
            if (!cancelled) onFailure(error)
        })
    } catch (error) {
        onFailure(error)
    }

    return () => {
        cancelled = true
        video.pause()
    }
}
