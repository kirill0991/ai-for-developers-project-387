/**
 * Two half-open intervals `[aStart, aEnd)` and `[bStart, bEnd)` overlap when
 * each starts before the other ends.
 */
export function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}
