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
    defineField({
      name: 'slug',
      title: 'Slug*',
      description: 'The slug is the URL path for this project type page. It will be auto-generated from the title but can be customized if needed.',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) =>
        Rule.required().error('Slug is required for the project type. Click "Generate" if empty.'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})