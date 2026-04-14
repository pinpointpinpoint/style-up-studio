import {StarFilledIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'styleUp',
  title: 'Style Up',
  type: 'document',
  icon: StarFilledIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name*',
      type: 'string',
      validation: (rule) => rule.required().error('Name is required.'),
    }),
    defineField({
      name: 'image',
      title: 'Image*',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required().error('Image is required.'),
    }),
  ],
  preview: {
    select: {
      name: 'name',
      media: 'image',
    },
    prepare({name, media}) {
      return {title: name, media}
    },
  },
})
