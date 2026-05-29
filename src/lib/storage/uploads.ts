export const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

export function isAllowedImageMimeType(mimeType: string) {
  return allowedImageMimeTypes.includes(mimeType as (typeof allowedImageMimeTypes)[number]);
}

export function isWithinUploadLimit(fileSizeBytes: number, maxSizeBytes = 8 * 1024 * 1024) {
  return fileSizeBytes <= maxSizeBytes;
}