/** Recycle only after a whole card has left the viewport. Each creator stays mounted once. */
export function creatorSlot(index: number, distance: number, count: number): number {
  return ((index - distance + 1) % count + count) % count - 1;
}

/** Two independent rows, `visiblePerRow` cards each, without duplicating creators. */
export function creatorPosition(
  index: number,
  count: number,
  distance = 0,
  visiblePerRow = 3
) {
  const capacity = visiblePerRow * 2;
  const firstRowCount = count <= capacity ? Math.min(visiblePerRow, count) : Math.ceil(count / 2);
  const row = index < firstRowCount ? 1 : 2;
  const rowCount = row === 1 ? firstRowCount : count - firstRowCount;
  const rowIndex = row === 1 ? index : index - firstRowCount;
  // The track is LTR: decreasing distance moves right, increasing it moves left.
  const directedDistance = row === 1 ? -distance : distance;
  return {
    row,
    slot: rowCount > visiblePerRow ? creatorSlot(rowIndex, directedDistance, rowCount) : rowIndex
  };
}
