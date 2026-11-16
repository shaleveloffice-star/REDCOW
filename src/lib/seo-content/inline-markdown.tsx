import Link from "next/link";
import type { ReactNode } from "react";

import { isSafePublicHref } from "@/lib/security/safe-url";

const INLINE_LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function SafeInlineLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="seo-inline-link">
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className="seo-inline-link" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/** Renders plain text with optional markdown links: [label](/path) or [label](https://…). */
export function renderInlineMarkdown(text: string): ReactNode {
  const source = text ?? "";
  if (!source) return null;
  if (!source.includes("[")) return source;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(INLINE_LINK_PATTERN.source, "g");

  while ((match = pattern.exec(source)) !== null) {
    const [full, label, rawHref] = match;
    if (match.index > lastIndex) {
      nodes.push(source.slice(lastIndex, match.index));
    }
    const href = rawHref?.trim() ?? "";
    if (label && href && isSafePublicHref(href)) {
      nodes.push(
        <SafeInlineLink key={`${match.index}-${href}`} href={href}>
          {label}
        </SafeInlineLink>
      );
    } else {
      nodes.push(full);
    }
    lastIndex = match.index + full.length;
  }

  if (lastIndex < source.length) {
    nodes.push(source.slice(lastIndex));
  }

  return nodes.length === 1 ? nodes[0] : nodes;
}
