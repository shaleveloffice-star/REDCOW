"use client";

import { useMemo, useRef, useState } from "react";

import { AdminStorySuggestModal } from "@/components/features/admin/admin-story-suggest-modal";
import {
  applyStoryAutoFillToDraft,
  storyDraftHasContent,
  STORY_AUTO_FILL_CTA_LABELS,
  STORY_AUTO_FILL_CTAS,
  STORY_AUTO_FILL_GOAL_LABELS,
  STORY_AUTO_FILL_GOALS,
  STORY_AUTO_FILL_LENGTH_LABELS,
  STORY_AUTO_FILL_LENGTHS,
  STORY_AUTO_FILL_MAX_LAYOUT_SECTIONS,
  STORY_AUTO_FILL_TYPE_LABELS,
  STORY_AUTO_FILL_TYPES,
  type StoryAutoFillCta,
  type StoryAutoFillDraftFields,
  type StoryAutoFillExistingStory,
  type StoryAutoFillGoal,
  type StoryAutoFillInput,
  type StoryAutoFillLength,
  type StoryAutoFillType,
  type StoryCannibalizationHit,
  type StorySuggestion
} from "@/lib/admin/story-auto-fill";
import { STORY_SECTION_TYPE_LABELS } from "@/lib/stories/section-type-labels";
import { STORY_SECTION_TYPES, type BrandStory, type StorySectionType } from "@/types/story";

const EMPTY_INPUT: StoryAutoFillInput = {
  primaryKeyword: "",
  secondaryKeywords: "",
  storyType: "magazine",
  angle: "",
  length: "medium",
  goal: "seo",
  cta: "auto",
  sectionLayout: []
};

