import { createElement, type ElementType } from "react";

type LabelWithNoteProps = {
  label: string;
  note?: string;
  as?: ElementType;
  mainAs?: ElementType;
  noteAs?: ElementType;
  className?: string;
  mainClassName?: string;
  noteClassName?: string;
};

export function LabelWithNote({
  label,
  note,
  as: Wrapper = "span",
  mainAs: Main = "span",
  noteAs: Note = "span",
  className,
  mainClassName,
  noteClassName
}: LabelWithNoteProps) {
  if (!note) {
    return createElement(Main, { className: mainClassName }, label);
  }

  const wrapperClass = ["ui-label-with-note", "ui-label-with-note--stack", className]
    .filter(Boolean)
    .join(" ");
  const mainClass = ["ui-label-with-note__main", mainClassName].filter(Boolean).join(" ");
  const noteClass = ["ui-label-with-note__note", noteClassName].filter(Boolean).join(" ");

  return createElement(
    Wrapper,
    { className: wrapperClass },
    createElement(Main, { className: mainClass }, label),
    createElement(Note, { className: noteClass }, `(${note})`)
  );
}
