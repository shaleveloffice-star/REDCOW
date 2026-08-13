"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import {
  formatAdminImageSpec,
  GALLERY_IMAGE_SPEC
} from "@/data/admin-image-specs";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import { compressGalleryImage } from "@/lib/client/compress-image";
import {
  createGalleryImageAction,
  deleteGalleryImageAction,
  updateGalleryImageAction
} from "@/server/actions/gallery.actions";
import type { GalleryImage } from "@/types/gallery";

async function uploadGalleryImageDataUrl(dataUrl: string): Promise<{ ok: true; url: string; fileName?: string } | { ok: false; error: string }> {
  const response = await fetch("/api/admin/gallery-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl })
  });

  const result = (await response.json()) as
    | { ok: true; url: string; fileName?: string }
    | { ok: false; error: string };

  if (!response.ok || !result.ok) {
    return { ok: false, error: "error" in result ? result.error : "העלאה נכשלה" };
  }

  return result;
}

function fileTitleFromName(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "תמונה מהגלריה";
}

function LibraryImageCard({ image }: { image: AdminPickableImage }) {
  return (
    <li className="admin-gallery-card admin-gallery-card--library">
      <span className="admin-gallery-badge">{image.group}</span>
      <img src={image.imageUrl} alt={image.label} className="admin-gallery-card-image" loading="lazy" />
      <div className="admin-gallery-card-body">
        <strong>{image.label}</strong>
        <p className="admin-form-hint">{image.location}</p>
        <p className="admin-image-spec">{image.recommendedSizeLabel}</p>
        <code className="admin-gallery-url">{image.imageUrl}</code>
        <div className="admin-row-actions">
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(image.imageUrl);
            }}
          >
            העתק URL
          </button>
        </div>
      </div>
    </li>
  );
}

export function AdminGalleryManager({
  uploadedItems,
  libraryImages
}: {
  uploadedItems: GalleryImage[];
  libraryImages: AdminPickableImage[];
}) {
  const router = useRouter();
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<GalleryImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setDraft(null);
    setError(null);
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;

    setUploading(true);
    setUploadStatus(null);
    setError(null);

    try {
      let successCount = 0;
      for (const file of Array.from(fileList)) {
        setUploadStatus(`מדחיס ומעלה: ${file.name}…`);
        const dataUrl = await compressGalleryImage(file);
        const uploaded = await uploadGalleryImageDataUrl(dataUrl);
        if (!uploaded.ok) {
          throw new Error(`${file.name}: ${uploaded.error}`);
        }

        await createGalleryImageAction({
          title: fileTitleFromName(file.name),
          imageUrl: uploaded.url,
          alt: fileTitleFromName(file.name),
          fileName: uploaded.fileName
        });
        successCount += 1;
      }

      setUploadStatus(`הועלו ${successCount} תמונות בהצלחה (עם דחיסה אוטומטית).`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "העלאה נכשלה";
      setError(message);
      setUploadStatus(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="admin-gallery-upload">
        <div className="admin-gallery-upload-copy">
          <strong>העלאת תמונות</strong>
          <p className="admin-form-hint">
            JPG, PNG, WebP או GIF — {formatAdminImageSpec(GALLERY_IMAGE_SPEC)} · נדחס אוטומטית בהעלאה.
          </p>
        </div>
        <div className="admin-gallery-upload-actions">
          <input
            ref={fileInputRef}
            accept="image/*"
            className="admin-gallery-file-input"
            disabled={uploading || isPending}
            multiple
            type="file"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <button
            className="button"
            disabled={uploading || isPending}
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "מעלה…" : "בחר תמונות להעלאה"}
          </button>
        </div>
      </div>

      {uploadStatus ? <p className="admin-form-hint">{uploadStatus}</p> : null}
      {error ? <p className="admin-form-error">{error}</p> : null}

      <section className="admin-gallery-section" aria-labelledby="gallery-uploads-heading">
        <h3 id="gallery-uploads-heading" className="admin-gallery-section-title">
          העלאות שלך ({uploadedItems.length})
        </h3>
        {uploadedItems.length === 0 ? (
          <p className="admin-form-hint">עדיין לא הועלו תמונות. השתמשו בכפתור למעלה.</p>
        ) : (
          <ul className="admin-gallery-grid">
            {uploadedItems.map((item) => (
              <li key={item.id} className="admin-gallery-card">
                <span className="admin-gallery-badge admin-gallery-badge--upload">העלאה</span>
                <img src={item.imageUrl} alt={item.alt || item.title} className="admin-gallery-card-image" loading="lazy" />
                <div className="admin-gallery-card-body">
                  <strong>{item.title}</strong>
                  <p className="admin-image-spec">{formatAdminImageSpec(GALLERY_IMAGE_SPEC)}</p>
                  <code className="admin-gallery-url">{item.imageUrl}</code>
                  <div className="admin-row-actions">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(item.imageUrl);
                      }}
                    >
                      העתק URL
                    </button>
                    <AdminRowActions
                      disabled={isPending || uploading}
                      onEdit={() => setDraft({ ...item })}
                      onDelete={() => {
                        if (!confirmDelete(item.title)) return;
                        run(async () => {
                          await deleteGalleryImageAction(item.id);
                        });
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-gallery-section" aria-labelledby="gallery-library-heading">
        <h3 id="gallery-library-heading" className="admin-gallery-section-title">
          תמונות האתר ({libraryImages.length})
        </h3>
        <p className="admin-form-hint">
          תמונות מהעיצוב, דף הבית, אודות, תפריט ועוד — לקריאה והעתקת URL. לעריכה השתמשו בהגדרות התמונות הרלוונטיות.
        </p>
        {libraryImages.length === 0 ? (
          <p className="admin-form-hint">לא נמצאו תמונות בספריית האתר.</p>
        ) : (
          <ul className="admin-gallery-grid">
            {libraryImages.map((image) => (
              <LibraryImageCard key={image.id} image={image} />
            ))}
          </ul>
        )}
      </section>

      <AdminModal open={Boolean(draft)} title="עריכת תמונה" onClose={close}>
        {draft ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await updateGalleryImageAction(draft);
              }, close);
            }}
          >
            <img src={draft.imageUrl} alt="" className="admin-gallery-edit-preview" loading="lazy" />
            <label>
              שם / כותרת
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              תיאור (alt)
              <input value={draft.alt ?? ""} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} />
            </label>
            <label>
              URL
              <input readOnly value={draft.imageUrl} />
            </label>
            <p className="admin-image-spec">{formatAdminImageSpec(GALLERY_IMAGE_SPEC)} — נדחס אוטומטית בהעלאה</p>
            <AdminFormFooter isPending={isPending} error={error} onCancel={close} submitLabel="עדכן" />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
