import { defineField, defineType } from "sanity";
import {UserIcon} from '@sanity/icons'

export default defineType({
  name: "personality",
  title: "Personalities",
  type: "document",
  // liveEdit: true,
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
    }),
  ]
});