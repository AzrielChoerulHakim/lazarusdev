/** Pixel-distance pacing for the one exterior Paperkeeper.
 * The actor may move only while the visitor scrolls. A slow 40px scroll
 * advances at most 14px (desktop), never a whole waypoint in 100ms.
 * Kept pure so the pacing contract can be tested without a browser.
 */
export function paceTowards(current, target, scrollPixels, pixelsPerScrollPixel = .34) {
  const distance = Math.hypot(target[0]-current[0], target[1]-current[1]);
  const allowance = Math.max(0,scrollPixels) * pixelsPerScrollPixel;
  if (!Number.isFinite(distance) || !Number.isFinite(allowance) || allowance <= 0 || distance === 0) return [...current];
  if (distance <= allowance) return [...target];
  const ratio = allowance / distance;
  return [current[0]+(target[0]-current[0])*ratio, current[1]+(target[1]-current[1])*ratio];
}
