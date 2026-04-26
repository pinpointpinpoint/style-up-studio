export default function getSafeMailto(email?: string) {
  const trimmedEmail = email?.trim()

  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return null
  }

  return `mailto:${encodeURIComponent(trimmedEmail)}`
}
