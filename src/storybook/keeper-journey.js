// Ground positions in each painting, measured from its bottom-left corner.
const routes = {
  crossing: [[12, 4], [84, 4]],
  path: [[13, 6], [32, 18], [43, 29], [56, 37], [63, 48]],
  clearing: [[9, 4], [28, 6], [51, 4], [73, 8]],
  river: [[50, 5], [62, 9], [73, 14], [84, 19]],
  house: [[12, 4], [34, 13], [45, 20], [59, 30], [73, 40]]
};
const portraitPath = [[12, 5], [35, 14], [53, 26], [41, 36], [57, 46]];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const scenes = [...document.querySelectorAll('[data-walk]')];
const visible = new Set();
const strides = [0, 1, 2, 1];
let frame = 0;
let lastY = scrollY;
let direction = 1;

function render() {
  frame = 0;
  if (scrollY !== lastY) direction = Math.sign(scrollY - lastY);
  lastY = scrollY;
  for (const walker of visible) {
    const scene = walker.parentElement;
    const rect = scene.getBoundingClientRect();
    const route = walker.dataset.walk;
    const points = route === 'path' && rect.height > rect.width ? portraitPath : routes[route];
    const progress = Math.max(0, Math.min(1, (innerHeight * .86 - rect.top) / (innerHeight * .54 + rect.height * .56)));
    const step = (reduced.matches ? .5 : progress) * (points.length - 1);
    const index = Math.min(Math.floor(step), points.length - 2);
    const mix = step - index;
    const [x, y] = points[index].map((v, axis) => v + mix * (points[index + 1][axis] - v));
    walker.style.left = x + '%';
    walker.style.bottom = y + '%';
    const distance = progress * rect.width * (points.at(-1)[0] - points[0][0]) / 100;
    const pose = reduced.matches ? 0 : strides[Math.floor(distance / Math.max(8, walker.offsetHeight * .16)) % strides.length];
    walker.style.backgroundPositionX = pose * 50 + '%';
    const size = route === 'path' || route === 'house' ? 1 - step / (points.length - 1) * .4 : 1;
    const facing = reduced.matches ? 1 : direction * Math.sign(points[index + 1][0] - points[index][0]);
    walker.style.scale = (size * facing) + ' ' + size;
    if (route === 'house') scene.style.setProperty('--arrival-light', reduced.matches ? '.8' : String(progress * .9));
  }
}
function schedule() {
  if (!frame && visible.size) frame = requestAnimationFrame(render);
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const walker = entry.target.querySelector('[data-walk]');
      if (entry.isIntersecting) visible.add(walker);
      else visible.delete(walker);
    }
    schedule();
  }, { rootMargin: '12% 0px' });
  for (const walker of scenes) observer.observe(walker.parentElement);
  addEventListener('scroll', () => { if (!reduced.matches) schedule(); }, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
}
