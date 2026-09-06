"use client";

type AdminOpacityFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
};

export function AdminOpacityField({ label, value, onChange, hint }: AdminOpacityFieldProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <label className="admin-opacity-field">
      <span className="admin-opacity-field-head">
        <strong>{label}</strong>
        <em>{clamped}%</em>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label}
      />
      {hint ? <span className="admin-form-hint">{hint}</span> : null}
    </label>
  );
}
