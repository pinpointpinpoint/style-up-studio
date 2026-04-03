import { defineField, defineType } from "sanity";
import {BookIcon} from '@sanity/icons'

export default defineType({
  name: "publication",
  title: "Publications",
  type: "document",
  // liveEdit: true,
  icon: BookIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    })
  ]
});