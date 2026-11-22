// Foot positions in the paintings, expressed as percentages from bottom left.
const routes = {
  path: [[13, 6], [32, 18], [43, 29], [56, 37], [63, 48]],
  clearing: [[9, 4], [28, 6], [47, 5], [55, 9]],
  river: [[47, 5], [61, 8], [70, 12], [77, 14]],
  house: [[12, 4], [34, 13], [45, 20], [59, 30], [73, 40]]
};
const portrait = {
  path: [[12, 5], [35, 14], [53, 26], [41, 36], [57, 46]],
  clearing: [[10, 5], [33, 7], [52, 5], [62, 8]],
  river: [[46, 8], [61, 12], [76, 15]],
  house: [[14, 5], [39, 12], [52, 20], [62, 31], [72, 42]]
};
const crossings = {
  'winding-path': [[12, 4], [48, 6], [84, 12]],
  'work-clearing': [[12, 12], [48, 7], [78, 5]],
  'river-stories': [[12, 14], [45, 10], [78, 3]],
  'house-on-the-hill': [[12, 3], [52, 8], [83, 18]]
};
const arrivalPose = { path: 'stand', clearing: 'look', river: 'read', house: 'lantern' };
const poses = ['step-a', 'step-b', 'step-c', 'stand', 'turn', 'look', 'reach', 'read', 'lantern'];
const strides = ['step-a', 'step-b', 'step-c', 'step-b'];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const visible = new Map([...document.querySelectorAll('[data-walk]')].map(node => [node, { facing: 1, height: node.offsetHeight || 95 }]));
let settleTimer;

function groundPoint(points, width, height, progress) {
  const lengths = points.slice(1).map(([x, y], i) =>
    Math.hypot((x - points[i][0]) * width / 100, (y - points[i][1]) * height / 100));
  const distance = progress * lengths.reduce((a, b) => a + b, 0);
  let remaining = distance;
  let i = 0;
  while (i < lengths.length - 1 && remaining > lengths[i]) remaining -= lengths[i++];
  const mix = remaining / (lengths[i] || 1);
  const [x, y] = points[i].map((v, axis) => v + mix * (points[i + 1][axis] - v));
  return { x: x * width / 100, y: y * height / 100, elevation: y, distance };
}

function paint(walker, state, still, snapshot) {
  const rect = walker.parentElement.getBoundingClientRect();
  const kind = walker.dataset.walk;
  const seam = walker.closest('[data-seam-to]');
  const route = seam ? crossings[seam.dataset.seamTo] : (rect.height > rect.width ? portrait : routes)[kind];
  // The director computes pinned progress from its scrolling WRAPPER, not
  // this sticky artwork's frozen viewport rectangle. A seam uses ordinary
  // unpinned progress but still shares the same animation frame.
  const progress = reduced.matches ? 1 : seam
    ? Math.max(0, Math.min(1, (innerHeight*.84 - seam.getBoundingClientRect().top) /
       (seam.getBoundingClientRect().height + innerHeight*.22)))
    : (snapshot.progress[kind] ?? 0);
  // Leave the last portion of each painted scene for the destination gesture.
  const arrival = seam ? 1 : .79;
  const point = groundPoint(route, rect.width, rect.height, Math.min(1, progress / arrival));
  const size = kind === 'path' || kind === 'house' ? 1 - (point.elevation - route[0][1]) * .009 : 1;
  const now = performance.now();
  if (snapshot.direction && snapshot.direction !== state.facing && !reduced.matches) {
    state.facing = snapshot.direction;
    state.turnUntil = now + 95;
  }
  let pose = 'stand';
  if (!seam && progress >= arrival) {
    pose = kind === 'river' && progress < .88 ? 'reach' : arrivalPose[kind];
  } else if (!still && !reduced.matches && state.distance !== undefined && Math.abs(point.distance-state.distance)>1 && progress > 0 && progress < 1) {
    pose = now < state.turnUntil ? 'turn' : strides[Math.floor(point.distance / (state.height * size * .18)) % strides.length];
  }
  // A finite rescue beat takes precedence over ordinary scrolling poses.
  if (kind === 'river' && !seam) {
    const story = walker.closest('.river-scene')?.dataset.rescue;
    const storyPose = {watch:'look-down', lantern:'set-lantern', reach:'reach', lift:'lift', carrying:'carry', still:'carry'};
    if (story && storyPose[story]) pose = storyPose[story];
  }
  if (kind === 'river') {
    const lift = Math.min(1, Math.max(0, (progress - arrival) / (.88 - arrival)));
    walker.style.setProperty('--page-lift', String(lift));
  }
  state.distance = point.distance;
  const facing = pose === 'turn' || reduced.matches ? 1 : state.facing;
  walker.style.transform = 'translate3d(' + point.x + 'px,' + -point.y + 'px,0) scale(' + size * facing + ',' + size + ')';
  // R15A's five real action drawings use a separate authored five-cell
  // sheet. The old nine slots remain source-linked for walking and resting.
  if (poses.includes(pose)) walker.style.backgroundPositionX = poses.indexOf(pose) * 12.5 + '%';
  else walker.style.removeProperty('background-position-x');
  walker.dataset.pose = pose;
  if (kind === 'house') walker.parentElement.style.setProperty('--arrival-light', String(.12 + progress * .29));
}

// Called after the director's one passive scroll/resize RAF. No competing
// IntersectionObserver, per-walker frame loops or sticky-rectangle progress.
function onStoryFrame(event) {
  const snapshot = event.detail;
  if (document.hidden) return;
  for (const [walker, state] of visible) {
    if (!walker.isConnected) continue;
    const rect = walker.parentElement.getBoundingClientRect();
    if (rect.bottom < -innerHeight || rect.top > innerHeight*2) continue;
    paint(walker, state, false, snapshot);
  }
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    if (document.hidden) return;
    for (const [walker, state] of visible) {
      const rect = walker.parentElement.getBoundingClientRect();
      if (rect.bottom < -innerHeight || rect.top > innerHeight*2) continue;
      paint(walker, state, true, snapshot);
    }
  }, 130);
}
addEventListener('lazarus:storyframe', onStoryFrame);
addEventListener('pagehide', () => clearTimeout(settleTimer));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearTimeout(settleTimer);
});
addEventListener('resize', () => {
  for (const [walker, state] of visible) {
    state.height = walker.offsetHeight || 95;
  }
});
