import {getVideoMediaAsset, type VideoMediaAssetUse} from '@/features/video/lib/videoMedia'
import type {Project} from '@/types'

type ProjectImage = NonNullable<Project['coverImage']>
type ProjectMediaItem = Project['media'][number]
type ProjectMediaImage = Extract<ProjectMediaItem, {_type: 'image'}>
type ProjectUploadedVideo = Extract<ProjectMediaItem, {_type: 'uploadedVideo'}>
type ProjectExternalVideo = Extract<ProjectMediaItem, {_type: 'videoUrl'}>

export type ProjectImagePreset = 'card' | 'detail' | `thumbnail-${number}` | 'video-poster'

export type ProjectImageUrlResolver = (
    source: ProjectImage | ProjectMediaImage,
    preset: ProjectImagePreset,
) => string | null | undefined

export type ProjectImageSourceSet = {
    src: string
    srcSet: string
    sizes: string
}

export type ProjectImageSourceSetResolver = (
    source: ProjectImage | ProjectMediaImage,
    preset: ProjectImagePreset,
) => ProjectImageSourceSet | null | undefined

export type ProjectPresentedImage = {
    url: string
    alt: string
    srcSet?: string
    sizes?: string
}

export type ProjectCardMedia = {
    cardImage: ProjectPresentedImage | null
    hoverImage: ProjectPresentedImage | null
    previewVideoUrl: string | null
}

export type ProjectDetailImageMedia = ProjectPresentedImage & {
    kind?: 'image'
    key: string
    mediaIndex: number
    eager: boolean
}

export type ProjectDetailUploadedVideoMedia = {
    kind: 'uploadedVideo'
    key: string
    mediaIndex: number
    fileUrl: string
    poster: string | undefined
    title: string | undefined
}

export type ProjectDetailExternalVideoMedia = {
    kind: 'videoUrl'
    key: string
    mediaIndex: number
    url: string
    poster: string | undefined
    title: string | undefined
}

export type ProjectDetailMedia =
    | (ProjectDetailImageMedia & {kind: 'image'})
    | ProjectDetailUploadedVideoMedia
    | ProjectDetailExternalVideoMedia

export type ProjectImageThumbnail = ProjectPresentedImage & {
    kind?: 'image'
    key: string
    mediaIndex: number
    displayWidth: number
}

export type ProjectUploadedVideoThumbnail = ProjectPresentedImage & {
    kind: 'uploadedVideo'
    key: string
    mediaIndex: number
    displayWidth: number
}

export type ProjectExternalVideoThumbnail = ProjectPresentedImage & {
    kind: 'videoUrl'
    key: string
    mediaIndex: number
    displayWidth: number
}

export type ProjectThumbnail =
    | (ProjectImageThumbnail & {kind: 'image'})
    | ProjectUploadedVideoThumbnail
    | ProjectExternalVideoThumbnail

type ProjectMediaPresentationOptions = {
    imageUrl: ProjectImageUrlResolver
    imageSourceSet?: ProjectImageSourceSetResolver
    externalVideoPosterUrl?: (url: string) => string | null | undefined
}

type ProjectThumbnailPresentationOptions = ProjectMediaPresentationOptions & {
    externalVideoThumbnailUrl?: (
        url: string,
        preset: `thumbnail-${number}`,
    ) => string | null | undefined
    thumbnailHeight: number
    displayThumbnailHeight?: number
}

const FALLBACK_THUMBNAIL_ASPECT_RATIO = 1
const FALLBACK_VIDEO_THUMBNAIL_ASPECT_RATIO = 16 / 9

function getSanityAssetAspectRatio(assetRef: string | null | undefined) {
    const match = assetRef?.match(/-(\d+)x(\d+)-[^-]+$/)

    if (!match) return null

    const width = Number(match[1])
    const height = Number(match[2])

    return width > 0 && height > 0 ? width / height : null
}

function getThumbnailDisplayWidth(
    aspectRatio: number | null | undefined,
    options: ProjectThumbnailPresentationOptions,
) {
    return (
        (options.displayThumbnailHeight ?? options.thumbnailHeight) *
        (aspectRatio ?? FALLBACK_THUMBNAIL_ASPECT_RATIO)
    )
}

function getAssetRef(image: ProjectImage | ProjectMediaImage | null | undefined) {
    return image?.asset?._ref
}

