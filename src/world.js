import * as THREE from 'three';

const THREE_BG = 0x081a1d;
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, t) => { const p = clamp((t - a) / (b - a)); return p * p * (3 - 2 * p); };
const rand = (() => { let seed = 37021; return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }; })();

function marbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const im = ctx.createImageData(256, 256);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const wave = Math.sin(x * .081 + Math.sin(y * .036) * 6 + Math.sin((x + y) * .015) * 4);
      const veins = Math.pow(Math.max(0, Math.sin(x * .066 + y * .039 + Math.sin(y * .05) * 5)), 21);
      const dust = (rand() - .5) * 28;
      const value = clamp((173 + 27 * wave - 42 * veins + dust) / 255) * 255;
      const i = (y * 256 + x) * 4;
      im.data[i] = value;
      im.data[i + 1] = value * .96;
      im.data[i + 2] = value * .83;
      im.data[i + 3] = 255;
    }
  }
  ctx.putImageData(im, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 2;
  return tex;
}

function makeStoneMaterials(texture) {
  return [
    new THREE.MeshStandardMaterial({ map: texture, color: 0xd8c9ad, roughness: 1, metalness: 0, flatShading: false }),
    new THREE.MeshStandardMaterial({ map: texture, color: 0xb2a38c, roughness: 1, metalness: 0 }),
    new THREE.MeshStandardMaterial({ map: texture, color: 0x7d796d, roughness: 1, metalness: 0 }),
  ];
}
function stoneMesh(geometry, material, shadow = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  return mesh;
}
function ellipse(group, material, scale, position, segments = 32) {
  const mesh = stoneMesh(new THREE.SphereGeometry(1, segments, Math.floor(segments * .75)), material);
  mesh.scale.set(...scale);
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

function makeBust(stone) {
  const bust = new THREE.Group();
  bust.name = 'Fragmented marble oracle';
  const upperTheta = 1.67, lowerTheta = 1.92;
  const main = stoneMesh(new THREE.SphereGeometry(1, 76, 48, 0, Math.PI * 2, 0, upperTheta), stone[0]);
  main.scale.set(1.07, 1.52, .84);
  bust.add(main);
  const jaw = stoneMesh(new THREE.SphereGeometry(1, 76, 32, 0, Math.PI * 2, lowerTheta, Math.PI - lowerTheta), stone[1]);
  jaw.scale.set(1.07, 1.52, .84);
  jaw.position.set(.13, -.06, .05);
  jaw.rotation.z = -.075;
  bust.add(jaw);
  const capTop = stoneMesh(new THREE.CylinderGeometry(Math.sin(upperTheta), Math.sin(upperTheta), .11, 56), stone[1]);
  capTop.scale.set(1.07, 1, .84);
  capTop.position.y = Math.cos(upperTheta) * 1.52 - .055;
  bust.add(capTop);
  const capJaw = stoneMesh(new THREE.CylinderGeometry(Math.sin(lowerTheta), Math.sin(lowerTheta), .1, 56), stone[2]);
  capJaw.scale.set(1.07, 1, .84);
  capJaw.position.set(.13, Math.cos(lowerTheta) * 1.52 - .01, .05);
  capJaw.rotation.z = -.075;
  bust.add(capJaw);

  const eyeShade = new THREE.MeshStandardMaterial({ color: 0x252a26, roughness: 1 });
  for (const side of [-1, 1]) {
    const x = side * .47;
    ellipse(bust, stone[1], [.43, .12, .13], [x, .50, .72]);
    ellipse(bust, eyeShade, [.29, .051, .042], [x, .35, .837]);
    ellipse(bust, stone[0], [.31, .085, .095], [x, .30, .83]);
    ellipse(bust, stone[0], [.26, .26, .13], [side * .61, -.03, .66]);
  }
  ellipse(bust, stone[0], [.145, .53, .22], [.01, .13, .835]);
  ellipse(bust, stone[1], [.24, .14, .23], [.025, -.27, .885]);
  ellipse(bust, stone[2], [.09, .049, .08], [-.145, -.335, 1.01]);
  ellipse(bust, stone[2], [.09, .049, .08], [.195, -.335, 1.01]);
  ellipse(bust, stone[1], [.39, .073, .14], [.16, -.71, .755]);
  ellipse(bust, eyeShade, [.34, .024, .05], [.16, -.775, .85]);
  ellipse(bust, stone[0], [.34, .066, .12], [.16, -.84, .77]);
  ellipse(bust, stone[1], [.32, .14, .14], [.16, -1.03, .64]);
  for (let i = 0; i < 18; i++) {
    const a = (i / 17) * Math.PI * 1.04;
    const x = Math.cos(a) * .97;
    const y = 1.12 + .27 * Math.sin(a);
    const z = Math.sin(a) * .2 + (i % 3) * .025;
    const curl = stoneMesh(new THREE.IcosahedronGeometry(.18 + rand() * .12, 1), stone[i % 3]);
    curl.position.set(x, y, z);
    curl.rotation.set(rand(), rand(), rand());
    curl.scale.set(1, 1.3, 1.2);
    bust.add(curl);
  }
  const neck = stoneMesh(new THREE.CylinderGeometry(.57, .70, 1.18, 11), stone[1]);
  neck.position.set(.18, -1.86, -.15);
  neck.rotation.z = -.11;
  bust.add(neck);
  const collar = stoneMesh(new THREE.CylinderGeometry(.95, 1.13, .32, 12), stone[2]);
  collar.position.set(.1, -2.5, -.15);
  bust.add(collar);
  bust.rotation.y = -.20;
  bust.rotation.z = -.07;
  bust.position.set(2.38, .72, -1.5);
  bust.scale.setScalar(1.42);
  return bust;
}

function archWedge(theta0, theta1, rOuter, rInner, depth, mat) {
  const shape = new THREE.Shape();
  const steps = 7;
  for (let j = 0; j <= steps; j++) {
    const a = mix(theta0, theta1, j / steps);
    const x = Math.cos(a) * rOuter, y = Math.sin(a) * rOuter;
    if (j === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  for (let j = steps; j >= 0; j--) {
    const a = mix(theta0, theta1, j / steps);
    shape.lineTo(Math.cos(a) * rInner, Math.sin(a) * rInner);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: .035, bevelSize: .022, bevelSegments: 1, steps: 1, curveSegments: 3 });
  geo.translate(0, 0, -depth / 2);
  return stoneMesh(geo, mat);
}
function portal(stone, x, y, z, size = 1, glow = false) {
  const group = new THREE.Group();
  const inner = 1.03, outer = 1.48;
  for (const side of [-1, 1]) {
    const pillar = stoneMesh(new THREE.BoxGeometry(.47, 2.7, .76), stone[side === 1 ? 1 : 0]);
    pillar.position.set(side * 1.255, -1.35, 0);
    group.add(pillar);
    const base = stoneMesh(new THREE.BoxGeometry(.71, .22, .90), stone[1]);
    base.position.set(side * 1.255, -2.63, 0);
    group.add(base);
    const capital = stoneMesh(new THREE.BoxGeometry(.62, .24, .88), stone[0]);
    capital.position.set(side * 1.255, .07, 0);
    group.add(capital);
    for (let j = 0; j < 3; j++) {
      const striation = stoneMesh(new THREE.BoxGeometry(.026, 2.1, .025), stone[2], false);
      striation.position.set(side * 1.255 + (j - 1) * .105, -1.35, .388);
      group.add(striation);
    }
  }
  const count = 13;
  for (let i = 0; i < count; i++) {
    const a0 = i * Math.PI / count + .006, a1 = (i + 1) * Math.PI / count - .006;
    group.add(archWedge(a0, a1, outer, inner, .75, stone[i % 3]));
  }
  const crown = stoneMesh(new THREE.BoxGeometry(.36, .25, .9), stone[0]);
  crown.position.y = outer + .06;
  group.add(crown);
  if (glow) {
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x7caaa1, transparent: true, opacity: .18, depthWrite: false, side: THREE.DoubleSide });
    const shape = new THREE.Shape();
    shape.moveTo(-inner, -2.5);
    shape.lineTo(-inner, 0);
    for (let i = 0; i <= 20; i++) { const a = Math.PI - i * Math.PI / 20; shape.lineTo(Math.cos(a) * inner, Math.sin(a) * inner); }
    shape.lineTo(inner, -2.5);
    shape.closePath();
    const membrane = new THREE.Mesh(new THREE.ShapeGeometry(shape), haloMat);
    membrane.position.z = -.46;
    membrane.name = 'Portal light volume';
    group.add(membrane);
  }
  group.position.set(x, y, z);
  group.scale.setScalar(size);
  return group;
}
function ribbon(xStart, xEnd, y, z, width, color) {
  const steps = 100;
  const positions = new Float32Array((steps + 1) * 2 * 3);
  const uvs = new Float32Array((steps + 1) * 2 * 2);
  const indices = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    uvs.set([t, 0, t, 1], i * 4);
    if (i < steps) { const b = i * 2; indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  const material = new THREE.MeshStandardMaterial({ color, roughness: .78, metalness: .04, side: THREE.DoubleSide, emissive: 0x3e0d08, emissiveIntensity: .10 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.castShadow = true;
  return { mesh, update(time) {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = mix(xStart, xEnd, t);
      const wave = Math.sin(t * Math.PI * 2.6 + time * .31) * (.32 + .26 * Math.sin(t * Math.PI));
      const yy = y + Math.sin(t * Math.PI * 1.75 + .28) * .63 + wave;
      const zz = z + .35 * Math.sin(t * 9 + time * .26) - .25 * Math.cos(t * 4);
      const w = width * (.37 + .63 * Math.sin(Math.PI * Math.pow(t, .72)));
      for (let row = 0; row < 2; row++) {
        const p = (i * 2 + row) * 3;
        positions[p] = x;
        positions[p + 1] = yy + (row ? w / 2 : -w / 2) * Math.cos(t * 13 + time * .28);
        positions[p + 2] = zz + (row ? w / 2 : -w / 2) * Math.sin(t * 13 + time * .28);
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  } };
}
function floatingIsland(stone, x, y, z, scale) {
  const g = new THREE.Group();
  const slab = stoneMesh(new THREE.CylinderGeometry(1.4, .86, .34, 9), stone[1]);
  slab.position.y = -.35;
  g.add(slab);
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2, r = rand() * .95;
    const rock = stoneMesh(new THREE.DodecahedronGeometry(.25 + rand() * .27, 0), stone[i % 3]);
    rock.position.set(Math.cos(a) * r, -.60 - rand() * .4, Math.sin(a) * r);
    g.add(rock);
  }
  const door = portal(stone, 0, .20, 0, .47);
  g.add(door);
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  return g;
}
function addAtmosphere(scene, stone) {
  const moonMat = new THREE.MeshStandardMaterial({ color: 0x9f9784, roughness: 1, metalness: 0, map: stone[1].map });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(2.25, 48, 36), moonMat);
  moon.position.set(-4.1, 2.2, -18.5);
  scene.add(moon);
  const dustG = new THREE.BufferGeometry();
  const pts = new Float32Array(350 * 3);
  for (let i = 0; i < 350; i++) pts.set([(rand() - .5) * 44, (rand() - .4) * 20, -rand() * 35 - 1], i * 3);
  dustG.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ color: 0xc6b89b, size: .023, transparent: true, opacity: .64, sizeAttenuation: true, depthWrite: false }));
  scene.add(dust);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 260, 1, 1), new THREE.MeshStandardMaterial({ color: 0x1a3940, roughness: .24, metalness: .43, transparent: true, opacity: .86 }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -3.25;
  sea.receiveShadow = true;
  scene.add(sea);
  for (let i = 0; i < 22; i++) {
    const rock = stoneMesh(new THREE.DodecahedronGeometry(.28 + rand() * .83, 0), stone[i % 3]);
    rock.position.set((rand() - .5) * 27, -3.1 + rand() * .3, -2 - rand() * 29);
    rock.scale.set(1, .33 + rand() * .5, 1);
    rock.rotation.y = rand() * Math.PI;
    scene.add(rock);
  }
  return { moon, dust };
}

