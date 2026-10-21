/**
 * File upload validation — server-side only.
 *
 * Validates uploaded files against:
 *   1. MIME type allowlist (from Content-Type header)
 *   2. Magic bytes / file signature (first bytes of the file)
 *   3. File size limit
 *   4. File extension
 *
 * Using ONLY the Content-Type header is insufficient — attackers can
 * change headers trivially. Magic bytes are harder to fake because
 * they must be present in the actual file content.
 *
 * Usage in an API route:
 *   const result = await validateUpload(file)
 *   if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 })
 */

// Maximum file size: 5 MB for images, 2 MB for documents
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024   // 5 MB
export const MAX_DOC_SIZE_BYTES   = 2 * 1024 * 1024   // 2 MB

// Allowed MIME types and their magic bytes
// magic: array of [offset, bytes] pairs — ALL must match
interface MimeSpec {
  extensions: string[]
  maxBytes:   number
  magic:      Array<{ offset: number; bytes: number[] }>
}

const ALLOWED_MIME_TYPES: Record<string, MimeSpec> = {
  'image/jpeg': {
    extensions: ['jpg', 'jpeg'],
    maxBytes:   MAX_IMAGE_SIZE_BYTES,
    magic:      [{ offset: 0, bytes: [0xFF, 0xD8, 0xFF] }],
  },
  'image/png': {
    extensions: ['png'],
    maxBytes:   MAX_IMAGE_SIZE_BYTES,
    magic:      [{ offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] }],
  },
  'image/webp': {
    extensions: ['webp'],
    maxBytes:   MAX_IMAGE_SIZE_BYTES,
    // WebP: RIFF....WEBP
    magic:      [
      { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
      { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // WEBP
    ],
  },
  'image/gif': {
    extensions: ['gif'],
    maxBytes:   MAX_IMAGE_SIZE_BYTES,
    magic:      [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }], // GIF8
  },
  'image/heic': {
    extensions: ['heic', 'heif'],
    maxBytes:   MAX_IMAGE_SIZE_BYTES,
    // HEIC is a container; ftyp box at byte 4 with brand 'heic' or 'mif1'
    magic:      [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }], // ftyp
  },
  'application/pdf': {
    extensions: ['pdf'],
    maxBytes:   MAX_DOC_SIZE_BYTES,
    magic:      [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  },
}

export type UploadValidationResult =
  | { ok: true;  mimeType: string; extension: string }
  | { ok: false; reason: string }

/**
 * Validate a File object from a multipart form upload.
 *
 * @param file         The File/Blob from the form data
 * @param allowedTypes Optional subset of ALLOWED_MIME_TYPES keys (defaults to all)
 */
export async function validateUpload(
  file: File,
  { allowedTypes }: { allowedTypes?: string[] } = {}
): Promise<UploadValidationResult> {
  // ── MIME type from header ─────────────────────────────────────────────────────
  const claimedMime = file.type?.toLowerCase().split(';')[0].trim()
  if (!claimedMime) {
    return { ok: false, reason: 'File has no Content-Type' }
  }

  const spec = ALLOWED_MIME_TYPES[claimedMime]
  if (!spec) {
    return { ok: false, reason: `File type '${claimedMime}' is not allowed` }
  }

  // Filter by caller-provided allowlist
  if (allowedTypes && !allowedTypes.includes(claimedMime)) {
    return { ok: false, reason: `File type '${claimedMime}' is not allowed here` }
  }

  // ── File size ─────────────────────────────────────────────────────────────────
  if (file.size === 0) {
    return { ok: false, reason: 'File is empty' }
  }
  if (file.size > spec.maxBytes) {
    const limitMb = (spec.maxBytes / 1024 / 1024).toFixed(0)
    return { ok: false, reason: `File exceeds ${limitMb} MB limit` }
  }

  // ── Extension from filename ───────────────────────────────────────────────────
  const nameParts = (file.name ?? '').split('.')
  const ext = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : ''
  if (!spec.extensions.includes(ext)) {
    return {
      ok: false,
      reason: `File extension '.${ext}' does not match type '${claimedMime}'`,
    }
  }

  // ── Magic bytes — read first 16 bytes ────────────────────────────────────────
  const HEADER_SIZE = 16
  const headerSlice = file.slice(0, HEADER_SIZE)
  const buffer = await headerSlice.arrayBuffer()
  const bytes  = new Uint8Array(buffer)

  for (const { offset, bytes: magic } of spec.magic) {
    for (let i = 0; i < magic.length; i++) {
      if (bytes[offset + i] !== magic[i]) {
        return {
          ok: false,
          reason: `File content does not match claimed type '${claimedMime}'`,
        }
      }
    }
  }

  return { ok: true, mimeType: claimedMime, extension: ext }
}

/**
 * Validate multiple files (e.g. a photo gallery upload).
 * Returns error on first invalid file.
 */
export async function validateUploads(
  files: File[],
  opts: { allowedTypes?: string[]; maxCount?: number } = {}
): Promise<UploadValidationResult> {
  const { maxCount = 5 } = opts
  if (files.length === 0) return { ok: false, reason: 'No files provided' }
  if (files.length > maxCount) return { ok: false, reason: `Too many files (max ${maxCount})` }

  for (let i = 0; i < files.length; i++) {
    const result = await validateUpload(files[i], opts)
    if (!result.ok) return { ok: false, reason: `File ${i + 1}: ${result.reason}` }
  }

  return { ok: true, mimeType: files[0].type, extension: files[0].name.split('.').pop() ?? '' }
}

/**
 * Sanitize a filename for safe storage (strip path separators, control chars).
 * Always returns a safe ASCII basename with a validated extension.
 */
export function sanitizeFilename(name: string, ext: string): string {
  const base = name
    .replace(/[^a-zA-Z0-9_\-. ]/g, '')  // keep only safe chars
    .replace(/\s+/g, '_')                 // spaces → underscores
    .replace(/\.{2,}/g, '.')             // no .. path traversal
    .slice(0, 80)                         // max 80 chars
    .trim()
    || 'upload'
  return `${base}.${ext}`
}
