"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { AdminImageFacts } from "@/components/features/admin/admin-image-facts";
import {
  formatAdminImageSpec,
  GALLERY_IMAGE_SPEC
} from "@/data/admin-image-specs";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import { compressGalleryImage } from "@/lib/client/compress-image";
import {
  deleteGalleryImageAction,
  deleteGalleryImagesAction,
  deleteSiteImagesByUrlAction,
  updateGalleryImageAction
} from "@/server/actions/gallery.actions";
import type { GalleryImage } from "@/types/gallery";

/** The route also adds the gallery record, so callers must not create one themselves. */
async function uploadGalleryImageDataUrl(
  dataUrl: string,
  title: string
): Promise<{ ok: true; url: string; fileName?: string } | { ok: false; error: string }> {
  const response = await fetch("/api/admin/gallery-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl, title })
  });

  const result = (await response.json()) as
    | { ok: true; url: string; fileName?: string }
    | { ok: false; error: string };

  if (!response.ok || !result.ok) {
    return { ok: false, error: "error" in result ? result.error : "העלאה נכשלה" };
  }

  return result;
}

function isDeletableLibraryImage(image: AdminPickableImage) {
  return image.source !== "site";
}

function LibraryImageCard({
  image,
  selectMode,
  selected,
  disabled,
  onToggle,
  onDelete
}: {
  image: AdminPickableImage;
  selectMode: boolean;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const deletable = isDeletableLibraryImage(image);
  const selectable = selectMode && deletable;

  return (
    <li
      className={`admin-gallery-card admin-gallery-card--library${selected ? " admin-gallery-card--selected" : ""}${
        selectMode && !deletable ? " admin-gallery-card--locked" : ""
      }`}
    >
      {selectable ? (
        <label className="admin-gallery-select-check">
          <input type="checkbox" checked={selected} disabled={disabled} onChange={onToggle} />
          <span className="sr-only">בחר את {image.label}</span>
        </label>
      ) : null}
      <span className="admin-gallery-badge">{image.group}</span>
      <img
        src={image.imageUrl}
        alt={image.label}
        className="admin-gallery-card-image"
        loading="lazy"
        onClick={selectable && !disabled ? onToggle : undefined}
      />
      <div className="admin-gallery-card-body">
        <strong>{image.label}</strong>
        <p className="admin-form-hint">{image.location}</p>
        <AdminImageFacts url={image.imageUrl} />
        <code className="admin-gallery-url">{image.imageUrl}</code>
        {selectMode ? null : (
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
            {deletable ? (
              <button className="button secondary admin-btn-danger" disabled={disabled} type="button" onClick={onDelete}>
                מחק
              </button>
            ) : null}
          </div>
        )}
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
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [librarySelectMode, setLibrarySelectMode] = useState(false);
  const [selectedLibraryUrls, setSelectedLibraryUrls] = useState<Set<string>>(() => new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deletableLibraryImages = libraryImages.filter(isDeletableLibraryImage);
  const selectedLibraryImages = deletableLibraryImages.filter((image) => selectedLibraryUrls.has(image.imageUrl));
  const allLibrarySelected =
    deletableLibraryImages.length > 0 && selectedLibraryImages.length === deletableLibraryImages.length;

  const selectedItems = uploadedItems.filter((item) => selectedIds.has(item.id));
  const allSelected = uploadedItems.length > 0 && selectedItems.length === uploadedItems.length;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(uploadedItems.map((item) => item.id)));
  };

  const deleteSelected = () => {
    const ids = selectedItems.map((item) => item.id);
    if (ids.length === 0) return;
    if (!window.confirm(`למחוק ${ids.length} תמונות מהגלריה? לא ניתן לשחזר.`)) return;
    setUploadStatus(null);
    run(async () => {
      const result = await deleteGalleryImagesAction(ids);
      setUploadStatus(
        result.missing > 0
          ? `נמחקו ${result.deleted} תמונות (${result.missing} כבר לא היו קיימות).`
          : `נמחקו ${result.deleted} תמונות.`
      );
    }, exitSelectMode);
  };

  const exitLibrarySelectMode = () => {
    setLibrarySelectMode(false);
    setSelectedLibraryUrls(new Set());
  };

  const toggleLibrarySelected = (url: string) => {
    setSelectedLibraryUrls((current) => {
      const next = new Set(current);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const toggleSelectAllLibrary = () => {
    setSelectedLibraryUrls(
      allLibrarySelected ? new Set() : new Set(deletableLibraryImages.map((image) => image.imageUrl))
    );
  };

  const deleteLibraryImages = (urls: string[], onDone?: () => void) => {
    if (urls.length === 0) return;
    const subject = urls.length === 1 ? "את התמונה" : `${urls.length} תמונות`;
    if (
      !window.confirm(
        `למחוק ${subject} לגמרי מהמערכת? התמונה תוסר גם מכל המנות שמשתמשות בה ומהגלריה. לא ניתן לשחזר.`
      )
    ) {
      return;
    }
    setUploadStatus(null);
    run(async () => {
      const result = await deleteSiteImagesByUrlAction(urls);
      setUploadStatus(
        `נמחקו ${result.images} תמונות · עודכנו ${result.menuItemsUpdated} מנות · הוסרו ${result.galleryRemoved} רשומות גלריה.`
      );
    }, onDone);
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
        const uploaded = await uploadGalleryImageDataUrl(dataUrl, file.name);
        if (!uploaded.ok) {
          throw new Error(`${file.name}: ${uploaded.error}`);
        }
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
            JPG, PNG, WebP או GIF - {formatAdminImageSpec(GALLERY_IMAGE_SPEC)} · נדחס אוטומטית בהעלאה.
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
        <div className="admin-gallery-section-head">
          <h3 id="gallery-uploads-heading" className="admin-gallery-section-title">
            העלאות שלך ({uploadedItems.length})
          </h3>
          {uploadedItems.length > 0 ? (
            <div className="admin-gallery-select-toolbar">
              {selectMode ? (
                <>
                  <span className="admin-gallery-select-count" aria-live="polite">
                    נבחרו {selectedItems.length}
                  </span>
                  <button className="button secondary" disabled={isPending} type="button" onClick={toggleSelectAll}>
                    {allSelected ? "נקה בחירה" : "בחר הכל"}
                  </button>
                  <button
                    className="button secondary admin-btn-danger"
                    disabled={isPending || selectedItems.length === 0}
                    type="button"
                    onClick={deleteSelected}
                  >
                    {isPending ? "מוחק…" : `מחק נבחרות (${selectedItems.length})`}
                  </button>
                  <button className="button secondary" disabled={isPending} type="button" onClick={exitSelectMode}>
                    ביטול
                  </button>
                </>
              ) : (
                <button
                  className="button secondary"
                  disabled={isPending || uploading}
                  type="button"
                  onClick={() => setSelectMode(true)}
                >
                  בחר
                </button>
              )}
            </div>
          ) : null}
        </div>
        {uploadedItems.length === 0 ? (
          <p className="admin-form-hint">עדיין לא הועלו תמונות. השתמשו בכפתור למעלה.</p>
        ) : (
          <ul className={`admin-gallery-grid${selectMode ? " admin-gallery-grid--selecting" : ""}`}>
            {uploadedItems.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <li
                  key={item.id}
                  className={`admin-gallery-card${isSelected ? " admin-gallery-card--selected" : ""}`}
                >
                  {selectMode ? (
                    <label className="admin-gallery-select-check">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isPending}
                        onChange={() => toggleSelected(item.id)}
                      />
                      <span className="sr-only">בחר את {item.title}</span>
                    </label>
                  ) : null}
                  <span className="admin-gallery-badge admin-gallery-badge--upload">העלאה</span>
                  <img
                    src={item.imageUrl}
                    alt={item.alt || item.title}
                    className="admin-gallery-card-image"
                    loading="lazy"
                    onClick={selectMode && !isPending ? () => toggleSelected(item.id) : undefined}
                  />
                  <div className="admin-gallery-card-body">
                    <strong>{item.title}</strong>
                    <AdminImageFacts url={item.imageUrl} />
                    <code className="admin-gallery-url">{item.imageUrl}</code>
                    {selectMode ? null : (
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
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="admin-gallery-section" aria-labelledby="gallery-library-heading">
        <div className="admin-gallery-section-head">
          <h3 id="gallery-library-heading" className="admin-gallery-section-title">
            תמונות האתר ({libraryImages.length})
          </h3>
          {deletableLibraryImages.length > 0 ? (
            <div className="admin-gallery-select-toolbar">
              {librarySelectMode ? (
                <>
                  <span className="admin-gallery-select-count" aria-live="polite">
                    נבחרו {selectedLibraryImages.length}
                  </span>
                  <button
                    className="button secondary"
                    disabled={isPending}
                    type="button"
                    onClick={toggleSelectAllLibrary}
                  >
                    {allLibrarySelected ? "נקה בחירה" : "בחר הכל"}
                  </button>
                  <button
                    className="button secondary admin-btn-danger"
                    disabled={isPending || selectedLibraryImages.length === 0}
                    type="button"
                    onClick={() =>
                      deleteLibraryImages(
                        selectedLibraryImages.map((image) => image.imageUrl),
                        exitLibrarySelectMode
                      )
                    }
                  >
                    {isPending ? "מוחק…" : `מחק נבחרות (${selectedLibraryImages.length})`}
                  </button>
                  <button
                    className="button secondary"
                    disabled={isPending}
                    type="button"
                    onClick={exitLibrarySelectMode}
                  >
                    ביטול
                  </button>
                </>
              ) : (
                <button
                  className="button secondary"
                  disabled={isPending || uploading}
                  type="button"
                  onClick={() => setLibrarySelectMode(true)}
                >
                  בחר
                </button>
              )}
            </div>
          ) : null}
        </div>
        <p className="admin-form-hint">
          תמונות מהעיצוב, דף הבית, אודות, תפריט ועוד. תמונות תפריט וגלריה אפשר למחוק לגמרי (הן יוסרו גם מהמנות).
          תמונות העיצוב ודף הבית מוחלפות דרך הגדרות התמונות הרלוונטיות.
        </p>
        {libraryImages.length === 0 ? (
          <p className="admin-form-hint">לא נמצאו תמונות בספריית האתר.</p>
        ) : (
          <ul className={`admin-gallery-grid${librarySelectMode ? " admin-gallery-grid--selecting" : ""}`}>
            {libraryImages.map((image) => (
              <LibraryImageCard
                key={image.id}
                image={image}
                selectMode={librarySelectMode}
                selected={selectedLibraryUrls.has(image.imageUrl)}
                disabled={isPending || uploading}
                onToggle={() => toggleLibrarySelected(image.imageUrl)}
                onDelete={() => deleteLibraryImages([image.imageUrl])}
              />
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
            <p className="admin-image-spec">{formatAdminImageSpec(GALLERY_IMAGE_SPEC)} - נדחס אוטומטית בהעלאה</p>
            <AdminFormFooter isPending={isPending} error={error} onCancel={close} submitLabel="עדכן" />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
