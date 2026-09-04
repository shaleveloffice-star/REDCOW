"use client";

import { useMemo, useState } from "react";

import {
  applyStoryAutoFillToDraft,
  generateStoryAutoFill,
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

type AdminStoryAutoFillPanelProps = {
  draft: BrandStory;
  existingStories: StoryAutoFillExistingStory[];
  onApply: (next: BrandStory) => void;
};

export function AdminStoryAutoFillPanel({
  draft,
  existingStories,
  onApply
}: AdminStoryAutoFillPanelProps) {
  const [input, setInput] = useState<StoryAutoFillInput>(EMPTY_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<StoryCannibalizationHit[]>([]);
  const [preview, setPreview] = useState<StoryAutoFillDraftFields | null>(null);
  const [blocked, setBlocked] = useState(false);

  const hasExistingContent = useMemo(() => storyDraftHasContent(draft), [draft]);

  const update = <K extends keyof StoryAutoFillInput>(key: K, value: StoryAutoFillInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const runGenerate = (acknowledgeOverlaps: boolean) => {
    setError(null);
    try {
      const result = generateStoryAutoFill({
        input,
        existingStories,
        excludeStoryId: draft.id,
        acknowledgeOverlaps
      });
      setWarnings(result.warnings);
      setBlocked(result.blocked);
      setPreview(result.fields);
      if (result.blocked && !acknowledgeOverlaps) {
        setError("נמצאה חפיפת SEO אפשרית. בדקו את האזהרות למטה או אשרו בכל זאת.");
      }
    } catch (err) {
      setPreview(null);
      setWarnings([]);
      setBlocked(false);
      setError(err instanceof Error ? err.message : "יצירת התוכן נכשלה");
    }
  };

  const applyPreview = () => {
    if (!preview) return;
    if (hasExistingContent) {
      const ok = window.confirm(
        "יש כבר תוכן בטופס. להחליף כותרת, SEO ומקטעים בתוכן שנוצר? (נשאר כטיוטה — לא מפורסם)"
      );
      if (!ok) return;
    }
    onApply(applyStoryAutoFillToDraft(draft, preview));
    setError(null);
  };

  return (
    <fieldset className="admin-fieldset admin-story-auto-fill">
      <legend>יצירת תוכן אוטומטית</legend>
      <p className="admin-form-hint">
        מלאו פרטים בסיסיים ולחצו &quot;מלא תוכן&quot;. התוצאה נכנסת לטופס כטיוטה בלבד — בלי פרסום אוטומטי.
      </p>

      <label>
        מילת מפתח ראשית
        <input
          value={input.primaryKeyword}
          onChange={(e) => update("primaryKeyword", e.target.value)}
          placeholder="לדוגמה: סמאש בורגר"
        />
      </label>
      <label>
        מילות מפתח משניות
        <input
          value={input.secondaryKeywords}
          onChange={(e) => update("secondaryKeywords", e.target.value)}
          placeholder="מופרדות בפסיק"
        />
      </label>
      <label>
        סוג הסיפור
        <select
          value={input.storyType}
          onChange={(e) => update("storyType", e.target.value as StoryAutoFillType)}
        >
          {STORY_AUTO_FILL_TYPES.map((type) => (
            <option key={type} value={type}>
              {STORY_AUTO_FILL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <label>
        נושא / זווית הסיפור
        <textarea
          rows={2}
          value={input.angle}
          onChange={(e) => update("angle", e.target.value)}
          placeholder="לדוגמה: איך בונים צריבה נכונה בלי הגזמות"
        />
      </label>
      <label>
        אורך
        <select
          value={input.length}
          onChange={(e) => update("length", e.target.value as StoryAutoFillLength)}
        >
          {STORY_AUTO_FILL_LENGTHS.map((length) => (
            <option key={length} value={length}>
              {STORY_AUTO_FILL_LENGTH_LABELS[length]}
            </option>
          ))}
        </select>
      </label>
      <label>
        מטרת העמוד
        <select
          value={input.goal}
          onChange={(e) => update("goal", e.target.value as StoryAutoFillGoal)}
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
        >
          {STORY_AUTO_FILL_CTAS.map((cta) => (
            <option key={cta} value={cta}>
              {STORY_AUTO_FILL_CTA_LABELS[cta]}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-row-actions" style={{ marginTop: 8 }}>
        <button
          type="button"
          className="button"
          onClick={() => runGenerate(false)}
        >
          מלא תוכן
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            if (hasExistingContent) {
              const ok = window.confirm("למלא מחדש וליצור תצוגה מקדימה חדשה? התוכן הנוכחי בטופס לא יידרס עד שתאשרו החלה.");
              if (!ok) return;
            }
            runGenerate(false);
          }}
        >
          מלא מחדש
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
            <strong>אזהרות קניבליזציה</strong>
          </p>
          <ul>
            {warnings.map((hit) => (
              <li key={`${hit.path}-${hit.keyword}`}>
                <strong>{hit.keyword}</strong> חופף ל־{hit.label} ({hit.path}). {hit.reason}. הצעה:{" "}
                {hit.suggestedAngle}
              </li>
            ))}
          </ul>
          {blocked ? (
            <button type="button" className="button secondary" onClick={() => runGenerate(true)}>
              המשך בכל זאת (תצוגה מקדימה)
            </button>
          ) : null}
        </div>
      ) : null}

      {preview && !blocked ? (
        <div className="admin-story-auto-fill-preview">
          <p>
            <strong>תצוגה מקדימה לפני החלה</strong>
          </p>
          <p>
            <strong>כותרת:</strong> {preview.title}
          </p>
          <p>
            <strong>Slug:</strong> {preview.slug}
          </p>
          <p>
            <strong>קטגוריה:</strong> {preview.category}
          </p>
          <p>
            <strong>Meta Title:</strong> {preview.metaTitle}
          </p>
          <p>
            <strong>Meta Description:</strong> {preview.metaDescription}
          </p>
          <p>
            <strong>OG מוצע:</strong> {preview.ogImageSuggestion}
          </p>
          <p>
            <strong>מקטעים:</strong> {preview.sections.length}
          </p>
          <ol>
            {preview.sections.map((section, index) => (
              <li key={`${section.type}-${index}`}>
                {section.type}
                {"title" in section && section.title ? ` — ${section.title}` : ""}
                {"label" in section && section.label ? ` — ${section.label}` : ""}
              </li>
            ))}
          </ol>
          <button type="button" className="button" onClick={applyPreview}>
            החל על הטופס (טיוטה)
          </button>
        </div>
      ) : null}
    </fieldset>
  );
}
