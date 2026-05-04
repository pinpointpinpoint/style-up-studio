import {getExternalVideoProvider} from '@/lib/videoMedia'

export default function getYouTubeId(url: string): string | null {
    const video = getExternalVideoProvider(url)

    return video?.provider === 'youtube' ? video.id : null
}
