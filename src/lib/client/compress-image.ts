/** Client-only: compress an image file to a JPEG data-URL for admin upload. */

const MAX_EDGE = 1000;
const JPEG_QUALITY = 0.78;
/** Cap string length (~base64). ~280KB binary ≈ 380k chars. */
const MAX_DATA_URL_CHARS = 380_000;

const ALLOWED_EXT = /\.(jpe?g|png|webp|gif)$/i;

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

/**
 * Returns `data:image/jpeg;base64,...` small enough to POST as JSON to the upload API.
 */
export async function compressImageFileToDataUrl(file: File): Promise<string> {
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

  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height, 1));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("דחיסת התמונה נכשלה בדפדפן זה");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  while (dataUrl.length > MAX_DATA_URL_CHARS && quality > 0.4) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    // Last resort: shrink canvas further.
    const shrink = 0.7;
    canvas.width = Math.max(1, Math.round(width * shrink));
    canvas.height = Math.max(1, Math.round(height * shrink));
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    dataUrl = canvas.toDataURL("image/jpeg", 0.65);
  }

  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("התמונה עדיין גדולה מדי אחרי דחיסה. נסו תמונה אחרת.");
  }

  return dataUrl;
}
