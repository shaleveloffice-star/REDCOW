"use client";

import { useState } from "react";
import { MENU_ITEM_AI_PROMPT } from "@/lib/admin/menu-item-smart-paste/ai-prompt";

export function AdminMenuAiPromptButton() {
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(MENU_ITEM_AI_PROMPT);
      setCopied(true);
      setFallback(false);
    } catch {
      setCopied(false);
      setFallback(true);
    }
  }
  return (
    <div>
      <button className="button secondary" type="button" onClick={copy}>הנחיה ל־AI</button>
      {copied ? <p className="muted" role="status">ההנחיה הועתקה. הדביקו אותה ב־AI והוסיפו את פרטי המנה.</p> : null}
      {fallback ? <label>העתקה אוטומטית אינה זמינה — העתיקו את ההנחיה מכאן:
        <textarea readOnly rows={8} value={MENU_ITEM_AI_PROMPT} onFocus={event => event.currentTarget.select()} />
      </label> : null}
    </div>
  );
}
