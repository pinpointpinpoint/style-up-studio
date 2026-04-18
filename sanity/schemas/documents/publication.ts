import { defineField, defineType } from "sanity";
import {BookIcon} from '@sanity/icons'

export default defineType({
  name: "publication",
  title: "Publications",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required().error('Name is required.')
    }),
    defineField({
      name: 'slug',
      title: 'Slug*',
      description: 'The slug is the URL path for this publication page. It will be auto-generated from the name but can be customized if needed.',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) =>
        Rule.required().error('Slug is required for this publicaton. Click "Generate" if empty.'),
    }),
  ]
});
