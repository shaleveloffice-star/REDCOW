"use client";

import { useMemo, useState } from "react";

import {
  AdminSeoFieldsForm,
  flagsFromPageDefinition,
  type AdminSeoFieldsFlags
} from "@/components/features/admin/admin-seo-fields-form";
import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { getDefaultSeoPageFields } from "@/data/seo-content-defaults";
import { sanitizeSeoPageFields } from "@/lib/seo-content/sanitize-seo-storage";
import { saveSeoPageFieldsAction } from "@/server/actions/seo-content.actions";
import type { SeoContentDocument, SeoPageFieldsInput, SeoPageId } from "@/types/seo-content";

function cloneFields(fields: SeoPageFieldsInput | undefined): SeoPageFieldsInput {
  return sanitizeSeoPageFields({
    ...fields,
    faq: fields?.faq
      ? { ...fields.faq, items: fields.faq.items?.map((item) => ({ ...item })) ?? [] }
      : undefined,
    cta: fields?.cta ? { ...fields.cta } : undefined
  });
}

type AdminSeoPageEditorProps = {
  pageId: SeoPageId;
  initialDocument: SeoContentDocument;
  fieldFlags?: Partial<AdminSeoFieldsFlags>;
};

export function AdminSeoPageEditor({ pageId, initialDocument, fieldFlags }: AdminSeoPageEditorProps) {
  const { isPending, error, run } = useAdminMutation();
  const [document, setDocument] = useState(initialDocument);
  const [draft, setDraft] = useState<SeoPageFieldsInput>(() =>
    cloneFields(initialDocument.he?.pages?.[pageId] ?? {})
  );

  const flags = useMemo(
    () => ({ ...flagsFromPageDefinition(pageId), ...fieldFlags }),
    [pageId, fieldFlags]
  );
  const defaults = useMemo(() => getDefaultSeoPageFields("he", pageId), [pageId]);
  const lastUpdated = document.he?.updatedAt;

  return (
    <div className="admin-seo-content">
      <p className="admin-seo-meta">
        {lastUpdated
          ? `עודכן לאחרונה: ${new Date(lastUpdated).toLocaleString("he-IL")}`
          : "שדות ריקים משתמשים בברירת המחדל המובנית באתר."}
      </p>
      <p className="admin-field-hint">
        ניהול תוכן בעברית בלבד. תרגום לאנגלית ולצרפתית מוצג אוטומטית למבקרים באתר.
      </p>

      <form
        className="admin-form admin-seo-form"
        onSubmit={(event) => {
          event.preventDefault();
          run(async () => {
            const payload = sanitizeSeoPageFields(draft);
            const result = await saveSeoPageFieldsAction("he", pageId, payload);
            setDocument((current) => ({
              ...current,
              he: {
                pages: {
                  ...(current.he?.pages ?? {}),
                  [pageId]: {
                    ...(current.he?.pages?.[pageId] ?? {}),
                    ...payload
                  }
                },
                updatedAt: result.updatedAt
              }
            }));
          });
        }}
      >
        <AdminSeoFieldsForm
          draft={draft}
          defaults={defaults}
          flags={flags}
          onChange={setDraft}
          idPrefix={`page-${pageId}`}
        />

        {error ? <p className="admin-form-error">{error}</p> : null}

        <div className="admin-form-actions">
          <button className="button" disabled={isPending} type="submit">
            {isPending ? "שומר…" : "שמור תוכן SEO"}
          </button>
        </div>
      </form>
    </div>
  );
}
