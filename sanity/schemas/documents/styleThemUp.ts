import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'styleThemUp',
  title: 'Style Them Up',
  type: 'document',
  fields: [
    defineField({
      name: 'head',
      type: 'string',
    }),
    defineField({
      name: 'body',
      type: 'string',
    }),
    defineField({
      name: 'legs',
      type: 'string',
    }),
    defineField({
      name: 'date',
      type: 'datetime',
    })
  ],
})