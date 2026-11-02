export function waitForPageMedia(root: HTMLElement, onReady: () => void, timeoutMs = 8000) {
    let stopped = false
    let observer: IntersectionObserver | undefined
    let frame = 0
    let generation = 0
    const cleanups: (() => void)[] = []
    const mutation = new MutationObserver(inspect)
    const timeout = setTimeout(complete, timeoutMs)

    function clearWaits() {
        cancelAnimationFrame(frame)
        observer?.disconnect()
        cleanups.splice(0).forEach(cleanup => cleanup())
    }

    function stop() {
        stopped = true
        clearTimeout(timeout)
        mutation.disconnect()
        clearWaits()
    }

    function complete() {
        if (stopped) return
        stop()
        onReady()
    }

    function wait(media: HTMLImageElement | HTMLVideoElement) {
        return new Promise<void>(resolve => {
            const finish = () => { cleanup(); resolve() }
            const loaded = () => {
                if (media instanceof HTMLImageElement) void media.decode().catch(() => {}).then(finish)
                else finish()
            }
            const cleanup = () => {
                media.removeEventListener('load', loaded)
                media.removeEventListener('loadeddata', loaded)
                media.removeEventListener('error', finish)
            }
            cleanups.push(cleanup)
            media.addEventListener('load', loaded)
            media.addEventListener('loadeddata', loaded)
            media.addEventListener('error', finish)
            if (media instanceof HTMLImageElement) {
                media.loading = 'eager'
                if (media.complete) loaded()
            } else if (media.readyState >= 2 || media.error) finish()
        })
    }

    function inspect() {
        if (stopped) return
        const currentGeneration = ++generation
        clearWaits()
        if (root.querySelector('[data-intro-pending="true"]')) return
        // Full players wait for user interaction; only preview videos block the intro.
        const media = [...root.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video[data-intro-preview]')]
        const remaining = new Set<Element>(media)
        const visible = new Set<HTMLImageElement | HTMLVideoElement>()
        const finish = () => {
            observer?.disconnect()
            void Promise.all([...visible].map(wait)).then(() => {
                if (stopped || currentGeneration !== generation) return
                // Allow decoded frames to be painted beneath the overlay before removing it.
                frame = requestAnimationFrame(() => {
                    frame = requestAnimationFrame(() => {
                        if (currentGeneration === generation) complete()
                    })
                })
            })
        }
        if (!media.length) { finish(); return }
        observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                remaining.delete(entry.target)
                if (entry.isIntersecting && entry.intersectionRatio > 0) visible.add(entry.target as HTMLImageElement | HTMLVideoElement)
            }
            if (!remaining.size) finish()
        })
        media.forEach(item => observer!.observe(item))
    }
    mutation.observe(root, {childList: true, subtree: true, attributes: true, attributeFilter: ['data-intro-pending', 'src', 'srcset']})
    frame = requestAnimationFrame(inspect)
    return stop
}
