import { defineField, defineType } from "sanity";
import { TagIcon } from '@sanity/icons'

export default defineType({
  name: "brand",
  title: "Brands",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name*",
      type: "string",
      validation: (Rule) => Rule.required().error('Name is required.')
    }),
    defineField({
      name: 'slug',
      title: 'Slug*',
      description: 'The slug is the URL path for this brand page. It will be auto-generated from the name but can be customized if needed.',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) =>
        rule.required().error('Slug is required for this brand. Click "Generate" if empty.'),
    }),
  ]
});