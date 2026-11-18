/** R15 / Hand-directed light geometry for The Atrium.
 * Scene units follow the authored 1200x800 SVG. No 3D runtime or generic
 * CSS shadow translation: each column projects a separate floor polygon.
 * This is a physically motivated 2D approximation, not ray-traced lighting.
 */
export const ATRIUM_PILLAR_CENTERS = Object.freeze([300, 900]);
export const clampLight = value => Math.max(0, Math.min(100, Number(value) || 0));
const round = n => Math.round(n * 10) / 10;
function castFrom(center, sourceX) {
  const distance = Math.abs(center - sourceX);
  const displacement = (center - sourceX) * .72;
  const projectionY = Math.min(852, 660 + distance * .235);
  const tipCenter = center + displacement;
  const tipHalf = 54 + distance * .09;
  const frontHalf = 66;
  const softHalf = tipHalf + 28;
  const path = (startHalf, endHalf, y) =>
    `M${round(center-startHalf)} 610 L${round(center+startHalf)} 610 L${round(tipCenter+endHalf)} ${round(y)} L${round(tipCenter-endHalf)} ${round(y)} Z`;
  return {
    core: path(frontHalf, tipHalf, projectionY),
    penumbra: path(frontHalf+12, softHalf, projectionY+16),
    reach: round(Math.abs(displacement)),
    length: round(projectionY - 610),
    direction: Math.sign(displacement)
  };
}
export function projectAtriumLight(input) {
  const value = clampLight(input);
  const sourceX = 140 + 920 * value / 100;
  const left = castFrom(ATRIUM_PILLAR_CENTERS[0], sourceX);
  const right = castFrom(ATRIUM_PILLAR_CENTERS[1], sourceX);
  const raking = Math.max(0, 1 - Math.abs(value - 52) / 60);
  return {
    value,
    sourceX: round(sourceX),
    lampPercent: round(12 + .76 * value),
    left,
    right,
    // Relief is only legible where the moving light grazes the carving;
    // no one-way global fade that simply tracks slider percentage.
    reliefOpacity: round(.14 + .72 * raking),
    reliefRaking: round(.08 + .86 * raking),
    leftColumnLight: round(.22 + .64 * (1 - Math.min(1, Math.abs(sourceX - 300) / 980))),
    rightColumnLight: round(.22 + .64 * (1 - Math.min(1, Math.abs(sourceX - 900) / 980))),
    // The etching catches grazing light only around the moving light source.
    reliefBeamFrom: round(sourceX - 410),
    reliefBeamTo: round(sourceX + 410)
  };
}
