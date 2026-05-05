import {dataset, projectId} from './api'
import createImageUrlBuilder from '@sanity/image-url'
import {SanityImageSource} from '@sanity/image-url/lib/types/types'
import type {Image} from 'sanity'

type ImageWithNullableAsset = Omit<Image, 'asset'> & {
    asset?: Image['asset'] | null
}

const imageBuilder = createImageUrlBuilder({
    projectId: projectId || '',
    dataset: dataset || '',
})

export const urlForImage = (source: ImageWithNullableAsset | null | undefined) => {
    // Ensure that source image contains a valid reference
    if (!source?.asset?._ref) {
        return undefined
    }

    return imageBuilder
        ?.image(source as Image)
        .auto('format')
        .fit('max')
}

export function urlFor(source: SanityImageSource) {
    return imageBuilder.image(source)
}