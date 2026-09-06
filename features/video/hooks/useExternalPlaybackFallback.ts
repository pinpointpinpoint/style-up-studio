import {useMediaPlayer, useMediaState} from '@vidstack/react'
import {useEffect, useState} from 'react'
import {getExternalVideoProvider, getExternalVideoSourceUrl} from '../lib/videoMedia'
import {isYouTubePlaybackError} from '../lib/youtubePlaybackError'

export default function useExternalPlaybackFallback(src: string) {
    const player = useMediaPlayer()
    const error = useMediaState('error')
    const [failed, setFailed] = useState(false)
    const provider = getExternalVideoProvider(src)?.provider

    useEffect(() => {
        if (!player || !provider) return

        let timer: ReturnType<typeof setTimeout> | undefined
        const clearTimer = () => clearTimeout(timer)
        const handleFailure = () => {
            clearTimer()
            setFailed(true)
        }
        const handlePlayRequest = () => {
            clearTimer()
            // Some restricted embeds never report an error or start playback.
            timer = setTimeout(handleFailure, 8000)
        }
        const handlePlaying = () => {
            clearTimer()
            setFailed(false)
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
        window.addEventListener('message', handleMessage)

        return () => {
            clearTimer()
            player.removeEventListener('media-play-request', handlePlayRequest)
            player.removeEventListener('playing', handlePlaying)
            player.removeEventListener('media-pause-request', clearTimer)
            player.removeEventListener('play-fail', handleFailure)
            window.removeEventListener('message', handleMessage)
        }
    }, [player, provider, src])

    if (!provider || (!error && !failed)) return null

    return {
        label: provider === 'youtube' ? 'YouTube' : 'Vimeo',
        url: getExternalVideoSourceUrl(src)!,
    }
}
