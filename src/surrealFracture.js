import * as THREE from 'three';

// The sculpture remains ONE photographic GLB scan. Its triangles are partitioned
// into mutually exclusive height bands, rather than drawing three full faces on
// top of one another. Original UVs, normals, and photographed marble survive.
const CUTS = [0.68, 1.88];
const REGIONS = [
  { name: 'Grounded marble shoulders and chin', low: -Infinity, high: CUTS[0] },
  { name: 'Levitating facial fragment', low: CUTS[0], high: CUTS[1] },
  { name: 'Suspended marble crown', low: CUTS[1], high: Infinity },
];
const v = () => new THREE.Vector3();
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

function sourceData(model, anchor) {
  anchor.updateMatrixWorld(true);
  const inverse = anchor.matrixWorld.clone().invert();
  const meshes = [];
  model.traverse(mesh => {
    if (!mesh.isMesh || !mesh.geometry?.attributes.position) return;
    mesh.updateWorldMatrix(true, false);
    const matrix = inverse.clone().multiply(mesh.matrixWorld);
    const positions = mesh.geometry.attributes.position;
    const transformed = new Float32Array(positions.count * 3);
    const point = v();
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(matrix);
      transformed[i * 3] = point.x;
      transformed[i * 3 + 1] = point.y;
      transformed[i * 3 + 2] = point.z;
    }
    const index = mesh.geometry.getIndex();
    const indices = index ? index.array : null;
    const triangles = index ? index.count : positions.count;
    meshes.push({ mesh, geometry: mesh.geometry, transformed, indices, triangles });
  });
  return meshes;
}

function trimmedGeometry(data, low, high) {
  const original = data.geometry;
  const out = new THREE.BufferGeometry();
  for (const [name, attr] of Object.entries(original.attributes)) out.setAttribute(name, attr);
  if (original.morphAttributes) out.morphAttributes = original.morphAttributes;
  const sourceGroups = original.groups.length
    ? original.groups
    : [{ start: 0, count: data.triangles, materialIndex: 0 }];
  const selected = [];
  for (const group of sourceGroups) {
    const start = selected.length;
    const limit = Math.min(data.triangles, group.start + group.count);
    for (let j = group.start; j + 2 < limit; j += 3) {
      const a = data.indices ? data.indices[j] : j;
      const b = data.indices ? data.indices[j + 1] : j + 1;
      const c = data.indices ? data.indices[j + 2] : j + 2;
      const y0 = data.transformed[a * 3 + 1];
      const y1 = data.transformed[b * 3 + 1];
      const y2 = data.transformed[c * 3 + 1];
      // Keep all triangles crossing this slab; exact final boundaries are
      // produced by shader clipping. Most off-band triangles never reach GPU.
      if (Math.max(y0, y1, y2) < low || Math.min(y0, y1, y2) > high) continue;
      selected.push(a, b, c);
    }
    if (selected.length > start) out.addGroup(start, selected.length - start, group.materialIndex);
  }
  out.setIndex(selected);
  return out;
}

