"use client";

import { useEffect, useRef, useState } from "react";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import {
  AdminCategorySeoSection,
  buildInitialCategorySeoByLocale
} from "@/components/features/admin/admin-category-seo-section";
import { AdminCategorySmartPasteModal } from "@/components/features/admin/admin-category-smart-paste-modal";
import { adminFieldLabel } from "@/components/features/admin/admin-field-label";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { createId } from "@/lib/admin/new-id";
import {
  getStoredCategorySeoFields,
  pickCategorySeoFields
} from "@/lib/seo-content/admin-category-seo";
import { LOCALES, type Locale } from "@/i18n/config";
import { deleteMenuCategoryAction, saveMenuCategoryAction, saveMenuCategoryWithSeoAction } from "@/server/actions/menu.actions";
import type { MenuCategory } from "@/types/content";
import type { SeoContentDocument, SeoPageFieldsInput } from "@/types/seo-content";

function newCategory(categories: MenuCategory[]): MenuCategory {
  const now = new Date().toISOString();
  return {
    id: createId("cat"),
    name: "",
    slug: "",
    description: "",
    sortOrder: categories.length + 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

export function AdminMenuCategoriesManager({
  categories,
  seoDocument
}: {
  categories: MenuCategory[];
  seoDocument: SeoContentDocument;
}) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<MenuCategory | null>(null);
  const [seoByLocale, setSeoByLocale] = useState<Partial<Record<Locale, SeoPageFieldsInput>>>({});
  const [seoLocale, setSeoLocale] = useState<Locale>("he");
  const [smartPasteOpen, setSmartPasteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isNew = draft ? !categories.some((c) => c.id === draft.id) : false;

  useEffect(() => {
    if (!draft || isNew) {
      setSeoByLocale({});
      return;
    }
    setSeoByLocale(buildInitialCategorySeoByLocale(seoDocument, draft.id));
    // Re-init only when opening a category, not when seoDocument refreshes in the background.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seoDocument read at open time
  }, [draft?.id, isNew]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const close = () => {
    setDraft(null);
    setSeoByLocale({});
    setSeoLocale("he");
    setSmartPasteOpen(false);
    setError(null);
  };

  const updateSeoLocale = (locale: Locale, fields: SeoPageFieldsInput) => {
    setSeoByLocale((current) => ({ ...current, [locale]: pickCategorySeoFields(fields) }));
  };

  const currentSeoFields =
    draft && !isNew
      ? (seoByLocale[seoLocale] ??
        getStoredCategorySeoFields(seoDocument, seoLocale, draft.id))
      : {};

  return (
    <>
      {toastMessage ? (
        <div className="admin-toast" role="status">
          {toastMessage}
        </div>
      ) : null}

      <AdminToolbar label="הוסף קטגוריה" onAdd={() => setDraft(newCategory(categories))} />
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>Slug</th>
            <th>סדר</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.slug}</td>
              <td>{category.sortOrder}</td>
              <td>
                <StatusBadge active={category.isActive} />
              </td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(category.name)) return;
                    run(async () => {
                      await deleteMenuCategoryAction(category.id);
                    });
                  }}
                  onEdit={() => setDraft({ ...category })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת קטגוריה" : "עריכת קטגוריה"} onClose={close}>
        {draft ? (
          <form
            ref={formRef}
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                if (isNew) {
                  await saveMenuCategoryAction(draft);
                  return;
                }

                const payload = LOCALES.reduce<Partial<Record<Locale, SeoPageFieldsInput>>>((acc, locale) => {
                  if (seoByLocale[locale]) {
                    acc[locale] = pickCategorySeoFields(seoByLocale[locale]);
                  }
                  return acc;
                }, {});

                await saveMenuCategoryWithSeoAction(draft, payload);
              }, close);
            }}
          >
            {!isNew ? (
              <div className="admin-form-toolbar">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setSmartPasteOpen(true)}
                >
                  הדבקה חכמה
                </button>
              </div>
            ) : null}

            <label>
              {adminFieldLabel("שם", "כותרת הקטגוריה ב-/menu")}
              <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>
              {adminFieldLabel("Slug (באנגלית, לקישור)", "זיהוי פנימי — לא מוצג למבקרים")}
              <input required value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            </label>
            <label>
              {adminFieldLabel("תיאור", "Google / Schema בלבד — לא מוצג בדף")}
              <textarea
                rows={3}
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>
            <label>
              {adminFieldLabel("סדר", "סדר הקטגוריה ב-/menu")}
              <input
                min={0}
                type="number"
                value={draft.sortOrder}
                onChange={(e) => setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })}
              />
            </label>
            <label className="admin-checkbox-row">
              <input
                checked={draft.isActive}
                type="checkbox"
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              />
              <span>{adminFieldLabel("קטגוריה פעילה", "הצגה / הסתרה ב-/menu")}</span>
            </label>

            {!isNew ? (
              <AdminCategorySeoSection
                categoryId={draft.id}
                seoDocument={seoDocument}
                seoByLocale={seoByLocale}
                locale={seoLocale}
                onLocaleChange={setSeoLocale}
                onChange={updateSeoLocale}
              />
            ) : (
              <p className="admin-field-hint">שמירת תוכן SEO זמינה לאחר יצירת הקטגוריה.</p>
            )}

            <AdminFormFooter error={error} isPending={isPending} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>

      {draft && !isNew ? (
        <AdminCategorySmartPasteModal
          open={smartPasteOpen}
          draft={draft}
          seoFields={currentSeoFields}
          seoLocale={seoLocale}
          onLocaleChange={setSeoLocale}
          onClose={() => setSmartPasteOpen(false)}
          onApply={(nextDraft, nextSeo) => {
            setDraft(nextDraft);
            updateSeoLocale(seoLocale, nextSeo);
            setToastMessage("השדות מולאו בהצלחה. ניתן לעבור עליהם ולשמור.");
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      ) : null}
    </>
  );
}
