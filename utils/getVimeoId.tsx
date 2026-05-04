import {getExternalVideoProvider} from '@/lib/videoMedia'

export default function getVimeoId(url: string): string | null {
    const video = getExternalVideoProvider(url)

    return video?.provider === 'vimeo' ? video.id : null
}
