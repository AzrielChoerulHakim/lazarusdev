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
const visible = new Map();
let frame = 0;
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

function paint(walker, state, still) {
  const rect = walker.parentElement.getBoundingClientRect();
  const kind = walker.dataset.walk;
  const seam = walker.closest('[data-seam-to]');
  const route = seam ? crossings[seam.dataset.seamTo] : (rect.height > rect.width ? portrait : routes)[kind];
  const progress = reduced.matches ? 1 : Math.max(0, Math.min(1,
    (innerHeight * .86 - rect.top) / (innerHeight * .54 + rect.height * .56)));
  // Leave the last portion of each painted scene for the destination gesture.
  const arrival = seam ? 1 : .79;
  const point = groundPoint(route, rect.width, rect.height, Math.min(1, progress / arrival));
  const size = kind === 'path' || kind === 'house' ? 1 - (point.elevation - route[0][1]) * .009 : 1;
  const now = performance.now();
  if (state.extreme === undefined) state.extreme = point.x;
  const retreat = (state.extreme - point.x) * state.facing;
  if (retreat > 8 && !reduced.matches) {
    state.facing *= -1;
    state.extreme = point.x;
    state.turnUntil = now + 90;
  }
  state.extreme = state.facing > 0 ? Math.max(state.extreme, point.x) : Math.min(state.extreme, point.x);
  let pose = 'stand';
  if (!seam && progress >= arrival) {
    pose = kind === 'river' && progress < .88 ? 'reach' : arrivalPose[kind];
  } else if (!still && !reduced.matches && state.distance !== undefined && progress > 0 && progress < 1) {
    pose = now < state.turnUntil ? 'turn' : strides[Math.floor(point.distance / (state.height * size * .18)) % strides.length];
  }
  if (kind === 'river') {
    const lift = Math.min(1, Math.max(0, (progress - arrival) / (.88 - arrival)));
    walker.style.setProperty('--page-lift', String(lift));
  }
  state.distance = point.distance;
  const facing = pose === 'turn' || reduced.matches ? 1 : state.facing;
  walker.style.transform = 'translate3d(' + point.x + 'px,' + -point.y + 'px,0) scale(' + size * facing + ',' + size + ')';
  walker.style.backgroundPositionX = poses.indexOf(pose) * 12.5 + '%';
  walker.dataset.pose = pose;
  if (kind === 'house') walker.parentElement.style.setProperty('--arrival-light', String(.12 + progress * .29));
}

function update(still = false) {
  for (const [walker, state] of visible) paint(walker, state, still);
}
function schedule() {
  if (frame || !visible.size) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    update();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => update(true), 120);
  });
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const walker = entry.target.querySelector('[data-walk]');
      if (entry.isIntersecting) visible.set(walker, { facing: 1, height: walker.offsetHeight || 95 });
      else visible.delete(walker);
    }
    schedule();
  }, { rootMargin: '12% 0px' });
  for (const walker of document.querySelectorAll('[data-walk]')) observer.observe(walker.parentElement);
  addEventListener('scroll', () => { if (!reduced.matches) schedule(); }, { passive: true });
  addEventListener('resize', () => {
    for (const [walker, state] of visible) {
      state.height = walker.offsetHeight || 95;
      state.extreme = undefined;
    }
    schedule();
  });
  reduced.addEventListener('change', schedule);
}
