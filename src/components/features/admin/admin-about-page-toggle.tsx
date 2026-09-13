"use client";

import { useState } from "react";
import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { setAboutPageEnabledAction } from "@/server/actions/page-visibility.actions";

export function AdminAboutPageToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const { isPending, error, run } = useAdminMutation();

  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        const next = !enabled;
        run(async () => {
          const saved = await setAboutPageEnabledAction(next);
          setEnabled(saved.aboutEnabled);
        });
      }}
    >
      <p className="admin-form-hint">
        {enabled
          ? "עמוד האודות מוצג בתפריט וזמין באתר."
          : "עמוד האודות מוסתר מהתפריט ומהאתר."}
      </p>
      <button className="button" type="submit" disabled={isPending}>
        {isPending ? "שומר…" : enabled ? "הסתר עמוד אודות" : "הפעל עמוד אודות"}
      </button>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
    </form>
  );
}
