/**
 * Image optimization utilities for runtime image handling
 */

interface ImageLoadOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Create an optimized image URL with proper sizing parameters
 */
export function getOptimizedImageUrl(
  src: string,
  _options: ImageLoadOptions = {}
): string {
  // * Destructuring for future use when image CDN is integrated
  // const { width, height, quality = 85, format } = options;
  
  // * For now, return the original source
  // ! PERFORMANCE: * In production, this would integrate with an image CDN or optimization service
  return src;
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  baseSrc: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string {
  return widths
    .map(width => `${getOptimizedImageUrl(baseSrc, { width })} ${width}w`)
    .join(', ');
}

/**
 * Calculate optimal image dimensions based on container
 */
export function calculateOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  imageAspectRatio: number
): { width: number; height: number } {
  const containerAspectRatio = containerWidth / containerHeight;
  
  if (containerAspectRatio > imageAspectRatio) {
    // * Container is wider than image
    return {
      width: Math.round(containerHeight * imageAspectRatio),
      height: containerHeight
    };
  } else {
    // * Container is taller than image
    return {
      width: containerWidth,
      height: Math.round(containerWidth / imageAspectRatio)
    };
  }
}

/**
 * Check if browser supports modern image formats
 */
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
};

export const supportsAvif = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('image/avif') === 0;
};

/**
 * Get the best supported image format
 */
export function getBestImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (supportsAvif()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
}