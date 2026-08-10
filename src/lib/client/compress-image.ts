/** Client-only: compress an image file to a JPEG data-URL for admin upload. */

export const MENU_PRIMARY_IMAGE_MAX_BYTES = 80 * 1024;
export const MENU_CLOSEUP_IMAGE_MAX_BYTES = 40 * 1024;
export const GALLERY_IMAGE_MAX_BYTES = 350 * 1024;
export const GALLERY_IMAGE_MAX_EDGE = 1920;

const DEFAULT_MAX_EDGE = 1200;
const CLOSEUP_MAX_EDGE = 960;
const MIN_EDGE = 480;
const MIN_QUALITY = 0.32;

const ALLOWED_EXT = /\.(jpe?g|png|webp|gif)$/i;

export type CompressImageOptions = {
  maxBytes?: number;
  maxEdge?: number;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("קריאת הקובץ נכשלה"));
    };
    reader.onerror = () => reject(new Error("קריאת הקובץ נכשלה"));
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("לא ניתן לפתוח את התמונה. המירו ל-JPG/PNG (קבצי iPhone HEIC לא נתמכים)."));
    img.src = src;
  });
}

function looksLikeImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) {
    if (/heic|heif|avif/i.test(file.type)) return false;
    return true;
  }
  return ALLOWED_EXT.test(file.name);
}

function dataUrlByteLength(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64.replace(/\s/g, "").length * 3) / 4);
}

function renderJpeg(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("דחיסת התמונה נכשלה בדפדפן זה");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

function compressLoadedImage(
  img: HTMLImageElement,
  maxBytes: number,
  maxEdge: number
): string {
  let edgeScale = Math.min(1, maxEdge / Math.max(img.width, img.height, 1));
  let width = Math.max(1, img.width * edgeScale);
  let height = Math.max(1, img.height * edgeScale);

  while (true) {
    for (let quality = 0.86; quality >= MIN_QUALITY; quality -= 0.06) {
      const dataUrl = renderJpeg(img, width, height, quality);
      if (dataUrlByteLength(dataUrl) <= maxBytes) {
        return dataUrl;
      }
    }

    const nextWidth = Math.max(MIN_EDGE, Math.round(width * 0.82));
    const nextHeight = Math.max(MIN_EDGE, Math.round(height * 0.82));
    if (nextWidth === Math.round(width) && nextHeight === Math.round(height)) {
      break;
    }
    width = nextWidth;
    height = nextHeight;
  }

  throw new Error("התמונה עדיין גדולה מדי אחרי דחיסה. נסו תמונה אחרת.");
}

/**
 * Returns `data:image/jpeg;base64,...` sized for menu admin upload.
 */
export async function compressImageFileToDataUrl(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const maxBytes = options.maxBytes ?? MENU_PRIMARY_IMAGE_MAX_BYTES;
  const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;

  if (/heic|heif/i.test(file.type) || /\.heic$/i.test(file.name)) {
    throw new Error("קבצי HEIC מאייפון לא נתמכים. שמרו כ-JPG בגלריה ונסו שוב.");
  }
  if (!looksLikeImageFile(file)) {
    throw new Error("יש לבחור קובץ תמונה (JPG, PNG, WebP או GIF)");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("הקובץ גדול מדי (מקסימום 12MB לפני דחיסה)");
  }

  const original = await readFileAsDataUrl(file);
  const img = await loadHtmlImage(original);
  return compressLoadedImage(img, maxBytes, maxEdge);
}

export async function compressMenuPrimaryImage(file: File): Promise<string> {
  return compressImageFileToDataUrl(file, {
    maxBytes: MENU_PRIMARY_IMAGE_MAX_BYTES,
    maxEdge: DEFAULT_MAX_EDGE
  });
}

export async function compressMenuCloseUpImage(file: File): Promise<string> {
  return compressImageFileToDataUrl(file, {
    maxBytes: MENU_CLOSEUP_IMAGE_MAX_BYTES,
    maxEdge: CLOSEUP_MAX_EDGE
  });
}

export async function compressGalleryImage(file: File): Promise<string> {
  return compressImageFileToDataUrl(file, {
    maxBytes: GALLERY_IMAGE_MAX_BYTES,
    maxEdge: GALLERY_IMAGE_MAX_EDGE
  });
}
