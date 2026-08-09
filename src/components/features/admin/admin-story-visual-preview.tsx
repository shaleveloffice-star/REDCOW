"use client";

import { useMemo, useState } from "react";

import { AdminSiteImagePicker } from "@/components/features/admin/admin-site-image-picker";
import { StoryHero } from "@/components/features/stories/story-hero";
import { StorySections } from "@/components/features/stories/story-sections";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import type { BrandStory, StorySection } from "@/types/story";
import type { StoryPreviewEditor, StoryTextEditRequest } from "@/types/story-preview-editor";

import "@/app/stories-page.css";

type AdminStoryVisualPreviewProps = {
  story: BrandStory;
  pickableImages: AdminPickableImage[];
  onChange: (story: BrandStory) => void;
};

function AdminStoryEditBar({
  request,
  onClose
}: {
  request: StoryTextEditRequest;
  onClose: () => void;
}) {
  const [value, setValue] = useState(request.value);

  return (
    <div className="admin-story-edit-bar" role="region" aria-label="עריכת טקסט">
      <label className="admin-story-edit-bar-label">
        {request.label}
        {request.multiline ? (
          <textarea rows={5} value={value} onChange={(event) => setValue(event.target.value)} />
        ) : (
          <input value={value} onChange={(event) => setValue(event.target.value)} />
        )}
      </label>
      <div className="admin-story-edit-bar-actions">
        <button
          className="button"
          type="button"
          onClick={() => {
            request.onSave(value);
            onClose();
          }}
        >
          עדכון
        </button>
        <button className="button secondary" type="button" onClick={onClose}>
          ביטול
        </button>
      </div>
    </div>
  );
}

export function AdminStoryVisualPreview({
  story,
  pickableImages,
  onChange
}: AdminStoryVisualPreviewProps) {
  const [textEdit, setTextEdit] = useState<StoryTextEditRequest | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickHandler, setImagePickHandler] = useState<((url: string, label?: string) => void) | null>(
    null
  );

  const editor = useMemo<StoryPreviewEditor>(
    () => ({
      active: true,
      onRequestTextEdit: (request) => setTextEdit(request),
      onRequestImagePick: (onSelect) => {
        setImagePickHandler(() => onSelect);
        setImagePickerOpen(true);
      },
      onEditHero: (patch) => onChange({ ...story, ...patch }),
      onEditSection: (index, section) =>
        onChange({
          ...story,
          sections: story.sections.map((entry, entryIndex) => (entryIndex === index ? section : entry))
        })
    }),
    [onChange, story]
  );

  return (
    <div className="admin-story-visual-preview">
      <div className="admin-story-preview-intro">
        <strong>עריכה חזותית</strong>
        <span>לחצו על טקסט לעריכה · על תמונה להחלפה · בכל מקטע — החלפת צד או סוג</span>
      </div>

      {textEdit ? <AdminStoryEditBar request={textEdit} onClose={() => setTextEdit(null)} /> : null}

      <main id="story-preview-canvas" className="story-page admin-story-preview-canvas" dir="rtl">
        <StoryHero story={story} locale="he" editor={editor} />
        <StorySections sections={story.sections} locale="he" editor={editor} />
      </main>

      <AdminSiteImagePicker
        open={imagePickerOpen}
        images={pickableImages}
        title="בחירת תמונה להחלפה"
        onClose={() => {
          setImagePickerOpen(false);
          setImagePickHandler(null);
        }}
        onSelect={(url, image) => {
          imagePickHandler?.(url, image.label);
          setImagePickerOpen(false);
          setImagePickHandler(null);
        }}
      />
    </div>
  );
}
