import { access, mkdir, writeFile } from "fs/promises";
import { constants as fsConstants } from "fs";
import path from "path";

export async function writeBytes(filePath: string, bytes: Buffer): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes);
  await access(filePath, fsConstants.R_OK);
  const { stat } = await import("fs/promises");
  const info = await stat(filePath);
  if (info.size !== bytes.length) {
    throw new Error("גודל הקובץ אחרי כתיבה לא תואם");
  }
}
