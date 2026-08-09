import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

import type { StoryPreviewEditor } from "@/types/story-preview-editor";

export function storyEditableHit(
  editor: StoryPreviewEditor | undefined,
  config: {
    label: string;
    value: string;
    multiline?: boolean;
    onSave: (value: string) => void;
  }
) {
  if (!editor?.active) {
    return {};
  }

  const open = () => {
    editor.onRequestTextEdit({
      label: config.label,
      value: config.value,
      multiline: config.multiline,
      onSave: config.onSave
    });
  };

  return {
    className: "story-editable-hit",
    role: "button" as const,
    tabIndex: 0,
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      open();
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    }
  };
}

export function StoryEditableImageWrap({
  editor,
  onPick,
  children
}: {
  editor?: StoryPreviewEditor;
  onPick: (url: string, label?: string) => void;
  children: ReactNode;
}) {
  if (!editor?.active) {
    return children;
  }

  return (
    <div className="story-editable-image-wrap">
      {children}
      <button
        className="story-editable-image-btn"
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          editor.onRequestImagePick((url, label) => onPick(url, label));
        }}
      >
        החלף תמונה
      </button>
    </div>
  );
}
