import {StarFilledIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'styleUp',
  title: 'Style Up',
  type: 'document',
  icon: StarFilledIcon,
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
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
    },
    prepare({title, media}) {
      return {title, media, subtitle: 'Style Up'}
    },
  },
})
