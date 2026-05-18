export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="pill"
      style={{
        borderColor: active ? "rgba(63, 185, 112, 0.5)" : "rgba(243, 182, 75, 0.5)",
        color: active ? "var(--success)" : "var(--warning)"
      }}
    >
      {active ? "פעיל" : "לא פעיל"}
    </span>
  );
}
