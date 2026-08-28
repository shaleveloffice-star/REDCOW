export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`admin-status-badge${active ? " is-active" : " is-inactive"}`}>
      {active ? "פעיל" : "לא פעיל"}
    </span>
  );
}
