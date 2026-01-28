import {dataset, projectId} from '@/sanity/lib/api'
import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import type {Image} from 'sanity'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: Image | null | undefined) => {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined
  }

  return imageBuilder?.image(source).auto('format').fit('max')
}

export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source)
}

export function urlForOpenGraphImage(image: Image | null | undefined) {
  return urlForImage(image)?.width(1200).height(627).fit('crop').url()
}

export function resolveHref(documentType?: string, slug?: string | null): string | undefined {
  switch (documentType) {
    case 'home':
      return '/'
    case 'page':
      return slug ? `/${slug}` : undefined
    case 'project':
      return slug ? `/projects/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}

export function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }

    // youtube.com/watch?v=VIDEO_ID
    if (parsed.searchParams.get('v')) {
      return parsed.searchParams.get('v');
    }

    // youtube.com/embed/VIDEO_ID
    if (parsed.pathname.startsWith('/embed/')) {
      return parsed.pathname.split('/embed/')[1];
    }

    return null;
  } catch {
    return null;
  }
}
