import { defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export default defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'caption', title: 'Caption', type: 'string' },
        { name: 'alt', title: 'Alt Text', type: 'string' },
      ],
    }),
  ],
})
