import { createReadStream, existsSync } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import {
  GALLERY_UPLOAD_DATA_DIR,
  GALLERY_UPLOAD_PUBLIC_DIR
} from "@/lib/admin/save-gallery-image";

export const runtime = "nodejs";

const SAFE_FILE = /^gal-\d+-[a-z0-9]+\.(jpe?g|png|webp|gif)$/i;

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif"
};

type RouteContext = {
  params: Promise<{ file: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { file } = await context.params;
  const fileName = path.basename(file ?? "");

  if (!SAFE_FILE.test(fileName)) {
    return new Response("Not found", { status: 404 });
  }

  const candidates = [
    path.join(GALLERY_UPLOAD_DATA_DIR, fileName),
    path.join(GALLERY_UPLOAD_PUBLIC_DIR, fileName)
  ];

  const diskPath = candidates.find((candidate) => existsSync(candidate));
  if (!diskPath) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(fileName).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const info = await stat(diskPath);
  const stream = Readable.toWeb(createReadStream(diskPath)) as ReadableStream;

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(info.size),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  });
}