function StoryLayoutField({
  value,
  onChange,
  disabled
}: {
  value: StorySectionType[];
  onChange: (next: StorySectionType[]) => void;
  disabled: boolean;
}) {
  const [nextType, setNextType] = useState<StorySectionType>("split-text-image");
  const full = value.length >= STORY_AUTO_FILL_MAX_LAYOUT_SECTIONS;

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="admin-story-layout-field">
      <span className="admin-story-layout-title">מבנה המקטעים (אופציונלי)</span>
      <p className="admin-form-hint">
        בחרו סוגי מקטעים לפי הסדר, וה־AI ייצור את הסיפור בדיוק במבנה הזה. השאירו ריק כדי שה־AI יבחר לבד
        לפי האורך.
      </p>
      {value.length > 0 ? (
        <ol className="admin-story-layout-list">
          {value.map((type, index) => (
            <li key={`${index}-${type}`}>
              <span>
                {index + 1}. {STORY_SECTION_TYPE_LABELS[type]}
              </span>
              <span className="admin-story-layout-item-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => move(index, -1)}
                  disabled={disabled || index === 0}
                  aria-label={`הזז למעלה: מקטע ${index + 1}`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => move(index, 1)}
                  disabled={disabled || index === value.length - 1}
                  aria-label={`הזז למטה: מקטע ${index + 1}`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  disabled={disabled}
                  aria-label={`הסר: מקטע ${index + 1}`}
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="admin-story-layout-add">
        <select
          aria-label="סוג מקטע להוספה למבנה"
          value={nextType}
          onChange={(e) => setNextType(e.target.value as StorySectionType)}
          disabled={disabled || full}
        >
          {STORY_SECTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {STORY_SECTION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="button secondary"
          onClick={() => onChange([...value, nextType])}
          disabled={disabled || full}
        >
          הוסף למבנה
        </button>
        {value.length > 0 ? (
          <button type="button" className="button secondary" onClick={() => onChange([])} disabled={disabled}>
            נקה מבנה
          </button>
        ) : null}
      </div>
      {full ? (
        <p className="admin-form-hint">אפשר עד {STORY_AUTO_FILL_MAX_LAYOUT_SECTIONS} מקטעים.</p>
      ) : null}
    </div>
  );
}

type GenerateApiSuccess = {
  ok: true;
  blocked: boolean;
  fields?: StoryAutoFillDraftFields;
  warnings?: StoryCannibalizationHit[];
  warning?: {
    type: "cannibalization";
    conflictingPages: Array<{
      label: string;
      path: string;
      keyword: string;
      reason: string;
    }>;
    suggestedAngle: string;
  };
};

type GenerateApiFailure = {
  ok: false;
  error?: string;
};

type AdminStoryAutoFillPanelProps = {
  draft: BrandStory;
  existingStories: StoryAutoFillExistingStory[];
  onApply: (next: BrandStory) => void;
};

export function AdminStoryAutoFillPanel({
  draft,
  existingStories: _existingStories,
  onApply
}: AdminStoryAutoFillPanelProps) {
  const [input, setInput] = useState<StoryAutoFillInput>(EMPTY_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<StoryCannibalizationHit[]>([]);
  const [preview, setPreview] = useState<StoryAutoFillDraftFields | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [suggestedAngle, setSuggestedAngle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<StorySuggestion[]>([]);
  const inFlightRef = useRef(false);
  const suggestInFlightRef = useRef(false);

  const hasExistingContent = useMemo(() => storyDraftHasContent(draft), [draft]);

  const update = <K extends keyof StoryAutoFillInput>(key: K, value: StoryAutoFillInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const busy = loading || suggestLoading;
  const layout = input.sectionLayout ?? [];
  const hasLayout = layout.length > 0;
  const layoutWithoutCta = hasLayout && !layout.includes("cta");

  const runSuggest = async () => {
    if (suggestInFlightRef.current) return;
    suggestInFlightRef.current = true;
    setSuggestOpen(true);
    setSuggestLoading(true);
    setSuggestError(null);
    setSuggestions([]);

    try {
      const response = await fetch("/api/admin/stories/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      let payload: { ok: true; suggestions?: StorySuggestion[] } | { ok: false; error?: string };
      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        setSuggestError("לא הצלחנו להציע סיפורים כרגע. נסו שוב.");
        return;
      }

      if (!response.ok || !payload.ok) {
        setSuggestError(
          (!payload.ok && payload.error) || "לא הצלחנו להציע סיפורים כרגע. נסו שוב."
        );
        return;
      }

      const next = payload.suggestions ?? [];
      if (next.length === 0) {
        setSuggestError("לא הצלחנו להציע סיפורים כרגע. נסו שוב.");
        return;
      }

      setSuggestions(next);
    } catch {
      setSuggestError("לא הצלחנו להציע סיפורים כרגע. נסו שוב.");
    } finally {
      suggestInFlightRef.current = false;
      setSuggestLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: StorySuggestion) => {
    setInput({
      primaryKeyword: suggestion.primaryKeyword,
      secondaryKeywords: suggestion.secondaryKeywords.join(", "),
      storyType: suggestion.storyType,
      angle: suggestion.angle,
      length: input.length || "medium",
      goal: suggestion.goal,
      cta: suggestion.cta,
      sectionLayout: input.sectionLayout
    });
    setSuggestOpen(false);
    setSuggestions([]);
    setSuggestError(null);
    setError(null);
  };

  const runGenerate = async (acknowledgeOverlaps: boolean) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryKeyword: input.primaryKeyword,
          secondaryKeywords: input.secondaryKeywords,
          storyType: input.storyType,
          angle: input.angle,
          length: input.length,
          goal: input.goal,
          cta: input.cta,
          sectionLayout: layout,
          excludeStoryId: draft.id,
          acknowledgeOverlaps
        })
      });

      let payload: GenerateApiSuccess | GenerateApiFailure;
      try {
        payload = (await response.json()) as GenerateApiSuccess | GenerateApiFailure;
      } catch {
        setPreview(null);
        setWarnings([]);
        setBlocked(false);
        setSuggestedAngle(null);
        setError(
          response.status === 429
            ? "יותר מדי בקשות. נסו שוב בעוד כמה דקות."
            : response.status >= 500
              ? "שגיאת שרת ביצירת התוכן. נסו שוב."
              : "תשובת השרת לא תקינה."
        );
        return;
      }

      if (!response.ok || !payload.ok) {
        setPreview(null);
        setWarnings([]);
        setBlocked(false);
        setSuggestedAngle(null);
        const message =
          !payload.ok && payload.error
            ? payload.error
            : response.status === 429
              ? "יותר מדי בקשות. נסו שוב בעוד כמה דקות."
              : response.status === 504
                ? "יצירת התוכן חרגה מזמן ההמתנה. נסו שוב."
                : "יצירת התוכן נכשלה.";
        setError(message);
        return;
      }

      const nextWarnings = payload.warnings ?? [];
      setWarnings(nextWarnings);

      if (payload.blocked) {
        setBlocked(true);
        setPreview(null);
        setSuggestedAngle(payload.warning?.suggestedAngle ?? null);
        setError("חפיפת SEO אפשרית - בדקו למטה או המשיכו בכל זאת.");
        return;
      }

      if (!payload.fields) {
        setBlocked(false);
        setPreview(null);
        setSuggestedAngle(null);
        setError("תשובה לא תקינה. הטופס לא עודכן.");
        return;
      }

      setBlocked(false);
      setSuggestedAngle(null);
      setPreview(payload.fields);
      onApply(applyStoryAutoFillToDraft(draft, payload.fields));
      setError(null);
    } catch {
      setPreview(null);
      setWarnings([]);
      setBlocked(false);
      setSuggestedAngle(null);
      setError("לא ניתן להתחבר לשרת. בדקו את החיבור ונסו שוב.");
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  const handleFill = () => {
    void runGenerate(false);
  };

  const handleRefill = () => {
    if (hasExistingContent) {
      const ok = window.confirm("יש תוכן בטופס. לדרוס בטיוטה חדשה מה־AI?");
      if (!ok) return;
    }
    void runGenerate(false);
  };

  return (
    <fieldset className="admin-fieldset admin-story-auto-fill">
      <legend className="admin-story-auto-fill-legend">
        <span>יצירה ב־AI</span>
        <button
          type="button"
          className="admin-story-auto-fill-info-btn"
          aria-expanded={showTips}
          aria-controls="story-ai-tips"
          onClick={() => setShowTips((prev) => !prev)}
        >
          חשוב
        </button>
      </legend>

      {showTips ? (
        <div id="story-ai-tips" className="admin-story-auto-fill-tips" role="note">
          <ul>
            <li>יוצר טיוטה בלבד - לא שומר ולא מפרסם.</li>
            <li>אחרי יצירה עברו ל״ידני״ לעריכה ושמירה.</li>
            <li>סגנון צנוע: בלי הגזמות ובלי סיפורי מותג מומצאים.</li>
          </ul>
        </div>
      ) : null}

      <p className="admin-form-hint">מלאו מילות מפתח ולחצו &quot;צור&quot; - או בקשו הצעות אוטומטיות.</p>

      <div className="admin-row-actions" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="button"
          onClick={() => void runSuggest()}
          disabled={busy}
        >
          {suggestLoading ? "חושב על 5 רעיונות..." : "הצע לי סיפורים"}
        </button>
      </div>

      <label>
        מילת מפתח ראשית
        <input
          value={input.primaryKeyword}
          onChange={(e) => update("primaryKeyword", e.target.value)}
          placeholder="לדוגמה: סמאש בורגר"
          disabled={busy}
        />
      </label>
      <label>
        מילות מפתח משניות
        <input
          value={input.secondaryKeywords}
          onChange={(e) => update("secondaryKeywords", e.target.value)}
          placeholder="מופרדות בפסיק"
          disabled={busy}
        />
      </label>
      <label>
        סוג הסיפור
        <select
          value={input.storyType}
          onChange={(e) => update("storyType", e.target.value as StoryAutoFillType)}
          disabled={busy}
        >
          {STORY_AUTO_FILL_TYPES.map((type) => (
            <option key={type} value={type}>
              {STORY_AUTO_FILL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <label>
        נושא / זווית
        <textarea
          rows={2}
          value={input.angle}
          onChange={(e) => update("angle", e.target.value)}
          placeholder="לדוגמה: צריבה נכונה בלי הגזמות"
          disabled={busy}
        />
      </label>
      <StoryLayoutField
        value={layout}
        onChange={(next) => update("sectionLayout", next)}
        disabled={busy}
      />
      <label>
        אורך
        <select
          value={input.length}
          onChange={(e) => update("length", e.target.value as StoryAutoFillLength)}
          disabled={busy || hasLayout}
        >
          {STORY_AUTO_FILL_LENGTHS.map((length) => (
            <option key={length} value={length}>
              {STORY_AUTO_FILL_LENGTH_LABELS[length]}
            </option>
          ))}
        </select>
        {hasLayout ? <span className="admin-form-hint">נקבע לפי מבנה המקטעים ({layout.length}).</span> : null}
      </label>
      <label>
        מטרה
        <select
          value={input.goal}
          onChange={(e) => update("goal", e.target.value as StoryAutoFillGoal)}
          disabled={busy}
        >
          {STORY_AUTO_FILL_GOALS.map((goal) => (
            <option key={goal} value={goal}>
              {STORY_AUTO_FILL_GOAL_LABELS[goal]}
            </option>
          ))}
        </select>
      </label>
      <label>
        CTA
        <select
          value={input.cta}
          onChange={(e) => update("cta", e.target.value as StoryAutoFillCta)}
          disabled={busy || layoutWithoutCta}
        >
          {STORY_AUTO_FILL_CTAS.map((cta) => (
            <option key={cta} value={cta}>
              {STORY_AUTO_FILL_CTA_LABELS[cta]}
            </option>
          ))}
        </select>
        {layoutWithoutCta ? (
          <span className="admin-form-hint">אין &quot;קריאה לפעולה&quot; במבנה - לא יתווסף CTA.</span>
        ) : null}
      </label>

      <div className="admin-row-actions" style={{ marginTop: 8 }}>
        <button type="button" className="button" onClick={handleFill} disabled={busy}>
          {loading ? "יוצר..." : "צור"}
        </button>
        <button type="button" className="button secondary" onClick={handleRefill} disabled={busy}>
          {loading ? "יוצר..." : "צור מחדש"}
        </button>
      </div>

      {error ? (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      ) : null}

      {warnings.length > 0 ? (
        <div className="admin-story-auto-fill-warnings" role="status">
          <p>
            <strong>אזהרת SEO</strong>
          </p>
          {suggestedAngle ? <p>זווית מוצעת: {suggestedAngle}</p> : null}
          <ul>
            {warnings.map((hit) => (
              <li key={`${hit.path}-${hit.keyword}`}>
                <strong>{hit.keyword}</strong> ↔ {hit.label} ({hit.path}). {hit.suggestedAngle}
              </li>
            ))}
          </ul>
          {blocked ? (
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => void runGenerate(true)}
            >
              {loading ? "יוצר..." : "המשך בכל זאת"}
            </button>
          ) : null}
        </div>
      ) : null}

      {preview && !blocked ? (
        <div className="admin-story-auto-fill-preview">
          <p>
            <strong>טיוטה מוכנה</strong> - {preview.title} · {preview.sections.length} מקטעים
          </p>
        </div>
      ) : null}

      <AdminStorySuggestModal
        open={suggestOpen}
        loading={suggestLoading}
        error={suggestError}
        suggestions={suggestions}
        onClose={() => {
          if (suggestLoading) return;
          setSuggestOpen(false);
        }}
        onSelect={handleSelectSuggestion}
      />
    </fieldset>
  );
}
