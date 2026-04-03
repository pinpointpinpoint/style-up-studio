import {ProjectsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField} from '@sanity/orderable-document-list'

// FINALIZED WRITE DOCS FOR IT

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
      validation: (rule) => rule.required(),
      fieldset: 'basic',
    }),
    defineField({
      name: 'client',
      title: 'Client*',
      type: 'string',
      validation: (rule) => rule.required(),
      fieldset: 'basic',
    }),
    defineField({
      name: 'date',
      title: 'Project Date*',
      description: 'Only the year will be displayed on the site, but you can provide a full date for better organization and future flexibility.',
      type: 'date',
      validation: (rule) => rule.required(),
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
      validation: (rule) => rule.required(),
      fieldset: 'basic',
    }),
    defineField({
      name: 'projectType',
      title: 'Project Type*',
      type: 'reference',
      to: [{type: 'projectType'}],
      validation: (rule) => rule.required(),
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
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string'
            }
          ],
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
          fields: [
            {
              name: 'title',
              title: 'Video Title (optional)',
              type: 'string',
            },
          ],
          preview: {
            select: {
              title: 'title',
              fileName: 'asset.originalFilename',
            },
            prepare({title, fileName}) {
              return {
                title: title || fileName || 'Untitled',
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
              name: 'title',
              title: 'Video Title (optional)',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Paste a YouTube, Vimeo, TikTok, etc. link',
              validation: (Rule) => Rule.required(),
            }),
          ],
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
      validation: (Rule) => Rule.required(),
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
              title: 'Role',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'link',
              title: 'External Link (optional)',
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