export function waitForPageMedia(root: HTMLElement, onReady: () => void) {
    let stopped = false
    let observer: IntersectionObserver | undefined
    let frame = 0
    const cleanups: (() => void)[] = []
    const mutation = new MutationObserver(inspect)

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
        if (stopped || observer || root.querySelector('[data-intro-pending="true"]')) return
        const media = [...root.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video')]
        const remaining = new Set<Element>(media)
        const visible = new Set<HTMLImageElement | HTMLVideoElement>()
        const finish = () => {
            mutation.disconnect()
            observer?.disconnect()
            void Promise.all([...visible].map(wait)).then(() => {
                if (stopped) return
                // Allow decoded frames to be painted beneath the overlay before removing it.
                frame = requestAnimationFrame(() => {
                    frame = requestAnimationFrame(() => { if (!stopped) onReady() })
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
    mutation.observe(root, {childList: true, subtree: true, attributes: true, attributeFilter: ['data-intro-pending']})
    frame = requestAnimationFrame(inspect)
    return () => {
        stopped = true
        cancelAnimationFrame(frame)
        mutation.disconnect()
        observer?.disconnect()
        cleanups.forEach(cleanup => cleanup())
    }
}
