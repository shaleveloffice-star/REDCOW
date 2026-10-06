import Link from "next/link";
import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { storyEditableHit } from "@/lib/stories/story-editable-ui";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { StoryPreviewEditor } from "@/types/story-preview-editor";

type StoryLongContentBodyProps = {
  body: string;
  editor?: StoryPreviewEditor;
  onSave: (value: string) => void;
};

function StoryMarkdownLink({
  href,
  children
}: {
  href?: string;
  children?: ReactNode;
}) {
  const safe = href && isSafePublicHref(href) ? href : undefined;

  if (!safe) {
    return <span>{children}</span>;
  }

  if (safe.startsWith("/")) {
    return (
      <Link href={safe} className="story-long-content-link">
        {children}
      </Link>
    );
  }

  return (
    <a
      href={safe}
      className="story-long-content-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

// The story title is the page's only <h1>, so a body "H1" keeps the H1 look but is an <h2> in the markup.
const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="story-long-content-h1">{children}</h2>,
  h2: ({ children }) => <h2 className="story-long-content-h2">{children}</h2>,
  h3: ({ children }) => <h3 className="story-long-content-h3">{children}</h3>,
  h4: ({ children }) => <h4 className="story-long-content-h4">{children}</h4>,
  h5: ({ children }) => <h5 className="story-long-content-h5">{children}</h5>,
  h6: ({ children }) => <h5 className="story-long-content-h5">{children}</h5>,
  p: ({ children }) => <p>{children}</p>,
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol>{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ href, children }) => <StoryMarkdownLink href={href}>{children}</StoryMarkdownLink>
};

export function StoryLongContentBody({ body, editor, onSave }: StoryLongContentBodyProps) {
  const trimmed = body.trim();
  const displaySource = trimmed || (editor?.active ? "לחצו לעריכת תוכן" : "");

  if (!displaySource) {
    return null;
  }

  const { className: hitClassName, ...hitProps } = storyEditableHit(editor, {
    label: "תוכן מקטע",
    value: body,
    multiline: true,
    onSave
  });

  return (
    <div
      {...hitProps}
      className={["story-long-content-body story-section-body", hitClassName].filter(Boolean).join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {displaySource}
      </ReactMarkdown>
    </div>
  );
}
