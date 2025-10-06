// ImageWithCaption removed from MVP - this file will be updated when images are re-added
// import { ImageWithCaption } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

// // DEPRECATED: TODO: * Temporary placeholder types until images are re-added to MVP
interface ImageWithCaption {
  id: string;
  data: string;
  caption?: string;
}

/**
 * Check if images are in the old format (array of strings)
 */
export function isLegacyImageFormat(images: unknown): images is string[] {
  if (!Array.isArray(images)) return false;
  return images.every(img => typeof img === 'string');
}

/**
 * Check if images are in the new format (array of ImageWithCaption)
 */
export function isNewImageFormat(images: unknown): images is ImageWithCaption[] {
  if (!Array.isArray(images)) return false;
  return images.every(img =>
    typeof img === 'object' &&
    img !== null &&
    'id' in img &&
    'data' in img &&
    typeof (img as ImageWithCaption).data === 'string'
  );
}

/**
 * Migrate legacy image format to new format with caption support
 */
export function migrateImagesToNewFormat(images: string[]): ImageWithCaption[] {
  return images.map((imageData) => ({
    id: uuidv4(),
    data: imageData,
    caption: undefined
  }));
}

/**
 * Normalize images to always return new format
 */
export function normalizeImages(images?: string[] | ImageWithCaption[]): ImageWithCaption[] {
  if (!images || !Array.isArray(images)) return [];
  
  if (isLegacyImageFormat(images)) {
    return migrateImagesToNewFormat(images);
  }
  
  if (isNewImageFormat(images)) {
    return images;
  }
  
  // * If neither format matches, return empty array
  return [];
}

/**
 * Get image data array for components that only need the data
 */
export function getImageDataArray(images: ImageWithCaption[]): string[] {
  return images.map(img => img.data);
}

/**
 * Ensure images are in the correct format (for type safety)
 */
export function ensureImageFormat(images: unknown): ImageWithCaption[] {
  return normalizeImages(images as string[] | ImageWithCaption[] | undefined);
}