import { isValidImageFile } from '@/utils/validators'

export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image.'))
    })
    img.src = url
    await loaded
    return { width: img.naturalWidth, height: img.naturalHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  const precision = unit === 0 ? 0 : size < 10 ? 1 : 0
  return `${size.toFixed(precision)} ${units[unit]}`
}

export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

export function validateFundusImage(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const { valid, error } = isValidImageFile(file)
  if (!valid && error) errors.push(error)
  return { valid: errors.length === 0, errors }
}
