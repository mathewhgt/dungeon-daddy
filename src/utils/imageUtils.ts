/**
 * Image processing utilities for safe uploads, resizing, and token generation.
 * Prevents memory overflows, localStorage QuotaExceeded errors, and renderer freezes
 * when users upload large GIFs, high-res photos, or heavy image files.
 */

export interface ProcessedImageResult {
  avatarUrl: string;
  tokenUrl: string;
  warning?: string;
}

/**
 * Safely processes an uploaded image file (PNG, JPG, WebP, GIF, SVG).
 * Automatically resizes large images and creates high-performance token thumbnails.
 */
export async function processImageUpload(
  file: File,
  isTokenOnly = false
): Promise<ProcessedImageResult> {
  const maxAvatarDim = 600; // max 600px dimension for avatar
  const maxTokenDim = 256;  // max 256px dimension for circular token
  const fileSizeMb = file.size / (1024 * 1024);

  // If it's an animated GIF
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

  // If it's a small GIF (< 2MB) and user uploaded it as an avatar:
  // preserve the animated GIF as base64, but generate a static circular token to prevent lag
  if (isGif && fileSizeMb <= 2.5) {
    const rawBase64 = await readFileAsDataUrl(file);
    let tokenUrl = rawBase64;
    try {
      tokenUrl = await createCircularTokenFromImage(rawBase64, maxTokenDim);
    } catch {
      tokenUrl = rawBase64;
    }
    return {
      avatarUrl: rawBase64,
      tokenUrl: isTokenOnly ? tokenUrl : tokenUrl,
    };
  }

  // If it's a large GIF (> 2.5MB) or standard image:
  // Convert/resize via canvas to ensure stable performance and avoid storage crashes
  try {
    const rawDataUrl = await readFileAsDataUrl(file);
    const img = await loadImageElement(rawDataUrl);

    // Create optimized avatar
    const avatarUrl = await resizeImageViaCanvas(img, maxAvatarDim, isGif ? 'image/png' : 'image/webp', 0.88);

    // Create circular token
    const tokenUrl = await createCircularTokenFromImage(rawDataUrl, maxTokenDim);

    return {
      avatarUrl: isTokenOnly ? '' : avatarUrl,
      tokenUrl,
      warning: (isGif && fileSizeMb > 2.5) 
        ? `GIF was ${fileSizeMb.toFixed(1)}MB. It was optimized to prevent app memory crashes.`
        : undefined,
    };
  } catch (err) {
    console.warn('Canvas resizing failed, falling back to raw data URL:', err);
    const rawDataUrl = await readFileAsDataUrl(file);
    return {
      avatarUrl: rawDataUrl,
      tokenUrl: rawDataUrl,
      warning: fileSizeMb > 3 ? 'Large image uploaded. Consider using images under 2MB for best performance.' : undefined,
    };
  }
}

/**
 * Reads a file as Data URL with promise wrapper
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Loads an image from a source URL/data URL into an HTMLImageElement
 */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Resizes an image to fit within maxDimension while maintaining aspect ratio
 */
export function resizeImageViaCanvas(
  img: HTMLImageElement,
  maxDimension = 600,
  mimeType = 'image/webp',
  quality = 0.88
): Promise<string> {
  return new Promise((resolve) => {
    let { width, height } = img;
    if (width <= 0 || height <= 0) {
      resolve(img.src);
      return;
    }

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(img.src);
      return;
    }

    ctx.drawImage(img, 0, 0, width, height);

    try {
      const dataUrl = canvas.toDataURL(mimeType, quality);
      resolve(dataUrl);
    } catch {
      resolve(canvas.toDataURL('image/png'));
    }
  });
}

/**
 * Creates a circular cropped token image from an image source
 */
export async function createCircularTokenFromImage(src: string, size = 256): Promise<string> {
  const img = await loadImageElement(src);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return src;

  // Clip circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw centered image (cover)
  const minDim = Math.min(img.width, img.height);
  const scale = size / minDim;
  const scaledW = img.width * scale;
  const scaledH = img.height * scale;
  const offsetX = (size - scaledW) / 2;
  const offsetY = (size - scaledH) / 2;

  ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);

  return canvas.toDataURL('image/png');
}
