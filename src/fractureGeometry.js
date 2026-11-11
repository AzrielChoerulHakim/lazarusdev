import * as THREE from 'three';

/**
 * Make a real, lit cross-section from the scanned sculpture mesh.
 * We intersect its actual triangles with the cut plane, sample the exterior
 * silhouette, then build a shallow, stratified limestone cap on that contour.
 * This is intentionally a physical mesh; it isn't a floating disk or image.
 *
 * Local coordinates are those of the normalized GLTF scene (before the
 * cinematic upper/lower groups are animated in world space).
 */

const bins = 144;
const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();


function intersects(a, b, y) {
  const d = b.y - a.y;
  if (Math.abs(d) < 1e-8) return null;
  const t = (y - a.y) / d;
  if (t < 0 || t > 1) return null;
  return [a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t];
}

function collectIntersection(model, y, anchor) {
  const points = [];
  anchor.updateMatrixWorld(true);
  model.updateMatrixWorld(true);
  const toAnchor = new THREE.Matrix4().copy(anchor.matrixWorld).invert();
  model.traverse(mesh => {
    if (!mesh.isMesh || !mesh.geometry?.attributes?.position) return;
    const position = mesh.geometry.attributes.position;
    const index = mesh.geometry.index;
    const triangles = index ? index.count / 3 : position.count / 3;
    const matrix = new THREE.Matrix4().multiplyMatrices(toAnchor, mesh.matrixWorld);

    for (let i = 0; i < triangles; i++) {
      const ai = index ? index.getX(i * 3) : i * 3;
      const bi = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const ci = index ? index.getX(i * 3 + 2) : i * 3 + 2;
      v0.fromBufferAttribute(position, ai).applyMatrix4(matrix);
      v1.fromBufferAttribute(position, bi).applyMatrix4(matrix);
      v2.fromBufferAttribute(position, ci).applyMatrix4(matrix);
      const edges = [[v0, v1], [v1, v2], [v2, v0]];
      let first = null;
      for (const [a, b] of edges) {
        const pt = intersects(a, b, y);
        if (pt === null) continue;
        if (first === null) first = pt;
        else {
          // Both endpoints are necessary for a faithful silhouette. Degenerate
          // triangles are ignored to avoid making kilometer-long spurs.
          if (Math.hypot(pt[0] - first[0], pt[1] - first[1]) > 0.00001) {
            points.push(first, pt);
          }
          break;
        }
      }
    }
  });
  return points;
}

function boundary(points) {
  if (points.length < 24) return null;
  // More robust than averaging every triangle intersection: head/neck mesh
  // density is uneven. The median of the bounds is stable across topology.
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (const [x, z] of points) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  const x0 = (minX + maxX) * .5;
  const z0 = (minZ + maxZ) * .5;
  const r = new Float32Array(bins);
  for (const p of points) {
    const angle = (Math.atan2(p[1] - z0, p[0] - x0) + Math.PI * 2) % (Math.PI * 2);
    const k = Math.floor(angle / (Math.PI * 2) * bins) % bins;
    const distance = Math.hypot(p[0] - x0, p[1] - z0);
    r[k] = Math.max(r[k], distance);
  }
  // Missing bins can exist at sharp discontinuities. Borrow the angular
  // interpolation of the two nearest sampled bins rather than making spikes.
  for (let i = 0; i < bins; i++) {
    if (r[i] > 0) continue;
    let left = (i + bins - 1) % bins, right = (i + 1) % bins;
    for (let n = 0; n < bins && !r[left]; n++) left = (left + bins - 1) % bins;
    for (let n = 0; n < bins && !r[right]; n++) right = (right + 1) % bins;
    const dL = (i - left + bins) % bins, dR = (right - i + bins) % bins;
    r[i] = (r[left] * dR + r[right] * dL) / Math.max(1, dL + dR);
  }
  const smoothed = new Float32Array(bins);
  for (let i = 0; i < bins; i++) {
    const prev = r[(i - 1 + bins) % bins];
    const next = r[(i + 1) % bins];
    smoothed[i] = .20 * prev + .60 * r[i] + .20 * next;
  }
  return { x0, z0, radii: smoothed };
}

