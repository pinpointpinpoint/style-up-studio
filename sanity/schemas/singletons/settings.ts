import { CogIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'seo', title: 'SEO'},
    {name: 'filters', title: 'Sidebar Filters'},
  ],

  fields: [
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'title',
          title: 'Title*',
          type: 'string',
          description:
            'The main title of your website. Appears in the browser tab and search results. Maximum 60 characters.',
          validation: (Rule) =>
            Rule.required()
              .error('Title is required.')
              .max(60)
              .warning('Should be 60 characters or less.'),
        }),
        defineField({
          name: 'description',
          title: 'Meta Description*',
          type: 'text',
          description:
            'A short summary of your website. Appears in search results. Maximum 155 characters.',
          validation: (Rule) =>
            Rule.required()
              .error('Meta description is required.')
              .max(155)
              .warning('Should be 155 characters or less.'),
        }),
      ],
    }),
    defineField({
      name: 'sidebarFilters',
      title: 'Sidebar Filters',
      type: 'object',
      group: 'filters',
      fields: [
        defineField({
          name: 'showPersonalities',
          title: 'Show Personalities Filter',
          type: 'boolean',
          description: 'Show or hide the Personalities filter in the sidebar.'
        }),
        defineField({
          name: 'showBrands',
          title: 'Show Brands Filter',
          type: 'boolean',
          description: 'Show or hide the Brands filter in the sidebar.'
        }),
        defineField({
          name: 'showPublications',
          title: 'Show Publications Filter',
          type: 'boolean',
          description: 'Show or hide the Publications filter in the sidebar.'
        }),
      ],
    }),
  ],

  preview: {
    prepare() {
      return {
        title: 'Settings'
      }
    },
  },
})
