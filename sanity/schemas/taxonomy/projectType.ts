import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'projectType',
  title: 'Project Type',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title*',
      description: 'The name of the project type. This will be used as a filter option in the sidebar.',
      type: 'string',
      validation: (Rule) => Rule.required().error('Title is required.'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})