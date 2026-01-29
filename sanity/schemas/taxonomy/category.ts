import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  // liveEdit: true,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
