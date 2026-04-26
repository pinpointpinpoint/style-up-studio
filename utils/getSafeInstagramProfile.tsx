export default function getSafeInstagramProfile(value?: string | null) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) return null

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`,
    )

    const hostname = url.hostname.toLowerCase()

    if (hostname !== 'instagram.com' && hostname !== 'www.instagram.com') {
      return null
    }

    const handle = url.pathname.split('/').filter(Boolean)[0]

    if (!handle) return null

    return {
      href: url.toString(),
      label: `@${handle}`,
    }
  } catch {
    return null
  }
}