const CAMERA_KEYS = [
  { t: 0, p: [0, .15, 9.3], look: [.35, .05, -3.3] },
  { t: .17, p: [-.35, .24, 7.5], look: [-.75, .10, -5.5] },
  { t: .32, p: [-1.2, .15, 3.8], look: [-1.8, -.15, -7] },
  { t: .50, p: [-2.12, .07, -1.8], look: [-2.15, -.10, -13] },
  { t: .65, p: [-2.28, .08, -8.0], look: [-.55, .05, -17] },
  { t: .78, p: [-1.9, 1.15, -10.8], look: [.3, .25, -21] },
  { t: 1, p: [1.1, 1.4, -12.7], look: [.5, 0, -23] },
];
function keyframe(t) {
  let i = 0;
  while (i < CAMERA_KEYS.length - 2 && CAMERA_KEYS[i + 1].t < t) i++;
  const a = CAMERA_KEYS[i], b = CAMERA_KEYS[i + 1];
  const n = smooth(a.t, b.t, t);
  return {
    p: new THREE.Vector3(...a.p.map((v, j) => mix(v, b.p[j], n))),
    look: new THREE.Vector3(...a.look.map((v, j) => mix(v, b.look[j], n))),
  };
}

export function createWorld(canvas) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
  } catch (error) { console.warn('WebGL unavailable; retaining atmospheric fallback.', error); return null; }
  renderer.setClearColor(THREE_BG);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.36;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(THREE_BG);
  scene.fog = new THREE.FogExp2(0x0a1b1f, .022);
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 130);
  const hemisphere = new THREE.HemisphereLight(0xb7d5c8, 0x33261e, 2.0);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight(0xffe0b3, 3.1);
  key.position.set(5.2, 8.2, 7.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: .5, far: 43 });
  key.shadow.bias = -.001;
  scene.add(key);
  const rim = new THREE.PointLight(0xde654a, 45, 18, 1.6);
  rim.position.set(2.5, 2.3, -2.3);
  scene.add(rim);
  const gateLight = new THREE.PointLight(0x8caead, 45, 12, 1.5);
  gateLight.position.set(-2.05, 0, -7.4);
  scene.add(gateLight);

  const stone = makeStoneMaterials(marbleTexture());
  const statue = makeBust(stone);
  scene.add(statue);
  const threshold = portal(stone, -2.15, -.28, -7.5, 1.30, true);
  threshold.rotation.y = .12;
  scene.add(threshold);
  const sideRuins = [portal(stone, -7.2, -.7, -12, 1.05), portal(stone, 5.3, -.3, -17, .88), portal(stone, -5.8, -.85, -23, .9)];
  sideRuins.forEach((g, i) => { g.rotation.y = (i - 1) * .23; scene.add(g); });
  const islandA = floatingIsland(stone, 2.7, -.4, -16, 1.5);
  const islandB = floatingIsland(stone, -2.5, .25, -23.5, 1.25);
  const islandC = floatingIsland(stone, 6.9, 1.9, -28, 1.72);
  scene.add(islandA, islandB, islandC);
  const { moon, dust } = addAtmosphere(scene, stone);
  const ribbonA = ribbon(-3.0, 5.5, .52, 1.18, .71, 0xb44231);
  const ribbonB = ribbon(-4.0, 5.4, -1.80, .95, .77, 0x9e382c);
  scene.add(ribbonA.mesh, ribbonB.mesh);

  let progress = 0, pointer = { x: 0, y: 0 }, motion = !reducedMotion;
  let pausedByTab = document.hidden, elapsed = 0, last = performance.now(), raf = 0;
  const lookSmooth = new THREE.Vector3(0, 0, -5);
  const viewport = () => {
    const w = Math.max(1, window.innerWidth), h = Math.max(1, window.innerHeight);
    const compact = w < 700;
    const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.65);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = compact ? 58 : 43;
    camera.updateProjectionMatrix();
  };
  viewport();
  const onResize = () => viewport();
  window.addEventListener('resize', onResize, { passive: true });
  const onVisibility = () => { pausedByTab = document.hidden; last = performance.now(); };
  document.addEventListener('visibilitychange', onVisibility);
  const onContextLost = e => { e.preventDefault(); pausedByTab = true; };
  canvas.addEventListener('webglcontextlost', onContextLost);
  const onContextRestored = () => { pausedByTab = false; last = performance.now(); };
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  const render = now => {
    raf = requestAnimationFrame(render);
    if (pausedByTab) return;
    const dt = Math.min((now - last) / 1000, .05); last = now;
    if (motion) elapsed += dt;
    const current = keyframe(progress);
    const mobile = window.innerWidth < 700;
    if (mobile) { current.p.x += .35; current.p.z += 1.25; current.look.x += .20; }
    if (motion) { current.p.x += pointer.x * .13; current.p.y += pointer.y * .10; }
    camera.position.lerp(current.p, 1 - Math.pow(.0006, dt));
    lookSmooth.lerp(current.look, 1 - Math.pow(.0004, dt));
    camera.lookAt(lookSmooth);
    statue.rotation.y = -.20 + (motion ? .014 * Math.sin(elapsed * .26) : 0);
    moon.rotation.y = elapsed * .009;
    dust.rotation.y = elapsed * .003;
    islandA.position.y = -.4 + (motion ? Math.sin(elapsed * .35) * .09 : 0);
    islandB.position.y = .25 + (motion ? Math.cos(elapsed * .30) * .10 : 0);
    if (motion || elapsed === 0) { ribbonA.update(elapsed); ribbonB.update(elapsed + 1.9); }
    renderer.render(scene, camera);
  };
  render(performance.now());
  return {
    setProgress(value) { progress = clamp(value); },
    setPointer(x, y) { pointer = { x, y }; },
    setMotion(value) { motion = !reducedMotion && value; },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      scene.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); });
      stone.forEach(m => m.dispose());
      renderer.dispose();
    },
  };
}
