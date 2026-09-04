"use client";

import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

import { getAdminPageExportAction } from "@/server/actions/admin-page-export.actions";

async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.insetInlineStart = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

export function AdminCopyPageData() {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  if (pathname.startsWith("/admin/gallery")) {
    return null;
  }

  return (
    <div className="admin-copy-page-data">
      <button
        type="button"
        className="button secondary admin-copy-page-data-btn"
        disabled={pending}
        onClick={() => {
          setStatus(null);
          startTransition(async () => {
            try {
              const payload = await getAdminPageExportAction(pathname);
              if (!payload) {
                setStatus("אין נתונים להעתקה בדף זה");
                return;
              }
              await writeClipboard(JSON.stringify(payload, null, 2));
              setStatus(`הועתק: ${payload.label}`);
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "ההעתקה נכשלה");
            }
          });
        }}
      >
        {pending ? "מעתיק…" : "העתק נתונים"}
      </button>
      {status ? (
        <p className="admin-copy-page-data-status" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
