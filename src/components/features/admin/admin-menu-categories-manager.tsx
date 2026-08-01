"use client";

import { useEffect, useState } from "react";

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
import { StatusBadge } from "@/components/features/admin/status-badge";
import { createId } from "@/lib/admin/new-id";
import { LOCALES, type Locale } from "@/i18n/config";
import { deleteMenuCategoryAction, saveMenuCategoryAction } from "@/server/actions/menu.actions";
import { saveCategorySeoFieldsAction } from "@/server/actions/seo-content.actions";
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
  const isNew = draft ? !categories.some((c) => c.id === draft.id) : false;

  useEffect(() => {
    if (!draft || isNew) {
      setSeoByLocale({});
      return;
    }
    setSeoByLocale(buildInitialCategorySeoByLocale(seoDocument, draft.id));
  }, [draft?.id, isNew, seoDocument]);

  const close = () => {
    setDraft(null);
    setSeoByLocale({});
    setError(null);
  };

  const updateSeoLocale = (locale: Locale, fields: SeoPageFieldsInput) => {
    setSeoByLocale((current) => ({ ...current, [locale]: fields }));
  };

  return (
    <>
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
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await saveMenuCategoryAction(draft);
                if (!isNew) {
                  await Promise.all(
                    LOCALES.map((locale) =>
                      saveCategorySeoFieldsAction(locale, draft.id, seoByLocale[locale] ?? {})
                    )
                  );
                }
              }, close);
            }}
          >
            <label>
              שם
              <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>
              Slug (באנגלית, לקישור)
              <input required value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            </label>
            <label>
              תיאור
              <textarea rows={3} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </label>
            <label>
              סדר
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
              <span>קטגוריה פעילה</span>
            </label>

            {!isNew ? (
              <AdminCategorySeoSection
                categoryId={draft.id}
                seoDocument={seoDocument}
                seoByLocale={seoByLocale}
                onChange={updateSeoLocale}
              />
            ) : (
              <p className="admin-field-hint">שמירת תוכן SEO זמינה לאחר יצירת הקטגוריה.</p>
            )}

            <AdminFormFooter error={error} isPending={isPending} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
