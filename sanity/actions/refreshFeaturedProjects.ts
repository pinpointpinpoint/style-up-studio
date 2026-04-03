import { RefreshIcon } from '@sanity/icons'

export default {
  name: 'refreshFeaturedProjects',
  icon: RefreshIcon,
  title: 'Refresh Featured Projects',
  type: 'document',
  show: ({ type }) => type === 'home',
  onHandle: async ({ document, client, resolve }) => {
    const featured = await client.fetch('*[_type == "project" && featured == true]{_id}')
    const refs = featured.map(p => ({ _type: 'reference', _ref: p._id }))
    await client.patch(document._id).set({ featuredProjects: refs }).commit()
    resolve({ success: true, message: 'Featured projects refreshed!' })
  },
}