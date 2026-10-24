/**
 * Client-Side Image Resizing & Compression Utility
 * Optimizes high-resolution mobile camera photos (5MB - 15MB) into
 * sharp, bandwidth-efficient JPEG payloads (~150KB - 250KB) for rapid Gemini Vision inference.
 */

export interface CompressedImageResult {
  base64: string;
  mimeType: string;
  previewUrl: string;
  originalSizeBytes?: number;
  compressedSizeBytes?: number;
  width: number;
  height: number;
}

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const MAX_TARGET_DIMENSION = 1200; // 1200px max width/height retains fine plant pathology details
const JPEG_QUALITY = 0.82; // Optimal balance between visual fidelity and small payload (<250KB)

/**
 * Validates and compresses an image (from a File or base64 Data URL)
 */
export async function compressCropImage(
  input: File | string,
  maxDimension: number = MAX_TARGET_DIMENSION,
  quality: number = JPEG_QUALITY
): Promise<CompressedImageResult> {
  let sourceUrl = '';
  let mimeType = 'image/jpeg';
  let originalSize = 0;

  if (typeof input === 'string') {
    sourceUrl = input;
    const match = input.match(/^data:([^;]+);base64,/);
    if (match) {
      mimeType = match[1].toLowerCase();
    }
    originalSize = Math.round((input.length * 3) / 4);
  } else if (input instanceof File) {
    mimeType = input.type.toLowerCase();
    originalSize = input.size;

    // Validate mime type
    if (mimeType && !SUPPORTED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Unsupported image format (${mimeType || 'unknown'}). Please upload a JPEG, PNG, or WebP photo.`);
    }

    sourceUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file from device storage.'));
      reader.readAsDataURL(input);
    });
  } else {
    throw new Error('Invalid image input provided.');
  }

  // Load image element to measure natural dimensions
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to decode image data. Please try another photo.'));
    image.src = sourceUrl;
  });

  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  if (origWidth < 30 || origHeight < 30) {
    throw new Error('Image resolution is too low to perform plant pathology analysis. Please upload a clear photo.');
  }

  // Calculate target dimensions maintaining aspect ratio
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (origWidth > maxDimension || origHeight > maxDimension) {
    if (origWidth >= origHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.round((origHeight * maxDimension) / origWidth);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((origWidth * maxDimension) / origHeight);
    }
  }

  // Render to canvas with high smoothing quality
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    // Canvas context fallback
    return {
      base64: sourceUrl,
      mimeType,
      previewUrl: sourceUrl,
      originalSizeBytes: originalSize,
      compressedSizeBytes: originalSize,
      width: origWidth,
      height: origHeight,
    };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Export as compressed JPEG
  const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);

  return {
    base64: compressedDataUrl,
    mimeType: 'image/jpeg',
    previewUrl: compressedDataUrl,
    originalSizeBytes: originalSize,
    compressedSizeBytes: compressedSize,
    width: targetWidth,
    height: targetHeight,
  };
}
