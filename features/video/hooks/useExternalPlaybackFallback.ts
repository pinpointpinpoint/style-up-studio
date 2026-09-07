import {useMediaPlayer} from '@vidstack/react'
import {useEffect, useState} from 'react'
import {getExternalVideoProvider, getExternalVideoSourceUrl} from '../lib/videoMedia'
import {isYouTubePlaybackError} from '../lib/youtubePlaybackError'

export default function useExternalPlaybackFallback(src: string) {
    const player = useMediaPlayer()
    const [status, setStatus] = useState<'slow' | 'error' | null>(null)
    const provider = getExternalVideoProvider(src)?.provider

    useEffect(() => {
        if (!player || !provider) return

        let timer: ReturnType<typeof setTimeout> | undefined
        const clearTimer = () => clearTimeout(timer)
        const handleFailure = () => {
            clearTimer()
            setStatus('error')
        }
        const handlePlayRequest = () => {
            clearTimer()
            setStatus(null)
            // Some restricted embeds never report an error or start playback.
            // A timeout is only a loading hint; let the provider keep trying.
            timer = setTimeout(() => setStatus((current) => current ?? 'slow'), 8000)
        }
        const handlePlaying = () => {
            clearTimer()
            setStatus(null)
        }
        const handleMessage = (event: MessageEvent) => {
            if (provider !== 'youtube') return
            const iframe = player.el?.querySelector('iframe')
            if (isYouTubePlaybackError(event, iframe?.contentWindow ?? null)) handleFailure()
        }

        player.addEventListener('media-play-request', handlePlayRequest)
        player.addEventListener('playing', handlePlaying)
        player.addEventListener('media-pause-request', clearTimer)
        player.addEventListener('play-fail', handleFailure)
        player.addEventListener('error', handleFailure)
        window.addEventListener('message', handleMessage)

        return () => {
            clearTimer()
            player.removeEventListener('media-play-request', handlePlayRequest)
            player.removeEventListener('playing', handlePlaying)
            player.removeEventListener('media-pause-request', clearTimer)
            player.removeEventListener('play-fail', handleFailure)
            player.removeEventListener('error', handleFailure)
            window.removeEventListener('message', handleMessage)
        }
    }, [player, provider, src])

    if (!provider || !status) return null

    return {
        message:
            status === 'slow'
                ? 'This video is taking longer than expected to load.'
                : 'This video couldn’t play here.',
        label: provider === 'youtube' ? 'YouTube' : 'Vimeo',
        url: getExternalVideoSourceUrl(src)!,
    }
}
