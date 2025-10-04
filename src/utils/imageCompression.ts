// * Image compression utilities for optimizing images before storage

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Compress an image file using Canvas API
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // * Calculate new dimensions
        let { width, height } = img;
        
        // * Scale down if needed
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        // * Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = width;
        canvas.height = height;

        // * Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // * Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // * Convert to compressed format
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // * Convert blob to base64
            const blobReader = new FileReader();
            blobReader.onloadend = () => {
              if (typeof blobReader.result === 'string') {
                resolve(blobReader.result);
              } else {
                reject(new Error('Failed to convert to base64'));
              }
            };
            blobReader.readAsDataURL(blob);
          },
          format,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result && typeof e.target.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Calculate the size of a base64 string in bytes
 */
export function getBase64Size(base64String: string): number {
  // TODO: * Remove data URL prefix if present
  const base64 = base64String.split(',')[1] || base64String;
  
  // * Calculate size in bytes
  const padding = (base64.match(/[=]/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if file is an animated image (GIF)
 */
export function isAnimatedImage(file: File): boolean {
  return file.type === 'image/gif';
}

/**
 * Get optimal compression settings based on file type and size
 */
export function getOptimalCompressionSettings(file: File): CompressionOptions {
  const fileSizeMB = file.size / (1024 * 1024);
  
  // * For small images, use less aggressive compression
  if (fileSizeMB < 0.5) {
    return {
      quality: 0.95,
      maxWidth: 2048,
      maxHeight: 2048
    };
  }
  
  // * For medium images, use moderate compression
  if (fileSizeMB < 2) {
    return {
      quality: 0.85,
      maxWidth: 1920,
      maxHeight: 1080
    };
  }
  
  // * For large images, use more aggressive compression
  return {
    quality: 0.75,
    maxWidth: 1280,
    maxHeight: 720
  };
}