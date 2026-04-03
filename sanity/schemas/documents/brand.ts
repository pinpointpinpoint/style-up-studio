import { defineField, defineType } from "sanity";
import {TagIcon} from '@sanity/icons'

export default defineType({
  name: "brand",
  title: "Brands",
  type: "document",
  // liveEdit: true,
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    })
  ]
});