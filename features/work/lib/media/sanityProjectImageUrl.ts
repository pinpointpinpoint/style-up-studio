import {urlForImage} from '@/sanity/lib/utils'
import type {ProjectImageUrlResolver} from './projectMediaPresentation'

export const getSanityProjectImageUrl: ProjectImageUrlResolver = (source, preset) => {
    if (preset === 'card') {
        return urlForImage(source)?.height(1200).width(1200).url()
    }

    if (preset === 'detail') {
        return urlForImage(source)?.width(1800).quality(85).url()
    }

    if (preset === 'video-poster') {
        return urlForImage(source)?.width(1600).quality(80).url()
    }

    if (preset.startsWith('thumbnail-')) {
        const height = Number(preset.replace('thumbnail-', ''))

        return urlForImage(source)?.height(height).quality(75).url()
    }

    return null
}
