import { UserIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

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
      initialValue: 'About',
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      description: 'Your photo or brand image displayed in the About section.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'bio',
      title: 'Bio*',
      type: 'text',
      description: 'A short bio displayed in the About section. Maximum 150 characters.',
      validation: (Rule) =>
        Rule.required()
          .max(150)
          .warning('Should be 150 characters or less.'),
    }),
  ],

  preview: {
    prepare() {
      return {
        title: 'About'
      }
    },
  },
})