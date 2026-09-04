"use client";

import { AdminModal } from "@/components/features/admin/admin-crud-ui";
import {
  STORY_AUTO_FILL_TYPE_LABELS,
  STORY_SUGGESTION_RISK_LABELS,
  type StorySuggestion
} from "@/lib/admin/story-auto-fill";

type AdminStorySuggestModalProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  suggestions: StorySuggestion[];
  onClose: () => void;
  onSelect: (suggestion: StorySuggestion) => void;
};

export function AdminStorySuggestModal({
  open,
  loading,
  error,
  suggestions,
  onClose,
  onSelect
}: AdminStorySuggestModalProps) {
  return (
    <AdminModal open={open} title="הצעות לסיפורים" onClose={onClose} stacked>
      {loading ? (
        <p className="admin-form-hint" role="status">
          חושב על 5 רעיונות...
        </p>
      ) : null}

      {!loading && error ? (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && suggestions.length > 0 ? (
        <div className="admin-story-suggest-grid">
          {suggestions.map((suggestion) => (
            <article
              key={`${suggestion.storyType}-${suggestion.primaryKeyword}-${suggestion.title}`}
              className="admin-story-suggest-card"
            >
              <h4 className="admin-story-suggest-card-title">{suggestion.title}</h4>

              <dl className="admin-story-suggest-meta">
                <div>
                  <dt>מילת מפתח</dt>
                  <dd>{suggestion.primaryKeyword}</dd>
                </div>
                <div>
                  <dt>סוג</dt>
                  <dd>{STORY_AUTO_FILL_TYPE_LABELS[suggestion.storyType]}</dd>
                </div>
                <div>
                  <dt>קטגוריה</dt>
                  <dd>{suggestion.category}</dd>
                </div>
                <div>
                  <dt>זווית</dt>
                  <dd>{suggestion.angle}</dd>
                </div>
                <div>
                  <dt>למה זה מתאים</dt>
                  <dd>{suggestion.reason}</dd>
                </div>
              </dl>

              <p className="admin-story-suggest-risk">
                קניבליזציה:{" "}
                <span
                  className={`admin-story-suggest-badge admin-story-suggest-badge--${suggestion.cannibalizationRisk}`}
                >
                  {STORY_SUGGESTION_RISK_LABELS[suggestion.cannibalizationRisk]}
                </span>
              </p>

              {suggestion.conflictingPages.length > 0 ? (
                <div className="admin-story-suggest-conflicts">
                  <p>עשוי לחפוף ל:</p>
                  <ul>
                    {suggestion.conflictingPages.slice(0, 4).map((page) => (
                      <li key={`${page.path}-${page.keyword}`}>
                        {page.label} <span>({page.path})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <button
                type="button"
                className="button"
                onClick={() => onSelect(suggestion)}
              >
                בחר סיפור
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !error && suggestions.length === 0 ? (
        <p className="admin-form-hint">אין הצעות להצגה.</p>
      ) : null}

      <div className="admin-form-actions" style={{ marginTop: 16 }}>
        <button type="button" className="button secondary" onClick={onClose} disabled={loading}>
          סגור
        </button>
      </div>
    </AdminModal>
  );
}
