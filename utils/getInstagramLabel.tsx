export default function getInstagramLabel(profileUrl?: string | null) {
  const trimmedProfileUrl = profileUrl?.trim()

  if (!trimmedProfileUrl) return null

  try {
    const { pathname } = new URL(trimmedProfileUrl)
    const handle = pathname.split('/').filter(Boolean)[0]

    return handle ? `@${handle}` : trimmedProfileUrl
  } catch {
    return trimmedProfileUrl
  }
}
