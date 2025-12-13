import {ProjectsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'This field is the title of your project.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Project Date',
      type: 'date',
      validation: (rule) => rule.required(),
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
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
              title: 'Role / Title',
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
    }),

    // ------------------------------------------------------------
    // ⭐ MULTIPLE VIDEO FILES (clean + structured)
    // ------------------------------------------------------------
    defineField({
      name: 'videos',
      title: 'Project Videos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'video',
          title: 'Video Upload',
          fields: [
            defineField({
              name: 'title',
              title: 'Video Title (optional)',
              type: 'string',
            }),
            defineField({
              name: 'file',
              title: 'Video File',
              type: 'file',
              options: {
                accept: 'video/*',
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'file.asset.originalFilename',
            },
          },
        }),
      ],
    }),

    // ------------------------------------------------------------
    // ⭐ MULTIPLE VIDEO URLS (YouTube, Vimeo, TikTok, etc.)
    // ------------------------------------------------------------
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
          preview: {
            select: {
              title: 'title',
              subtitle: 'url',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      description: 'Upload multiple images for this project. Bulk upload supported.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            {
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Alternative text for screenreaders. Falls back on caption if not set',
            },
          ],
        }),
      ],
      options: {layout: 'grid'},
    }),

    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Choose a cover image from the gallery.',
      options: {hotspot: true},
      fields: [{name: 'alt', title: 'Alt text', type: 'string'}],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory',
      type: 'reference',
      to: [{type: 'subcategory'}],
      options: {
        filter: ({document}) => {
          const doc = document as any
          const categoryId = doc?.category?._ref

          return categoryId
            ? {
                filter: 'parent._ref == $categoryId',
                params: {categoryId},
              }
            : {
                filter: 'false',
              }
        },
      },
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
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
    },
    prepare({title, media}) {
      return {title, media, subtitle: 'Project'}
    },
  },
})