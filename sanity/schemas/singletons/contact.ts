import { EnvelopeIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      hidden: true,
      initialValue: 'Contact',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      description: 'Your email will be a clickable link in the Contact section.',
      validation: (Rule) =>
        Rule.required()
          .email()
          .error('Enter a valid email address.'),
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'url',
      description: 'Full Instagram profile URL. Displays as @username in the Contact section.',
      validation: (Rule) =>
        Rule.required()
          .uri({ allowRelative: false, scheme: ['http', 'https'] })
          .error('Enter a valid URL starting with https:// or http://.'),
    })
  ],

  preview: {
    prepare() {
      return {
        title: 'Contact'
      }
    },
  },
})