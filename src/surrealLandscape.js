import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const ease = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);

// The frame AND its dimensional window use the same deformation. The opening
// stays registered to the stone when the camera travels through the threshold.
export function meltPoint(x, y) {
  const high = ease(-2.7, 1.5, y);
  return new THREE.Vector2(
    x + .29 * Math.sin((y + 2.7) * 1.18) + high * .13,
    y - .50 * Math.exp(-Math.pow((x - .53) / .61, 2)) * ease(-.1, .9, y)
      + .085 * Math.sin(x * 2.1) * high,
  );
}

export function makeMeltedAperture() {
  const r = 1.025;
  const points = [];
  for (let i = 0; i <= 36; i++) points.push(new THREE.Vector2(-r, -2.70 + 2.70 * i / 36));
  for (let i = 1; i <= 80; i++) {
    const a = Math.PI * (1 - i / 80);
    points.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  for (let i = 1; i <= 36; i++) points.push(new THREE.Vector2(r, -2.70 * i / 36));
  const shape = new THREE.Shape(points.map(p => meltPoint(p.x, p.y)));
  const geometry = new THREE.ShapeGeometry(shape, 80);
  // The optical feather follows the deformed perimeter, not an obsolete arch.
  geometry.computeBoundingBox();
  return geometry;
}

function solid(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function dropGeometry(length, radius) {
  // A narrow liquid neck opening into a heavy rounded pendant. Bottom-to-top
  // lathe profile gives continuous, properly lit volume rather than a cone.
  const profile = [];
  for (let i = 0; i <= 56; i++) {
    const u = i / 56;
    const bulb = .70 * Math.exp(-Math.pow((u - .105) / .085, 2));
    const neck = .19 + .94 * Math.pow(u, 4);
    profile.push(new THREE.Vector2(radius * (bulb + neck) * ease(0, .045, u), -length * (1 - u)));
  }
  profile.push(new THREE.Vector2(0, .075));
  return new THREE.LatheGeometry(profile, 24);
}

function liquidStoneMap() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const pixels = ctx.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const bend = Math.sin(y * .024) * 2.6 + Math.sin(y * .071) * .48;
    const vein = Math.pow(Math.max(0, Math.sin(x * .051 + y * .014 + bend)), 18);
    const grain = Math.sin(x * 71.3 + y * 19.7) * Math.cos(y * 37.2 - x * 6.1);
    const v = 235 - vein * 25 + grain * 3;
    const i = (y * 256 + x) * 4;
    pixels.data[i] = v;
    pixels.data[i + 1] = v * .975;
    pixels.data[i + 2] = v * .92;
    pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMeltingGateway(stone) {
  const group = new THREE.Group();
  group.name = 'The Soft Threshold — limestone forgetting its solidity';
  group.position.set(-3.05, .52, -7.5);
  group.scale.setScalar(1.42);
  group.rotation.y = .12;
  const mineralMap = liquidStoneMap();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xcdbb9a, map: mineralMap,
    roughness: .42, metalness: .08,
    clearcoat: .28, clearcoatRoughness: .30,
    envMapIntensity: .82,
  });
  // A single continuous silhouette, softened like wax. There are no straight
  // masonry joints under the liquid skin and no faceted floating game rocks.
  const outline = [];
  const side = (x, from, to) => {
    for (let i = 0; i <= 48; i++) outline.push(meltPoint(x, THREE.MathUtils.lerp(from, to, i / 48)));
  };
  side(-1.48, -2.69, 0);
  for (let i = 1; i <= 96; i++) {
    const a = Math.PI * (1 - i / 96);
    outline.push(meltPoint(Math.cos(a) * 1.48, Math.sin(a) * 1.48));
  }
  side(1.48, 0, -2.69);
  side(1.025, -2.69, 0);
  for (let i = 1; i <= 96; i++) {
    const a = Math.PI * i / 96;
    outline.push(meltPoint(Math.cos(a) * 1.025, Math.sin(a) * 1.025));
  }
  side(-1.025, 0, -2.69);
  const shape = new THREE.Shape(outline);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: .82, bevelEnabled: true, bevelSize: .085,
    bevelThickness: .095, bevelSegments: 5, steps: 2,
  });
  geometry.translate(0, 0, -.41);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * .36, uv.getY(i) * .36);
  group.add(solid(geometry, material));

  const pendants = [];
  for (const [x, length, radius] of [
    [-.88, .70, .16], [-.58, 1.08, .14],
    [-.17, .38, .10], [.34, .84, .17], [.80, 1.28, .14],
  ]) {
    const root = meltPoint(x, Math.sqrt(1.025 ** 2 - x ** 2) + .21);
    const drip = solid(dropGeometry(length, radius), material);
    // Bury the attachment inside the stone. An exposed top cap would read
    // as a separate hanging ornament instead of the frame itself liquefying.
    drip.position.set(root.x, root.y, .23);
    group.add(drip);
    pendants.push(drip);
  }
  // Long streams run down the outside into lobed puddles. Their silhouette
  // is asymmetrical: one side falls, the other pulls back upward.
  for (const [x, y, length, radius] of [[-1.35, -.25, 2.22, .18], [1.34, .12, 2.54, .22], [1.24, -1.1, 1.33, .12]]) {
    const p = meltPoint(x, y);
    const drip = solid(dropGeometry(length, radius), material);
    drip.position.set(p.x, p.y, .27);
    group.add(drip);
  }
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const pool = solid(sphere, material);
      pool.position.set(sign * 1.30 + Math.sin(i * 2.3) * .26, -2.64 - i * .027, .03 + i * .16);
      pool.scale.set(.65 - i * .08, .075 - i * .012, .77 - i * .075);
      group.add(pool);
    }
  }
  const drops = [];
  for (let i = 0; i < 9; i++) {
    const drop = solid(sphere, material);
    const sign = i % 2 ? 1 : -1;
    const radius = .035 + (i % 3) * .018;
    drop.position.set(sign * (1.68 + (i % 3) * .11), -2.5 + i * .29, .20 + Math.sin(i) * .19);
    drop.scale.set(radius, radius * 1.7, radius);
    group.add(drop);
    drops.push({ mesh: drop, y: drop.position.y, phase: i * .81 });
  }
  let time = 0;
  return {
    object: group,
    update(dt, active) {
      if (active) time += Math.min(dt, .06);
      pendants.forEach((m, i) => { m.scale.y = 1 + Math.sin(time * .38 + i * 1.7) * .045; });
      drops.forEach(({ mesh, y, phase }) => { mesh.position.y = y + Math.sin(time * .45 + phase) * .17; });
    },
    debug: () => ({ flowingPendants: pendants.length, suspendedDrops: drops.length }),
    dispose() {
      group.removeFromParent();
      const geometries = new Set();
      group.traverse(o => { if (o.geometry) geometries.add(o.geometry); });
      geometries.forEach(g => g.dispose());
      material.dispose();
      mineralMap.dispose();
    },
  };
}

