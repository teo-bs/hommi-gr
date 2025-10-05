import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

/**
 * Compress an image file before upload
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 2,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    fileType: 'image/jpeg', // Convert to JPEG for better compression
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    console.log(`Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    const compressedFile = await imageCompression(file, compressionOptions);
    
    console.log(
      `Compressed: ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)}MB) - ` +
      `${Math.round(((file.size - compressedFile.size) / file.size) * 100)}% reduction`
    );
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(files.map(file => compressImage(file, options)));
}

/**
 * Get compression preview stats without actually compressing
 */
export function getImageStats(file: File): {
  name: string;
  sizeMB: number;
  type: string;
} {
  return {
    name: file.name,
    sizeMB: parseFloat((file.size / 1024 / 1024).toFixed(2)),
    type: file.type,
  };
}
