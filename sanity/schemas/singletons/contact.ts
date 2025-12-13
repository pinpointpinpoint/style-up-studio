import {EnvelopeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  icon: EnvelopeIcon,

  fields: [
    // Hidden singleton title field
    defineField({
      name: 'title',
      type: 'string',
      hidden: true,
      initialValue: 'Contact',
    }),
    defineField({
    name: 'email',
    title: 'Email',
    type: 'string',
    validation: (rule) =>
        rule
        .required()
        .email()
        .error('Please enter a valid email address.'),
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'url',
      validation: (rule) => rule.uri({allowRelative: false}).required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Contact',
        subtitle: 'Contact Page',
      }
    },
  },
})
