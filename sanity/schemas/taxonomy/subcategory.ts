import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'subcategory',
  title: 'Subcategory',
  type: 'document',
  // liveEdit: true,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'parent',
      title: 'Project Type',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      parent: 'parent.title',
    },
    prepare({ title, parent }) {
      return {
        title,
        subtitle: parent ? `${parent}` : '',
      }
    },
  },
})