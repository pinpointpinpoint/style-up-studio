export default function getSafeHttpUrl(value?: string) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) return null

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`,
    )

    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}