"use client";

import { AdminFormFooter, useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import {
  ADMIN_DELIVERY_ZONES_NOTE_SEED,
  ADMIN_DELIVERY_ZONES_SEED
} from "@/data/delivery-zones-defaults";
import { saveDeliveryZonesAction } from "@/server/actions/delivery-zones.actions";
import type { DeliveryZone, DeliveryZonesConfig } from "@/types/content";
import { useState } from "react";

function emptyZone(): DeliveryZone {
  return { name: "", areasNote: "" };
}

function cloneZones(zones: DeliveryZone[]): DeliveryZone[] {
  return zones.map((zone) => ({ name: zone.name, areasNote: zone.areasNote ?? "" }));
}

function formZonesFromConfig(config: DeliveryZonesConfig): DeliveryZone[] {
  // Until the first admin save, prefill with the live public list for editing.
  if (config.zones.length > 0) return cloneZones(config.zones);
  return cloneZones(ADMIN_DELIVERY_ZONES_SEED);
}

function formNoteFromConfig(config: DeliveryZonesConfig): string {
  if (config.note.trim()) return config.note;
  if (config.zones.length > 0) return "";
  return ADMIN_DELIVERY_ZONES_NOTE_SEED;
}

export function AdminDeliveryZonesManager({ initialConfig }: { initialConfig: DeliveryZonesConfig }) {
  const { isPending, error, setError, run } = useAdminMutation();
  const [zones, setZones] = useState<DeliveryZone[]>(() => formZonesFromConfig(initialConfig));
  const [note, setNote] = useState(() => formNoteFromConfig(initialConfig));
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const reset = () => {
    setZones(formZonesFromConfig(initialConfig));
    setNote(formNoteFromConfig(initialConfig));
    setError(null);
    setSavedAt(null);
  };

  return (
    <form
      className="admin-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        run(async () => {
          const result = await saveDeliveryZonesAction({ zones, note });
          setZones(cloneZones(result.config.zones));
          setNote(result.config.note);
          setSavedAt(new Date().toLocaleTimeString("he-IL"));
        });
      }}
    >
      <p className="admin-form-hint">
        העמוד הציבורי נשאר כמו שהוא עד לשמירה. אחרי שמירה, הרשימה כאן שולטת ב„אזורי המשלוחים” ב־/locations — בלי לשנות את מבנה העמוד.
      </p>

      <div className="admin-delivery-zones-list">
        {zones.map((zone, index) => (
          <div key={`zone-${index}`} className="admin-delivery-zone-row">
            <label>
              שם האזור
              <input
                required
                value={zone.name}
                onChange={(e) => {
                  const next = [...zones];
                  next[index] = { ...zone, name: e.target.value };
                  setZones(next);
                }}
              />
            </label>
            <label>
              הערה (אופציונלי)
              <input
                value={zone.areasNote ?? ""}
                placeholder='לדוגמה: אזורים נבחרים'
                onChange={(e) => {
                  const next = [...zones];
                  next[index] = { ...zone, areasNote: e.target.value };
                  setZones(next);
                }}
              />
            </label>
            <button
              type="button"
              className="button secondary"
              disabled={isPending || zones.length <= 1}
              onClick={() => setZones(zones.filter((_, i) => i !== index))}
            >
              הסר
            </button>
          </div>
        ))}
      </div>

      <div className="admin-form-actions" style={{ justifyContent: "flex-start" }}>
        <button
          type="button"
          className="button secondary"
          disabled={isPending || zones.length >= 40}
          onClick={() => setZones([...zones, emptyZone()])}
        >
          הוסף אזור
        </button>
      </div>

      <label>
        הערת משלוחים (מתחת לרשימה)
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      {savedAt ? (
        <p className="admin-form-hint" role="status">
          נשמר בשעה {savedAt}
        </p>
      ) : null}

      <AdminFormFooter
        error={error}
        isPending={isPending}
        onCancel={reset}
        submitLabel="שמירת אזורי משלוח"
      />
    </form>
  );
}
