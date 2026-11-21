/** Pure scroll math for Lazarus V3. No browser globals; testable in Node. */
export const clamp01 = value => Math.max(0, Math.min(1, Number.isFinite(value)?value:0));
export function progressWithin(top,height,viewport) {
  if(!(height>0) || !(viewport>0)) return 0;
  return clamp01((viewport*.84-top)/(height+viewport*.22));
}
export function phaseAt(progress,thresholds) {
  let current=0;
  for(let i=1;i<thresholds.length;i++)if(progress>=thresholds[i])current=i;
  return current;
}
