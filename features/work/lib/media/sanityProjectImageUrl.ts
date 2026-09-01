import {urlForImage} from '@/sanity/lib/utils'
import type {
    ProjectImageSourceSetResolver,
    ProjectImageUrlResolver,
} from './projectMediaPresentation'

const PROJECT_CARD_IMAGE_WIDTHS = [600, 900, 1200, 1600]
const PROJECT_CARD_IMAGE_SIZES =
    '(max-width: 600px) 100vw, (max-width: 1000px) 50vw, (max-width: 1245px) 33vw, 25vw'

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

export const getSanityProjectImageSourceSet: ProjectImageSourceSetResolver = (source, preset) => {
    if (preset !== 'card') return null

    const src = getSanityProjectImageUrl(source, preset)

    if (!src) return null

    const srcSet = PROJECT_CARD_IMAGE_WIDTHS.map((width) => {
        const url = urlForImage(source)?.height(width).width(width).url()

        return url ? `${url} ${width}w` : null
    })
        .filter((candidate): candidate is string => Boolean(candidate))
        .join(', ')

    if (!srcSet) return null

    return {
        src,
        srcSet,
        sizes: PROJECT_CARD_IMAGE_SIZES,
    }
}
