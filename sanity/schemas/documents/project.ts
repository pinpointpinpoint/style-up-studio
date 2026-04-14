import {ProjectsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField} from '@sanity/orderable-document-list'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,
  fieldsets: [
    {
      name: 'basic', 
      title: 'Basic Info'
    },
    {
      name: 'collaborators',
      title: 'Collaborators',
      description: 'Add any personalities, publications, or brands that collaborated on this project.',
      options: {
        collapsible: true, 
        collapsed: true
      },
    },
    {
      name: 'media', 
      title: 'Media',
      description: 'Add images and videos for this project. At least one media item is required.',
    },
    {
      name: 'content', 
      title: 'Content'
    }
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
      title: 'Client*',
      type: 'string',
      validation: (rule) => rule.required().error('Client is required.'),
      fieldset: 'basic',
    }),
    defineField({
      name: 'date',
      title: 'Project Date*',
      description: 'Only the year will be displayed on the site, but you can provide a full date for better organization and future flexibility.',
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
      description: 'The slug is the URL path for this project page. It will be auto-generated from the title but can be customized if needed.',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) =>
        rule.required().error('Slug is required for the project URL. Click "Generate" if empty.'),
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
          options: { disableNew: true }
        },
      ],
      fieldset: 'basic'
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
      name: 'publications',
      title: 'Publications',
      type: 'array',
      validation: (rule) => rule.unique(),
      of: [
        {
          type: 'reference',
          to: [{type: 'publication'}],
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
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
        }),
      ],
      options: {layout: 'grid'},
      validation: (rule) =>
        rule.custom((_, context) => {
          const {gallery, videos, videoUrls} = context.document as {
            gallery?: unknown[]
            videos?: unknown[]
            videoUrls?: unknown[]
          }

          return [gallery, videos, videoUrls].some(
            (field) => Array.isArray(field) && field.length > 0,
          )
            ? true
            : 'Add at least one gallery image, uploaded video, or video URL'
        }),
      fieldset: 'media',
    }),
    defineField({
      name: 'videos',
      title: 'Project Videos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'file',
          title: 'Video File',
          options: {
            accept: 'video/mp4',
            storeOriginalFilename: true,
          },
          preview: {
            select: {
              fileName: 'asset.originalFilename',
            },
            prepare({fileName}) {
              return {
                title: fileName || 'Untitled',
              }
            },
          },
          validation: (Rule) => Rule.required(),
        }),
      ],
      options: {
        sortable: true,
      },
      fieldset: 'media',
    }),
    defineField({
      name: 'videoUrls',
      title: 'Video URLs',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'videoUrlItem',
          title: 'Video URL',
          fields: [
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Full URL to your video. (e.g., YouTube, Vimeo, or TikTok). The video will appear in the project view.',
              validation: (Rule) =>
                Rule.required()
                  .uri({allowRelative: false, scheme: ['http', 'https']})
                  .error('Enter a valid URL starting with https:// or http://'),
            }),
          ],
          preview: {
            select: {
              url: 'url',
            },
            prepare({url}) {
              return {
                title: url || 'Untitled',
              }
            },
          },
        }),
      ],
      fieldset: 'media',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image*',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('Cover image is required for project cards.'),
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
                fields: [{name: 'href', type: 'url', title: 'Url'}],
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
              type: 'url'
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
