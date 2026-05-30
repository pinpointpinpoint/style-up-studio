import {ProjectsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField} from '@sanity/orderable-document-list'

const MAX_VIDEO_FILE_SIZE_MB = 250
const MAX_VIDEO_FILE_SIZE_BYTES = MAX_VIDEO_FILE_SIZE_MB * 1024 * 1024

export default defineType({
    name: 'project',
    title: 'Project',
    type: 'document',
    icon: ProjectsIcon,
    fieldsets: [
        {
            name: 'basic',
            title: 'Basic Info',
        },
        {
            name: 'collaborators',
            title: 'Collaborators',
            description: 'Add any personalities or brands that collaborated on this project.',
            options: {
                collapsible: true,
                collapsed: true,
            },
        },
        {
            name: 'media',
            title: 'Media',
            description:
                'Add images and videos for this project. At least one media item is required.',
        },
        {
            name: 'content',
            title: 'Content',
        },
    ],

    fields: [
        defineField({
            name: 'title',
            title: 'Title*',
            type: 'string',
            validation: (rule) => rule.required().error('Title is required.'),
            fieldset: 'basic',
        }),
        defineField({
            name: 'client',
            title: 'Client/Primary Collaborator*',
            description:
                'The main associated name for this project, such as a client, brand, publication, agency, or key collaborator.',
            type: 'string',
            validation: (rule) => rule.required().error('Client/Primary Collaborator is required.'),
            fieldset: 'basic',
        }),
        defineField({
            name: 'date',
            title: 'Project Date*',
            description:
                'Only the year will be displayed on the site, but you can provide a full date for better organization and future flexibility.',
            type: 'date',
            validation: (rule) => rule.required().error('Add a project date in YYYY-MM-DD format.'),
            options: {
                dateFormat: 'YYYY-MM-DD',
            },
            fieldset: 'basic',
        }),
        defineField({
            name: 'slug',
            title: 'Slug*',
            description:
                'The slug is the URL path for this project page. It will be auto-generated from the title but can be customized if needed.',
            type: 'slug',
            options: {source: 'title', maxLength: 96},
            validation: (rule) =>
                rule
                    .required()
                    .error('Slug is required for the project URL. Click "Generate" if empty.'),
            fieldset: 'basic',
        }),
        defineField({
            name: 'projectType',
            title: 'Project Type*',
            type: 'array',
            validation: (rule) => rule.required().error('Select project type.'),
            of: [
                {
                    type: 'reference',
                    to: [{type: 'projectType'}],
                    options: {disableNew: true},
                },
            ],
            fieldset: 'basic',
        }),
        defineField({
            name: 'featured',
            title: 'Featured Project',
            type: 'boolean',
            options: {
                layout: 'checkbox',
            },
            initialValue: false,
            fieldset: 'basic',
        }),
        defineField({
            name: 'projectFormat',
            title: 'Project Format*',
            description:
                'Choose Video only when the project card should use a preview clip. Choose Photo for photo-led projects, even if they include BTS or supporting videos.',
            type: 'string',
            options: {
                list: [
                    {title: 'Photo', value: 'photo'},
                    {title: 'Video', value: 'video'},
                ],
                layout: 'radio',
            },
            initialValue: 'photo',
            validation: (rule) =>
                rule.required().error('Choose whether this is a photo or video project.'),
            fieldset: 'basic',
        }),
        defineField({
            name: 'personalities',
            title: 'Personalities',
            type: 'array',
            validation: (rule) => rule.unique(),
            of: [
                {
                    type: 'reference',
                    to: [{type: 'personality'}],
                },
            ],
            fieldset: 'collaborators',
        }),
        defineField({
            name: 'brands',
            title: 'Brands',
            type: 'array',
            validation: (rule) => rule.unique(),
            of: [
                {
                    type: 'reference',
                    to: [{type: 'brand'}],
                },
            ],
            fieldset: 'collaborators',
        }),
        defineField({
            name: 'media',
            title: 'Project Media*',
            description:
                'Add images, uploaded videos, and video URLs in the exact order they should appear on the project page.',
            type: 'array',
            of: [
                defineArrayMember({
                    name: 'image',
                    title: 'Image',
                    type: 'image',
                    options: {hotspot: true},
                }),
                defineArrayMember({
                    name: 'uploadedVideo',
                    type: 'file',
                    title: 'Uploaded Video',
                    fields: [
                        defineField({
                            name: 'thumbnail',
                            title: 'Thumbnail*',
                            description: 'Required image used as the video thumbnail.',
                            type: 'image',
                            options: {
                                hotspot: true,
                            },
                            validation: (Rule) =>
                                Rule.required().error('Add a thumbnail for this uploaded video.'),
                        }),
                    ],
                    options: {
                        accept: 'video/mp4',
                        storeOriginalFilename: true,
                    },
                    preview: {
                        select: {
                            fileName: 'asset.originalFilename',
                            media: 'thumbnail',
                        },
                        prepare({fileName, media}) {
                            return {
                                title: fileName || 'Untitled',
                                media,
                            }
                        },
                    },
                    validation: (Rule) =>
                        Rule.required().custom(async (file, context) => {
                            const assetRef = file?.asset?._ref

                            if (!assetRef) {
                                return true
                            }

                            const client = context.getClient({apiVersion: '2024-01-01'})
                            const size = await client.fetch<number | null>(
                                '*[_id == $assetRef][0].size',
                                {assetRef},
                            )

                            if (size && size > MAX_VIDEO_FILE_SIZE_BYTES) {
                                return `Video files should be under ${MAX_VIDEO_FILE_SIZE_MB}MB. Export a web-optimized MP4.`
                            }

                            return true
                        }),
                }),
                defineArrayMember({
                    type: 'object',
                    name: 'videoUrl',
                    title: 'Video URL',
                    fields: [
                        defineField({
                            name: 'url',
                            title: 'URL',
                            description:
                                'Full URL to your video (YouTube or Vimeo). The video will appear in the project view.',
                            type: 'url',
                            validation: (Rule) =>
                                Rule.required()
                                    .uri({allowRelative: false, scheme: ['http', 'https']})
                                    .error(
                                        'Enter a valid Youtube or Vimeo URL starting with https:// or http://',
                                    ),
                        }),
                        defineField({
                            name: 'thumbnail',
                            title: 'Thumbnail',
                            description:
                                'Optional image used as this video link thumbnail. Default YouTube/Vimeo thumbnails are used if empty.',
                            type: 'image',
                            options: {
                                hotspot: true,
                            },
                        }),
                    ],
                    preview: {
                        select: {
                            url: 'url',
                            media: 'thumbnail',
                        },
                        prepare({url, media}) {
                            return {
                                title: url || 'Untitled',
                                media,
                            }
                        },
                    },
                }),
            ],
            validation: (rule) =>
                rule
                    .required()
                    .min(1)
                    .error('Add at least one image, uploaded video, or video URL.'),
            fieldset: 'media',
        }),
        defineField({
            name: 'coverImage',
            title: 'Cover Image*',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (Rule) =>
                Rule.required().error('Cover image is required for project cards.'),
            fieldset: 'media',
        }),
        defineField({
            name: 'previewClip',
            title: 'Preview Clip*',
            description:
                'Required for video projects. Upload a 3-5 second MP4 used for project-card hover previews.',
            type: 'file',
            hidden: ({document}) => document?.projectFormat !== 'video',
            options: {
                accept: 'video/mp4',
                storeOriginalFilename: true,
            },
            validation: (Rule) =>
                Rule.custom((file, context) => {
                    const projectFormat = (
                        context.document as {projectFormat?: 'photo' | 'video'} | undefined
                    )?.projectFormat

                    if (projectFormat === 'video' && !file?.asset?._ref) {
                        return 'Add a 3-5 second preview clip for video projects.'
                    }

                    return true
                }),
            fieldset: 'media',
        }),
        defineField({
            name: 'description',
            title: 'Project Description',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'block',
                    marks: {
                        annotations: [
                            {
                                name: 'link',
                                type: 'object',
                                title: 'Link',
                                fields: [
                                    {name: 'href', type: 'url', title: 'Url'},
                                    {
                                        title: 'Open in new tab',
                                        name: 'blank',
                                        type: 'boolean',
                                    },
                                ],
                            },
                        ],
                    },
                    styles: [],
                }),
            ],
            fieldset: 'content',
        }),
        defineField({
            name: 'credits',
            title: 'Credits',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    name: 'credit',
                    title: 'Credit',
                    fields: [
                        defineField({
                            name: 'role',
                            title: 'Role*',
                            type: 'string',
                            validation: (Rule) => Rule.required().error('Credit role is required.'),
                        }),
                        defineField({
                            name: 'name',
                            title: 'Name*',
                            type: 'string',
                            validation: (Rule) => Rule.required().error('Credit name is required.'),
                        }),
                        defineField({
                            name: 'link',
                            title: 'External Link',
                            type: 'url',
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'role',
                            subtitle: 'name',
                        },
                    },
                }),
            ],
            fieldset: 'content',
        }),
        orderRankField({type: 'project'}),
    ],

    preview: {
        select: {
            title: 'title',
            media: 'coverImage',
            date: 'date',
            client: 'client',
        },

        prepare({title, media, date, client}) {
            const dateObj = date ? new Date(date) : null

            let subtitle = ''

            if (dateObj) {
                subtitle = dateObj.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                })

                if (client) {
                    subtitle += ` • ${client}`
                }
            } else {
                subtitle = client
            }
            return {
                title,
                media,
                subtitle,
            }
        },
    },

    orderings: [
        {
            title: 'Project Date, newest first',
            name: 'dateDesc',
            by: [{field: 'date', direction: 'desc'}],
        },
        {
            title: 'Project Date, oldest first',
            name: 'dateAsc',
            by: [{field: 'date', direction: 'asc'}],
        },
    ],
})
