import {UserIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  icon: UserIcon,

  fields: [
    defineField({
        name: 'title',
        type: 'string',
        hidden: true,
        initialValue: 'About'
    }),
    defineField({
      name: 'image',
      title: 'About Image',
      type: 'image',
      description: 'Upload an image representing you or your brand.',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'blurb',
      title: 'About Text',
      description: 'A short paragraph or two about you.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          lists: [],
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
            decorators: [
              {title: 'Italic', value: 'em'},
              {title: 'Strong', value: 'strong'},
            ],
          },
          styles: [],
        }),
      ],
      validation: (rule) =>
        rule.required().max(500).warning('Keep your about section concise.'),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({title, media}) {
      return {
        title: title || 'About',
        media,
        subtitle: 'About Page',
      }
    },
  },
})
