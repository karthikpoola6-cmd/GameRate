/**
 * IGDB Image URL Generator
 *
 * Available sizes:
 * - cover_small: 90x128
 * - cover_big: 264x374
 * - screenshot_med: 569x320
 * - screenshot_big: 889x500
 * - screenshot_huge: 1280x720
 * - logo_med: 284x160
 * - thumb: 90x90
 * - micro: 35x35
 * - 720p: 1280x720
 * - 1080p: 1920x1080
 */

export type ImageSize =
  | 'cover_small'
  | 'cover_big'
  | 'screenshot_med'
  | 'screenshot_big'
  | 'screenshot_huge'
  | 'logo_med'
  | 'thumb'
  | 'micro'
  | '720p'
  | '1080p'

export function getImageUrl(imageId: string, size: ImageSize = 'cover_big'): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`
}

export function getCoverUrl(imageId: string, size: 'cover_small' | 'cover_big' = 'cover_big'): string {
  return getImageUrl(imageId, size)
}

export function getScreenshotUrl(
  imageId: string,
  size: 'screenshot_med' | 'screenshot_big' | 'screenshot_huge' | '720p' | '1080p' = 'screenshot_big'
): string {
  return getImageUrl(imageId, size)
}