function mobiusGeometry(radius = 1, width = .24) {
  const positions = [], uvs = [], indices = [];
  const segments = 128, across = 10;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments * Math.PI * 2;
    for (let j = 0; j <= across; j++) {
      const v = (j / across - .5) * width * 2;
      const r = radius + v * Math.cos(t / 2);
      positions.push(r * Math.cos(t), r * Math.sin(t), v * Math.sin(t / 2));
      uvs.push(i / segments, j / across);
      if (i < segments && j < across) {
        const a = i * (across + 1) + j, b = a + across + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

export function createDreamRelics(scene, stone, { interior = false } = {}) {
  const group = new THREE.Group();
  group.name = interior ? 'The country on the other side of gravity' : 'Stairway without a destination';
  const material = new THREE.MeshStandardMaterial({
    color: 0xdbcfb8, map: stone?.[0]?.map || null, roughness: .72, metalness: .025,
  });
  const red = new THREE.MeshStandardMaterial({
    color: 0xb33e2c, roughness: .36, metalness: .24, side: THREE.DoubleSide,
  });
  const geometry = new RoundedBoxGeometry(1.7, .17, .63, 3, .045);
  const steps = new THREE.InstancedMesh(geometry, material, 26);
  steps.name = 'Twenty-six unsupported steps curling into the sky';
  steps.castShadow = steps.receiveShadow = true;
  const dummy = new THREE.Object3D();
  for (let i = 0; i < steps.count; i++) {
    const t = i / (steps.count - 1);
    const angle = t * Math.PI * 1.38;
    dummy.position.set(-7.2 + Math.sin(angle) * 2.7, -2.6 + t * 10.5, -16.4 - t * 5.0);
    dummy.rotation.set(t * t * .6, angle * .43, Math.max(0, t - .57) * 2.5);
    dummy.scale.setScalar(1 - t * .22);
    dummy.updateMatrix();
    steps.setMatrixAt(i, dummy.matrix);
  }
  steps.instanceMatrix.needsUpdate = true;
  group.add(steps);
  const ribbon = solid(mobiusGeometry(1.55, .24), red);
  ribbon.name = 'Vermilion Möbius — one surface, no beginning';
  ribbon.position.set(-7.35, 4.3, -19.4);
  ribbon.rotation.set(.25, .46, -.5);
  group.add(ribbon);
  if (interior) {
    group.position.set(10, 1.1, -13);
    group.scale.setScalar(1.4);
    group.rotation.y = -.26;
  }
  scene.add(group);
  let time = 0;
  return {
    object: group,
    update(dt, active) {
      if (active) time += Math.min(dt, .06);
      ribbon.position.y = 4.3 + Math.sin(time * .23) * .18;
      ribbon.rotation.y = .46 + Math.sin(time * .13) * .22;
      steps.rotation.z = Math.sin(time * .17) * .008;
    },
    debug: () => ({ stairTreads: steps.count, mobiusBands: 1 }),
    dispose() {
      group.removeFromParent();
      geometry.dispose(); ribbon.geometry.dispose(); material.dispose(); red.dispose();
    },
  };
}
