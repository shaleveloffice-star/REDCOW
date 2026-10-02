"use client";

import { useMemo, useRef, useState } from "react";

import { AdminModal } from "@/components/features/admin/admin-crud-ui";
import { AdminImageFacts } from "@/components/features/admin/admin-image-facts";
import {
  formatAdminImageSpec,
  GALLERY_IMAGE_SPEC,
  type AdminImageSpec
} from "@/data/admin-image-specs";
import { isVideoMediaUrl } from "@/lib/menu-media";
import {
  sortPickableImagesByUploadDate,
  type AdminPickableImage
} from "@/lib/admin/pickable-site-images";
import { uploadCompressedAdminImage } from "@/lib/client/upload-admin-image";

type AdminSiteImagePickerProps = {
  open: boolean;
  title?: string;
  images: AdminPickableImage[];
  /** Spec of the field being filled; enables a per-image "fits this field" check. */
  spec?: AdminImageSpec;
  fieldLabel?: string;
  onClose: () => void;
  onSelect: (imageUrl: string, image: AdminPickableImage) => void;
};

const uploadDateFormatter = new Intl.DateTimeFormat("he-IL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

function formatUploadDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : uploadDateFormatter.format(date);
}

function isPickablePreviewUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return false;
  }
  return !isVideoMediaUrl(trimmed);
}

export function AdminSiteImagePicker({
  open,
  title = "בחירת תמונה מהאתר",
  images,
  spec,
  fieldLabel,
  onClose,
  onSelect
}: AdminSiteImagePickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = images.filter((image) => isPickablePreviewUrl(image.imageUrl));
    if (!q) return visible;

    return visible.filter(
      (image) =>
        image.label.toLowerCase().includes(q) ||
        image.location.toLowerCase().includes(q) ||
        image.group.toLowerCase().includes(q) ||
        image.imageUrl.toLowerCase().includes(q)
    );
  }, [images, query]);

  const sorted = useMemo(() => sortPickableImagesByUploadDate(filtered), [filtered]);

  return (
    <AdminModal open={open} title={title} onClose={onClose} stacked>
      <div className="admin-image-picker">
        <label className="admin-image-picker-search">
          חיפוש
          <input
            type="search"
            value={query}
            placeholder="שם, מיקום או קבוצה…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        {spec ? (
          <p className="admin-image-picker-field-spec">
            {fieldLabel ? `השדה "${fieldLabel}": ` : "השדה הזה: "}
            {formatAdminImageSpec(spec)}
          </p>
        ) : null}

        {sorted.length === 0 ? (
          <p className="admin-form-hint">לא נמצאו תמונות.</p>
        ) : (
          <ul className="admin-image-picker-grid">
            {sorted.map((image) => (
              <li key={image.id}>
                <button
                  className="admin-image-picker-item"
                  type="button"
                  onClick={() => {
                    onSelect(image.imageUrl, image);
                    onClose();
                  }}
                >
                  <span className="admin-image-picker-thumb">
                    <img src={image.imageUrl} alt="" className="admin-image-picker-image" loading="lazy" />
                  </span>
                  <span className="admin-image-picker-meta">
                    <strong>{image.label}</strong>
                    <small>
                      {image.uploadedAt ? (
                        <>
                          הועלה: <bdi dir="ltr">{formatUploadDate(image.uploadedAt)}</bdi>
                        </>
                      ) : (
                        "תמונה מקורית של האתר"
                      )}
                    </small>
                    {open ? <AdminImageFacts url={image.imageUrl} spec={spec} /> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminModal>
  );
}

type AdminImageUrlFieldProps = {
  label: string;
  value: string;
  required?: boolean;
  images: AdminPickableImage[];
  spec?: AdminImageSpec;
  allowUpload?: boolean;
  /** Optional alt suggestion is passed in the same call as the URL to avoid stale state races. */
  onChange: (url: string, meta?: { altSuggestion?: string }) => void;
};

export function AdminImageUrlField({
  label,
  value,
  required,
  images,
  spec = GALLERY_IMAGE_SPEC,
  allowUpload = true,
  onChange
}: AdminImageUrlFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showPreview = isPickablePreviewUrl(value);

  const handleUpload = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadCompressedAdminImage(file, spec);
      onChange(uploaded.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "העלאה נכשלה");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <label>
        {label}
        <div className="admin-image-url-field">
          <input required={required} value={value} onChange={(e) => onChange(e.target.value)} />
          {allowUpload ? (
            <>
              <input
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="admin-gallery-file-input"
                disabled={uploading}
                type="file"
                onChange={(event) => void handleUpload(event.target.files)}
              />
              <button
                className="button secondary"
                disabled={uploading}
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "דוחס ומעלה…" : "העלה תמונה"}
              </button>
            </>
          ) : null}
          <button className="button secondary" type="button" onClick={() => setPickerOpen(true)}>
            בחר מהגלריה
          </button>
        </div>
      </label>
      <p className="admin-image-spec">
        {formatAdminImageSpec(spec)}
        {spec.note ? ` · ${spec.note}` : ""}
        {" - נדחס אוטומטית בהעלאה"}
      </p>
      {uploadError ? <p className="admin-form-error">{uploadError}</p> : null}
      {showPreview ? (
        <div className="admin-image-url-preview">
          <img src={value} alt="" className="admin-image-url-preview-image" loading="lazy" />
          <AdminImageFacts url={value} spec={spec} />
        </div>
      ) : null}
      <AdminSiteImagePicker
        open={pickerOpen}
        images={images}
        spec={spec}
        fieldLabel={label}
        onClose={() => setPickerOpen(false)}
        onSelect={(url, image) => {
          onChange(url, { altSuggestion: image.label });
        }}
      />
    </>
  );
}
