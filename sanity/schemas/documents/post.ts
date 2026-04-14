import { defineField, defineType } from "sanity";
import { ComposeSparklesIcon } from '@sanity/icons'

export default defineType({
  name: "post",
  title: "Remix Wall",
  type: "document",
  icon: ComposeSparklesIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name*",
      type: "string",
      validation: (Rule) => Rule.required().error('Name is required.'),
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL*",
      type: "url",
      validation: (Rule) =>
        Rule.required()
          .uri({allowRelative: false, scheme: ['http', 'https']})
          .error('Enter a valid URL starting with https://')
    }),
    defineField({
      name: "postedAt",
      title: "Posted At",
      type: "datetime",
    })
  ]
});
