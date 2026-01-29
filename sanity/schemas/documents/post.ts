import { defineField, defineType } from "sanity";
import {ConfettiIcon} from '@sanity/icons'

export default defineType({
  name: "post",
  title: "Remix Wall",
  type: "document",
  // liveEdit: true,
  icon: ConfettiIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL",
      type: "url",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "postedAt",
      title: "Posted At",
      type: "datetime",
    })
  ]
});