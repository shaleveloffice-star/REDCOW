/** Recycle only after a whole card has left the viewport. Each creator stays mounted once. */
export function creatorSlot(index: number, distance: number, count: number): number {
  return ((index - distance + 1) % count + count) % count - 1;
}