function toPresentedImage(
    source: ProjectImage | ProjectMediaImage | null | undefined,
    alt: string,
    imageUrl: ProjectImageUrlResolver,
    preset: ProjectImagePreset = 'card',
    imageSourceSet?: ProjectImageSourceSetResolver,
): ProjectPresentedImage | null {
    if (!source) return null

    const sourceSet = imageSourceSet?.(source, preset)
    const url = imageUrl(source, preset)
    const src = sourceSet?.src ?? url

    if (!src) return null

    return {
        url: src,
        alt,
        ...(sourceSet?.srcSet ? {srcSet: sourceSet.srcSet} : {}),
        ...(sourceSet?.sizes ? {sizes: sourceSet.sizes} : {}),
    }
}

export function getProjectCardMedia(
    project: Project,
    options: ProjectMediaPresentationOptions,
): ProjectCardMedia {
    const imageUrl = options.imageUrl
    const projectTitle = project.title ?? 'project'
    const coverAssetRef = getAssetRef(project.coverImage)
    const cardImage = toPresentedImage(
        project.coverImage,
        `Cover image for ${projectTitle}`,
        imageUrl,
        'card',
        options.imageSourceSet,
    )
    const mediaImages = project.media.filter(
        (item): item is ProjectMediaImage => item._type === 'image',
    )
    const firstHoverImage = mediaImages.find((image) => getAssetRef(image) !== coverAssetRef)
    const hoverImage = toPresentedImage(
        firstHoverImage,
        `Gallery image for ${projectTitle}`,
        imageUrl,
        'card',
        options.imageSourceSet,
    )

    return {
        cardImage,
        hoverImage,
        previewVideoUrl: project.previewUrl,
    }
}

export function getProjectDetailImageMedia(
    project: Project,
    options: ProjectMediaPresentationOptions,
): ProjectDetailImageMedia[] {
    const imageUrl = options.imageUrl
    const projectTitle = project.title ?? 'project'

    return project.media
        .map((item, mediaIndex) => {
            if (item._type !== 'image') return null

            const image = toPresentedImage(
                item,
                `Project image ${mediaIndex + 1} for ${projectTitle}`,
                imageUrl,
                'detail',
                options.imageSourceSet,
            )

            if (!image) return null

            return {
                key: item._key ?? item.asset?._ref ?? String(mediaIndex),
                mediaIndex,
                eager: mediaIndex === 0,
                ...image,
            }
        })
        .filter((item): item is ProjectDetailImageMedia => Boolean(item))
}

function getUploadedVideoPoster(item: ProjectUploadedVideo, imageUrl: ProjectImageUrlResolver) {
    return getVideoMediaAsset({
        sourceKind: 'uploadedVideo',
        sourceUrl: item.fileUrl ?? '',
        assetUse: 'poster',
        sanityThumbnail: item.thumbnail,
        sanityThumbnailUrl: imageUrl,
    })
}

function getExternalVideoPoster(
    item: ProjectExternalVideo,
    options: ProjectMediaPresentationOptions,
) {
    if (!item.url) return undefined

    return getVideoMediaAsset({
        sourceKind: 'videoUrl',
        sourceUrl: item.url,
        assetUse: 'poster',
        sanityThumbnail: item.thumbnail,
        sanityThumbnailUrl: options.imageUrl,
        providerPosterUrl: options.externalVideoPosterUrl,
    })
}

function getProjectInfoThumbnailAssetUse(thumbnailHeight: number): VideoMediaAssetUse {
    return thumbnailHeight === 400 ? 'expandedProjectInfoThumbnail' : 'projectInfoThumbnail'
}

export function getProjectDetailMedia(
    project: Project,
    options: ProjectMediaPresentationOptions,
): ProjectDetailMedia[] {
    const imageUrl = options.imageUrl
    const imageMediaByIndex = new Map(
        getProjectDetailImageMedia(project, options).map((item) => [item.mediaIndex, item]),
    )

    return project.media
        .map((item, mediaIndex) => {
            if (item._type === 'image') {
                const image = imageMediaByIndex.get(mediaIndex)

                return image ? {...image, kind: 'image' as const} : null
            }

            if (item._type === 'uploadedVideo') {
                if (!item.fileUrl) return null
                const poster = getUploadedVideoPoster(item, imageUrl)
                const uploadedVideoMedia: ProjectDetailUploadedVideoMedia = {
                    kind: 'uploadedVideo',
                    key: item._key ?? `uploaded-video-${mediaIndex}`,
                    mediaIndex,
                    fileUrl: item.fileUrl,
                    poster,
                    title: item.title ?? undefined,
                }

                return uploadedVideoMedia
            }

            if (item._type === 'videoUrl') {
                if (!item.url) return null
                const poster = getExternalVideoPoster(item, options)
                const externalVideoMedia: ProjectDetailExternalVideoMedia = {
                    kind: 'videoUrl',
                    key: item._key ?? `video-url-${mediaIndex}`,
                    mediaIndex,
                    url: item.url,
                    poster,
                    title: item.title ?? undefined,
                }

                return externalVideoMedia
            }

            return null
        })
        .filter((item): item is ProjectDetailMedia => Boolean(item))
}