function intersectionsOnCut(data, y) {
  const out = [];
  for (const info of data) {
    const p = info.transformed;
    for (let j = 0; j + 2 < info.triangles; j += 3) {
      const ids = [
        info.indices ? info.indices[j] : j,
        info.indices ? info.indices[j + 1] : j + 1,
        info.indices ? info.indices[j + 2] : j + 2,
      ];
      const yy = ids.map(id => p[id * 3 + 1]);
      if (Math.min(...yy) > y || Math.max(...yy) < y) continue;
      for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) {
        const delta = yy[b] - yy[a];
        if (Math.abs(delta) < 1e-7) continue;
        const t = (y - yy[a]) / delta;
        if (t <= 0 || t >= 1) continue;
        const ai = ids[a] * 3, bi = ids[b] * 3;
        out.push({
          x: p[ai] + (p[bi] - p[ai]) * t,
          z: p[ai + 2] + (p[bi + 2] - p[ai + 2]) * t,
        });
      }
    }
  }
  return out;
}
function cross(a, b, c) {
  return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
}
function convexHull(points) {
  if (points.length < 3) return [];
  points.sort((a, b) => a.x - b.x || a.z - b.z);
  const lower = [], upper = [];
  for (const p of points) {
    while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}
function sectionOutline(data, height) {
  const hull = convexHull(intersectionsOnCut(data, height));
  if (hull.length < 3) return null;
  // A slight inset hides the dark cross section inside the actual chipped
  // photographed rim, rather than showing a black disc outside the face.
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cz = hull.reduce((s, p) => s + p.z, 0) / hull.length;
  return hull.map(p => ({ x: cx + (p.x - cx) * .958, z: cz + (p.z - cz) * .958 }));
}

function makeCap(outline, height, material, rimMaterial, resources) {
  if (!outline) return null;
  const shape = new THREE.Shape();
  outline.forEach((p, i) => i ? shape.lineTo(p.x, p.z) : shape.moveTo(p.x, p.z));
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  const surface = new THREE.Mesh(geometry, material);
  surface.rotation.x = Math.PI / 2;
  surface.position.y = height;
  surface.receiveShadow = true;
  surface.renderOrder = 1;
  resources.push(geometry);
  const cap = new THREE.Group();
  cap.add(surface);
  const lineGeo = new THREE.BufferGeometry().setFromPoints(
    outline.map(p => new THREE.Vector3(p.x, height + .002, p.z)),
  );
  const rim = new THREE.LineLoop(lineGeo, rimMaterial);
  rim.renderOrder = 2;
  cap.add(rim);
  resources.push(lineGeo);
  return cap;
}
function addStonePowder(anchor, outlines, resources) {
  // Very small, individually lit chips close to the two fracture planes;
  // never a confetti cloud covering the photographed face.
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshStandardMaterial({ color: 0xb5a795, roughness: 1, metalness: 0 });
  const chips = new THREE.InstancedMesh(geometry, material, 54);
  let seed = 4981;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const dummy = new THREE.Object3D();
  for (let i = 0; i < chips.count; i++) {
    const level = i % 2;
    const outline = outlines[level] || [{ x: 0, z: 0 }];
    const point = outline[Math.floor(random() * outline.length)];
    const spread = .78 + random() * .36;
    const y = CUTS[level];
    dummy.position.set(point.x * spread, y + .09 + random() * .30, point.z * spread);
    dummy.rotation.set(random() * 5, random() * 5, random() * 5);
    const s = .009 + Math.pow(random(), 2) * .028;
    dummy.scale.set(s * (.6 + random()), s * (.6 + random()), s * (.5 + random()));
    dummy.updateMatrix();
    chips.setMatrixAt(i, dummy.matrix);
    chips.setColorAt(i, new THREE.Color().setHSL(.092, .06, .58 + random() * .14));
  }
  chips.instanceMatrix.needsUpdate = true;
  if (chips.instanceColor) chips.instanceColor.needsUpdate = true;
  chips.castShadow = false;
  chips.receiveShadow = true;
  chips.name = 'Tiny limestone chips suspended in the impossible gaps';
  anchor.add(chips);
  resources.push(geometry, material);
}

// The fracture is defined against the model's actual local surface, not a
// procedural mannequin. Each partition owns an exclusive clipping interval.
export function createImpossibleFracture(model, anchor) {
  const data = sourceData(model, anchor);
  if (!data.length) return null;
  const outlines = CUTS.map(y => sectionOutline(data, y));
  const resources = [];
  const sections = [];
  const darkStone = new THREE.MeshStandardMaterial({
    color: 0x51473e, roughness: 1, metalness: 0, side: THREE.DoubleSide,
  });
  const rimStone = new THREE.LineBasicMaterial({
    color: 0xc5b5a1, opacity: .36, transparent: true, depthWrite: false,
  });
  resources.push(darkStone, rimStone);

  for (let regionIndex = 0; regionIndex < REGIONS.length; regionIndex++) {
    const region = REGIONS[regionIndex];
    const piece = new THREE.Group();
    piece.name = region.name;
    const below = Number.isFinite(region.low) ? new THREE.Plane() : null;
    const above = Number.isFinite(region.high) ? new THREE.Plane() : null;
    const planes = [below, above].filter(Boolean);
    const copy = model.clone(true);
    const cloneMeshes = [];
    copy.traverse(obj => { if (obj.isMesh) cloneMeshes.push(obj); });
    for (let j = 0; j < cloneMeshes.length; j++) {
      const mesh = cloneMeshes[j];
      const original = data[j];
      if (!original) { mesh.visible = false; continue; }
      mesh.geometry = trimmedGeometry(original, region.low, region.high);
      resources.push(mesh.geometry);
      if (mesh.geometry.index.count === 0) mesh.visible = false;
      const originals = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const clipped = originals.map(source => {
        const material = source.clone();
        material.clippingPlanes = planes;
        material.clipShadows = true;
        material.needsUpdate = true;
        resources.push(material);
        return material;
      });
      mesh.material = Array.isArray(mesh.material) ? clipped : clipped[0];
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
    }
    piece.add(copy);
    if (regionIndex < CUTS.length) {
      const cap = makeCap(outlines[regionIndex], CUTS[regionIndex] - .006, darkStone, rimStone, resources);
      if (cap) piece.add(cap);
    }
    if (regionIndex > 0) {
      const cap = makeCap(outlines[regionIndex - 1], CUTS[regionIndex - 1] + .006, darkStone, rimStone, resources);
      if (cap) piece.add(cap);
    }
    anchor.add(piece);
    sections.push({ piece, below, above, region });
  }
  // Dispose the uncut object from the live scene, not its shared texture maps.
  // Its texture-bearing geometry is still referenced by the trimmed slabs.
  anchor.remove(model);
  addStonePowder(anchor, outlines, resources);

  let time = 0;
  function updatePlanes(section) {
    const { piece, below, above, region } = section;
    piece.updateWorldMatrix(true, false);
    const up = new THREE.Vector3(0, 1, 0).transformDirection(piece.matrixWorld);
    const point = new THREE.Vector3();
    if (below) {
      point.set(0, region.low, 0).applyMatrix4(piece.matrixWorld);
      below.setFromNormalAndCoplanarPoint(up, point);
    }
    if (above) {
      point.set(0, region.high, 0).applyMatrix4(piece.matrixWorld);
      above.setFromNormalAndCoplanarPoint(up.clone().negate(), point);
    }
  }
  const update = (dt = 0, progress = 0, motion = true) => {
    if (motion) time += Math.min(.06, Math.max(0, dt));
    const separation = .90 + .10 * clamp(progress / .20, 0, 1);
    const middle = sections[1].piece;
    const crown = sections[2].piece;
    middle.position.set(.052, .20 * separation + Math.sin(time * .43) * .022, .085);
    middle.rotation.set(.004, -.019 + Math.sin(time * .21) * .007, .011);
    crown.position.set(-.085, .52 * separation + Math.sin(time * .32 + 1.1) * .043, -.035);
    crown.rotation.set(-.008, .036 + Math.sin(time * .18) * .009, -.020);
    sections.forEach(updatePlanes);
  };
  update(0, 0, false);
  return {
    update,
    fragmentCount: sections.length,
    dispose() {
      for (const section of sections) anchor.remove(section.piece);
      // Instanced chips are retained only for the lifetime of this monument.
      for (const chip of [...anchor.children].filter(obj => obj.isInstancedMesh && obj.name.includes('limestone chips'))) anchor.remove(chip);
      for (const resource of resources) resource.dispose?.();
    },
  };
}
