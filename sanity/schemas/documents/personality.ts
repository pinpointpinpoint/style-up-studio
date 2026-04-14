import { defineField, defineType } from "sanity";
import { UserIcon } from '@sanity/icons'

export default defineType({
  name: "personality",
  title: "Personalities",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name*",
      type: "string",
      validation: (Rule) => Rule.required().error('Name is required.')
    })
  ]
});