export function getProjectImageThumbnails(
    project: Project,
    options: ProjectThumbnailPresentationOptions,
): ProjectImageThumbnail[] {
    const imageUrl = options.imageUrl
    const projectTitle = project.title ?? 'project'
    const preset = `thumbnail-${options.thumbnailHeight}` as const

    return project.media
        .map((item, mediaIndex) => {
            if (item._type !== 'image') return null

            const image = toPresentedImage(
                item,
                `Gallery thumbnail for ${projectTitle}`,
                imageUrl,
                preset,
            )

            if (!image) return null

            return {
                key: item._key ?? item.asset?._ref ?? String(mediaIndex),
                mediaIndex,
                displayWidth: getThumbnailDisplayWidth(
                    getSanityAssetAspectRatio(item.asset?._ref),
                    options,
                ),
                ...image,
            }
        })
        .filter((item): item is ProjectImageThumbnail => Boolean(item))
}

export function getProjectThumbnails(
    project: Project,
    options: ProjectThumbnailPresentationOptions,
): ProjectThumbnail[] {
    const imageUrl = options.imageUrl
    const projectTitle = project.title ?? 'project'
    const imageThumbnailsByIndex = new Map(
        getProjectImageThumbnails(project, options).map((item) => [item.mediaIndex, item]),
    )

    return project.media
        .map((item, mediaIndex) => {
            if (item._type === 'image') {
                const image = imageThumbnailsByIndex.get(mediaIndex)

                return image ? {...image, kind: 'image' as const} : null
            }

            if (item._type === 'uploadedVideo') {
                if (!item.thumbnail) return null

                const url = getVideoMediaAsset({
                    sourceKind: 'uploadedVideo',
                    sourceUrl: item.fileUrl ?? '',
                    assetUse: getProjectInfoThumbnailAssetUse(options.thumbnailHeight),
                    sanityThumbnail: item.thumbnail,
                    sanityThumbnailUrl: imageUrl,
                })
                if (!url) return null

                return {
                    kind: 'uploadedVideo' as const,
                    key: item._key ?? `uploaded-video-${mediaIndex}`,
                    mediaIndex,
                    url,
                    alt: `Video thumbnail ${mediaIndex + 1} for ${projectTitle}`,
                    displayWidth: getThumbnailDisplayWidth(
                        getSanityAssetAspectRatio(item.thumbnail.asset?._ref) ??
                            FALLBACK_VIDEO_THUMBNAIL_ASPECT_RATIO,
                        options,
                    ),
                }
            }

            if (item._type === 'videoUrl') {
                if (!item.url) return null

                const url = getVideoMediaAsset({
                    sourceKind: 'videoUrl',
                    sourceUrl: item.url,
                    assetUse: getProjectInfoThumbnailAssetUse(options.thumbnailHeight),
                    sanityThumbnail: item.thumbnail,
                    sanityThumbnailUrl: imageUrl,
                    providerThumbnailUrl: (videoUrl, providerPreset) =>
                        options.externalVideoThumbnailUrl?.(videoUrl, providerPreset),
                })

                if (!url) return null

                return {
                    kind: 'videoUrl' as const,
                    key: item._key ?? `video-url-${mediaIndex}`,
                    mediaIndex,
                    url,
                    alt: `Video link thumbnail ${mediaIndex + 1} for ${projectTitle}`,
                    displayWidth: getThumbnailDisplayWidth(
                        getSanityAssetAspectRatio(item.thumbnail?.asset?._ref) ??
                            FALLBACK_VIDEO_THUMBNAIL_ASPECT_RATIO,
                        options,
                    ),
                }
            }

            return null
        })
        .filter((item): item is ProjectThumbnail => Boolean(item))
}
