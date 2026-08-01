"use client";

import { useMemo, useState } from "react";

import {
  AdminSeoFieldsForm,
  flagsFromPageDefinition,
  type AdminSeoFieldsFlags
} from "@/components/features/admin/admin-seo-fields-form";
import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import { getDefaultSeoPageFields } from "@/data/seo-content-defaults";
import { saveSeoPageFieldsAction } from "@/server/actions/seo-content.actions";
import type { SeoContentDocument, SeoPageFieldsInput, SeoPageId } from "@/types/seo-content";

function cloneFields(fields: SeoPageFieldsInput | undefined): SeoPageFieldsInput {
  return {
    ...fields,
    faq: fields?.faq
      ? { ...fields.faq, items: fields.faq.items?.map((item) => ({ ...item })) ?? [] }
      : undefined,
    cta: fields?.cta ? { ...fields.cta } : undefined
  };
}

type AdminSeoPageEditorProps = {
  pageId: SeoPageId;
  initialDocument: SeoContentDocument;
  fieldFlags?: Partial<AdminSeoFieldsFlags>;
};

export function AdminSeoPageEditor({ pageId, initialDocument, fieldFlags }: AdminSeoPageEditorProps) {
  const { isPending, error, run } = useAdminMutation();
  const [locale, setLocale] = useState<Locale>("he");
  const [document, setDocument] = useState(initialDocument);
  const [draft, setDraft] = useState<SeoPageFieldsInput>(() =>
    cloneFields(initialDocument.he?.pages?.[pageId] ?? {})
  );

  const flags = useMemo(
    () => ({ ...flagsFromPageDefinition(pageId), ...fieldFlags }),
    [pageId, fieldFlags]
  );
  const defaults = useMemo(() => getDefaultSeoPageFields(locale, pageId), [locale, pageId]);
  const lastUpdated = document[locale]?.updatedAt;

  const switchLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setDraft(cloneFields(document[nextLocale]?.pages?.[pageId] ?? {}));
  };

  return (
    <div className="admin-seo-content">
      <div className="admin-seo-toolbar">
        <div className="admin-seo-tabs" role="tablist" aria-label="שפה">
          {LOCALES.map((entry) => (
            <button
              key={entry}
              type="button"
              role="tab"
              aria-selected={locale === entry}
              className={`admin-seo-tab${locale === entry ? " is-active" : ""}`}
              onClick={() => switchLocale(entry)}
            >
              {LOCALE_LABELS[entry]}
            </button>
          ))}
        </div>
      </div>

      {lastUpdated ? (
        <p className="admin-seo-meta">
          עודכן לאחרונה ({locale}): {new Date(lastUpdated).toLocaleString("he-IL")}
        </p>
      ) : (
        <p className="admin-seo-meta">שדות ריקים משתמשים בברירת המחדל המובנית באתר.</p>
      )}

      <form
        className="admin-form admin-seo-form"
        onSubmit={(event) => {
          event.preventDefault();
          run(async () => {
            const saved = await saveSeoPageFieldsAction(locale, pageId, draft);
            setDocument((current) => ({ ...current, [locale]: saved }));
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
