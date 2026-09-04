"use client";

import { useMemo, useRef, useState } from "react";

import {
  applyStoryAutoFillToDraft,
  storyDraftHasContent,
  STORY_AUTO_FILL_CTA_LABELS,
  STORY_AUTO_FILL_CTAS,
  STORY_AUTO_FILL_GOAL_LABELS,
  STORY_AUTO_FILL_GOALS,
  STORY_AUTO_FILL_LENGTH_LABELS,
  STORY_AUTO_FILL_LENGTHS,
  STORY_AUTO_FILL_TYPE_LABELS,
  STORY_AUTO_FILL_TYPES,
  type StoryAutoFillCta,
  type StoryAutoFillDraftFields,
  type StoryAutoFillExistingStory,
  type StoryAutoFillGoal,
  type StoryAutoFillInput,
  type StoryAutoFillLength,
  type StoryAutoFillType,
  type StoryCannibalizationHit
} from "@/lib/admin/story-auto-fill";
import type { BrandStory } from "@/types/story";

const EMPTY_INPUT: StoryAutoFillInput = {
  primaryKeyword: "",
  secondaryKeywords: "",
  storyType: "magazine",
  angle: "",
  length: "medium",
  goal: "seo",
  cta: "auto"
};

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
  const inFlightRef = useRef(false);

  const hasExistingContent = useMemo(() => storyDraftHasContent(draft), [draft]);

  const update = <K extends keyof StoryAutoFillInput>(key: K, value: StoryAutoFillInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
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
        setError("חפיפת SEO אפשרית — בדקו למטה או המשיכו בכל זאת.");
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
            <li>יוצר טיוטה בלבד — לא שומר ולא מפרסם.</li>
            <li>אחרי יצירה עברו ל״ידני״ לעריכה ושמירה.</li>
            <li>סגנון צנוע: בלי הגזמות ובלי סיפורי מותג מומצאים.</li>
          </ul>
        </div>
      ) : null}

      <p className="admin-form-hint">מלאו מילות מפתח ולחצו &quot;צור&quot;.</p>

      <label>
        מילת מפתח ראשית
        <input
          value={input.primaryKeyword}
          onChange={(e) => update("primaryKeyword", e.target.value)}
          placeholder="לדוגמה: סמאש בורגר"
          disabled={loading}
        />
      </label>
      <label>
        מילות מפתח משניות
        <input
          value={input.secondaryKeywords}
          onChange={(e) => update("secondaryKeywords", e.target.value)}
          placeholder="מופרדות בפסיק"
          disabled={loading}
        />
      </label>
      <label>
        סוג הסיפור
        <select
          value={input.storyType}
          onChange={(e) => update("storyType", e.target.value as StoryAutoFillType)}
          disabled={loading}
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
          disabled={loading}
        />
      </label>
      <label>
        אורך
        <select
          value={input.length}
          onChange={(e) => update("length", e.target.value as StoryAutoFillLength)}
          disabled={loading}
        >
          {STORY_AUTO_FILL_LENGTHS.map((length) => (
            <option key={length} value={length}>
              {STORY_AUTO_FILL_LENGTH_LABELS[length]}
            </option>
          ))}
        </select>
      </label>
      <label>
        מטרה
        <select
          value={input.goal}
          onChange={(e) => update("goal", e.target.value as StoryAutoFillGoal)}
          disabled={loading}
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
          disabled={loading}
        >
          {STORY_AUTO_FILL_CTAS.map((cta) => (
            <option key={cta} value={cta}>
              {STORY_AUTO_FILL_CTA_LABELS[cta]}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-row-actions" style={{ marginTop: 8 }}>
        <button type="button" className="button" onClick={handleFill} disabled={loading}>
          {loading ? "יוצר..." : "צור"}
        </button>
        <button type="button" className="button secondary" onClick={handleRefill} disabled={loading}>
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
              disabled={loading}
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
            <strong>טיוטה מוכנה</strong> — {preview.title} · {preview.sections.length} מקטעים
          </p>
        </div>
      ) : null}
    </fieldset>
  );
}