function noise(x, z) {
  return .065 * Math.sin(x * 4.05 + Math.sin(z * 3.1) * .7)
    + .027 * Math.sin(x * 10.3 - z * 7.2)
    + .010 * Math.sin(x * 23.1 + z * 19.3);
}

/**
 * Direction +1 means the upper fragment's underside, -1 the lower
 * fragment's upper face. This matches the existing GPU fracture shader.
 */
export function makeScannedFractureCap(model, cutY, direction, anchor) {
  const cloud = collectIntersection(model, cutY, anchor);
  const outline = boundary(cloud);
  if (!outline) {
    console.warn('No valid scan contour at fracture plane', cutY);
    return null;
  }
  const { x0, z0, radii } = outline;
  // Preserve the impossible open-air fissure: only model the visible shell
  // of exposed marble, not a filled disc that seals the entire face.
  const layers = 5;
  const positions = [], colors = [], uvs = [], indices = [];
  const world = new THREE.Vector3();
  anchor.updateWorldMatrix(true, false);
  const R = 1 / Math.max(anchor.scale.y, 0.0001);
  const phi = direction > 0 ? 1.17 : 3.26;

  for (let layer = 0; layer <= layers; layer++) {
    const t = layer / layers;
    const radiusFraction = 1 - t * .19;
    for (let j = 0; j < bins; j++) {
      const a = j / bins * Math.PI * 2;
      const rugged = Math.sin(a * 17.3 + phi) * .020 + Math.sin(a * 39.7 - phi) * .007;
      const radius = radii[j] * radiusFraction * (1 + rugged * (1 - t));
      const x = x0 + radius * Math.cos(a);
      const z = z0 + radius * Math.sin(a);
      world.set(x, cutY, z).applyMatrix4(anchor.matrixWorld);
      const crack = noise(world.x, world.z) * R;
      const micro = Math.sin(x * 19.2 + z * 9.4) * .022
        + Math.sin(x * 37.7 - z * 27.3) * .009;
      const ridges = (.06 * Math.sin(t * 16.0 + a * 19.0)
        + .03 * Math.cos(t * 29.0 - a * 37.0)) * Math.sin(t * Math.PI);
      const depth = direction * (.008 + t * .075 + ridges * .55 + micro * (1 - t));
      positions.push(x, cutY + crack + depth, z);
      const grain = Math.sin(x * 17.1 + z * 12.5 + t * 7.3) * .06;
      // Exposed stone core is more ochre/porous than the polished exterior.
      const shade = Math.max(.30, Math.min(.77, .64 - t * .23 + grain));
      colors.push(shade, shade * .91, shade * .78);
      uvs.push(x * .4 + .5, z * .4 + .5);
      if (layer < layers) {
        const i = layer * bins + j;
        const n = layer * bins + (j + 1) % bins;
        const ii = (layer + 1) * bins + j;
        const nn = (layer + 1) * bins + (j + 1) % bins;
        if (direction > 0) indices.push(i, ii, n, n, ii, nn);
        else indices.push(i, n, ii, n, nn, ii);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: 0xc8b69e, vertexColors: true, side: THREE.DoubleSide,
    roughness: .99, metalness: 0, flatShading: true,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  });
  const cap = new THREE.Mesh(geometry, material);
  cap.name = direction > 0 ? 'Scanned rock fracture — upper underside' : 'Scanned rock fracture — lower crown';
  cap.castShadow = true;
  cap.receiveShadow = true;
  cap.frustumCulled = false;
  cap.userData.scanPoints = cloud.length;
  cap.userData.radialSegments = bins;
  return cap;
}
