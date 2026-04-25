export function isValidEmail(email: string): boolean {
  const e = (email ?? '').trim()
  if (!e) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

export function isValidNepalPhone(phone: string): boolean {
  const p = (phone ?? '').trim()
  return /^\+977-\d{10}$/.test(p)
}

export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
  const maxBytes = 10 * 1024 * 1024

  if (!file) return { valid: false, error: 'No file provided.' }
  if (!allowedTypes.has(file.type)) {
    return { valid: false, error: 'Unsupported file type. Use JPG, PNG, or WebP.' }
  }
  if (file.size > maxBytes) {
    return { valid: false, error: 'File is too large. Max size is 10 MB.' }
  }
  return { valid: true }
}

export function isValidMedicalId(id: string): boolean {
  const v = (id ?? '').trim().toUpperCase()
  if (v.length < 4 || v.length > 32) return false
  return /^[A-Z0-9-]+$/.test(v)
}
