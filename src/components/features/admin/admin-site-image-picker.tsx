"use client";

import { useMemo, useState } from "react";

import { AdminModal } from "@/components/features/admin/admin-crud-ui";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";

type AdminSiteImagePickerProps = {
  open: boolean;
  title?: string;
  images: AdminPickableImage[];
  onClose: () => void;
  onSelect: (imageUrl: string, image: AdminPickableImage) => void;
};

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

  const grouped = useMemo(() => {
    const map = new Map<string, AdminPickableImage[]>();
    for (const image of filtered) {
      const list = map.get(image.group) ?? [];
      list.push(image);
      map.set(image.group, list);
    }
    return [...map.entries()];
  }, [filtered]);

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

        {grouped.length === 0 ? (
          <p className="admin-form-hint">לא נמצאו תמונות.</p>
        ) : (
          grouped.map(([groupTitle, groupImages]) => (
            <section key={groupTitle} className="admin-image-picker-group">
              <h4 className="admin-image-picker-group-title">{groupTitle}</h4>
              <ul className="admin-image-picker-grid">
                {groupImages.map((image) => (
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
                        <small>{image.location}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
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
  onChange: (url: string) => void;
  onAltSuggestion?: (alt: string) => void;
};

export function AdminImageUrlField({
  label,
  value,
  required,
  images,
  onChange,
  onAltSuggestion
}: AdminImageUrlFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const showPreview = isPickablePreviewUrl(value);

  return (
    <>
      <label>
        {label}
        <div className="admin-image-url-field">
          <input required={required} value={value} onChange={(e) => onChange(e.target.value)} />
          <button className="button secondary" type="button" onClick={() => setPickerOpen(true)}>
            בחר תמונה
          </button>
        </div>
      </label>
      {showPreview ? (
        <div className="admin-image-url-preview">
          <img src={value} alt="" className="admin-image-url-preview-image" loading="lazy" />
        </div>
      ) : null}
      <AdminSiteImagePicker
        open={pickerOpen}
        images={images}
        onClose={() => setPickerOpen(false)}
        onSelect={(url, image) => {
          onChange(url);
          onAltSuggestion?.(image.label);
        }}
      />
    </>
  );
}
