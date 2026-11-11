import * as THREE from 'three';
import { loadScannedOracle } from './sculpture.js';
import { enhanceEnvironment } from './environment.js';
import { attachPortalVeil } from './portalFx.js';
import { loadSandstoneMaterials } from './stoneMaterials.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { installLunarSurface } from './lunarSurface.js';
import { enrichPortal } from './architecturalDetails.js';
import { createSilkRibbon } from './cloth.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { installPhotographicSky } from './photographicSky.js';
import { createAtmosphericMotes } from './atmosphericParticles.js';

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

function makeStoneNormal(texture) {
  const canvas = texture.image;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const pixels = ctx.getImageData(0,0,w,h).data;
  const output = new Uint8Array(w*h*4);
  const sample = (x,y) => pixels[(((y+h)%h)*w+((x+w)%w))*4]/255;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const dx = sample(x+1,y)-sample(x-1,y);
    const dy = sample(x,y+1)-sample(x,y-1);
    const norm = new THREE.Vector3(-dx*.9, -dy*.9, 1).normalize();
    const i=(y*w+x)*4;
    output[i]=(norm.x*.5+.5)*255;
    output[i+1]=(norm.y*.5+.5)*255;
    output[i+2]=(norm.z*.5+.5)*255;
    output[i+3]=255;
  }
  const map=new THREE.DataTexture(output,w,h,THREE.RGBAFormat);
  map.wrapS=map.wrapT=THREE.RepeatWrapping;
  map.needsUpdate=true;
  return map;
}
function makeStoneMaterials(texture) {
  const normal = makeStoneNormal(texture);
  const configs = [
    {color:0xd8c9ad, roughness:.99},
    {color:0xb2a38c, roughness:1},
    {color:0x7d796d, roughness:1},
  ];
  return configs.map(config => new THREE.MeshStandardMaterial({
    map:texture, normalMap:normal, normalScale:new THREE.Vector2(.47,.47),
    color:config.color, roughness:config.roughness, metalness:0
  }));
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

function weatheredBlock(w, h, d, salt = 0) {
  // Subtle sculpted curvature and chipped corners catch grazing sunlight.
  // Plain perfect cubes are the strongest visual cue that the world is synthetic.
  const geo = new RoundedBoxGeometry(w, h, d, 4, Math.min(.055, w * .09, h * .09, d * .09));
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const rough = Math.sin(x * 38.3 + y * 9.7 + z * 4.7 + salt) * .45
      + Math.sin(y * 30.2 + z * 14.8 - salt * 1.7) * .35
      + Math.sin(x * 71.2 - z * 22.1 + salt * .7) * .20;
    const deform = rough * Math.min(.018, w * .025);
    p.setXYZ(i, x + n.getX(i) * deform, y + n.getY(i) * deform, z + n.getZ(i) * deform);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
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
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const erosion = Math.sin(x*39 + y*31 + z*10) * .008
      + Math.cos(y*47 - x*24) * .005;
    p.setXYZ(i, x + n.getX(i)*erosion, y+n.getY(i)*erosion, z+n.getZ(i)*erosion);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return stoneMesh(geo, mat);
}
function portal(stone, x, y, z, size = 1, glow = false) {
  const group = new THREE.Group();
  const inner = 1.03, outer = 1.48;
  for (const side of [-1, 1]) {
    const pillar = stoneMesh(weatheredBlock(.47, 2.7, .76, 2 + side), stone[side === 1 ? 1 : 0]);
    pillar.position.set(side * 1.255, -1.35, 0);
    group.add(pillar);
    const base = stoneMesh(weatheredBlock(.71, .22, .90, 5 + side), stone[1]);
    base.position.set(side * 1.255, -2.63, 0);
    group.add(base);
    const capital = stoneMesh(weatheredBlock(.62, .24, .88, 6 + side), stone[0]);
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
  // Recessed arch grooves, voussoir rhythm and side chamfers create
  // specular breaks and real shadow edges rather than a cardboard silhouette.
  const ridge = stoneMesh(new THREE.TorusGeometry(1.255, .026, 6, 96, Math.PI), stone[2], false);
  ridge.position.set(0, 0, .422);
  group.add(ridge);
  const innerRidge = stoneMesh(new THREE.TorusGeometry(1.06, .017, 5, 96, Math.PI), stone[1], false);
  innerRidge.position.set(0, 0, .424);
  group.add(innerRidge);
  const crown = stoneMesh(weatheredBlock(.36, .25, .9, 12), stone[0]);
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
  // These are small, fixed-count meshes; retain them while entering the portal.
  // Recalculated extruded bounding volumes can be conservative in narrow views.
  group.traverse(object => { if (object.isMesh) object.frustumCulled = false; });
  return group;
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
  const moonMat = new THREE.MeshStandardMaterial({ color: 0xcfc6b1, roughness: 1, metalness: 0, map: stone[1].map, emissive: 0xc2b49b, emissiveIntensity: .55 });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1.72, 48, 36), moonMat);
  moon.position.set(.6, 4.35, -30.0);
  scene.add(moon);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 260, 1, 1), new THREE.MeshStandardMaterial({ color: 0x1a3940, roughness: .24, metalness: .43, transparent: true, opacity: .86 }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -3.25;
  sea.receiveShadow = true;
  scene.add(sea);
  // Deliberately exclude scattered low-poly dodecahedrons.
  // A calm sea and a single monumental carved gateway read more believably
  // than arbitrary floating 'game rocks'.
  return { moon, sea };
}

const CAMERA_KEYS = [
  // A deliberate cinema path, not a linear pan into empty sky.
  // Hero: face dominates the right. Passage: portal becomes the subject.
  // Final act: camera physically crosses the arched stone threshold.
  { t: 0, p: [0, .15, 9.3], look: [1.2, .55, -3.3] },
  { t: .17, p: [-.25, .20, 7.8], look: [-1.7, .0, -6.0] },
  { t: .32, p: [-1.25, .20, 4.6], look: [-3.05, -.35, -7.5] },
  { t: .50, p: [-2.45, .25, .0], look: [-3.05, -.50, -7.5] },
  { t: .65, p: [-3.0, .15, -4.8], look: [-3.05, -.40, -11.0] },
  { t: .78, p: [-3.05, .12, -9.5], look: [-1.2, .10, -19.0] },
  { t: 1, p: [.5, 1.0, -12.5], look: [.2, .10, -23.0] },
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
  renderer.toneMappingExposure = 1.06;
  renderer.localClippingEnabled = true;
  const gl = renderer.getContext();
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const gpuName = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  const softwareRenderer = /swiftshader|llvmpipe|software/i.test(gpuName) || navigator.webdriver === true;
  document.documentElement.dataset.renderTier = softwareRenderer ? 'software' : 'hardware';
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnvironment = new RoomEnvironment();
  const reflectedLight = pmrem.fromScene(roomEnvironment, .04).texture;
  roomEnvironment.dispose();
  pmrem.dispose();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(THREE_BG);
  scene.fog = new THREE.FogExp2(0x0a1b1f, .022);
  scene.environment = reflectedLight;
  scene.environmentIntensity = .64;
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 130);
  // A single upper-left golden key establishes the shadows on sculpture and
  // masonry. The cooler fill lifts occluded features without double shadows.
  // Small practical lights belong to the portal/figure, not to the whole sky.
  const hemisphere = new THREE.HemisphereLight(0xbcced0, 0x39312c, .96);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight(0xffe1bc, 3.05);
  key.position.set(-6.2, 10.4, 7.6);
  key.target.position.set(-.5, -.55, -5.1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -12.5, right: 12.5, top: 12.5, bottom: -12.5, near: .5, far: 50 });
  key.shadow.bias = -.00032;
  key.shadow.normalBias = .027;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0x9dbbc0, .53);
  fill.position.set(8.5, 3.8, 5.4);
  scene.add(fill);
  const rim = new THREE.PointLight(0xc77a57, 5.2, 16, 2);
  rim.position.set(5.7, 3.65, -3.85);
  scene.add(rim);
  const gateLight = new THREE.PointLight(0x9bbdb8, 6.3, 9.5, 2);
  gateLight.position.set(-3.05, -.30, -7.15);
  scene.add(gateLight);

  const stone = makeStoneMaterials(marbleTexture());
  const proceduralColor = stone[0].map;
  const proceduralNormal = stone[0].normalMap;
  const statue = makeBust(stone);
  scene.add(statue);
  const threshold = portal(stone, -3.05, .52, -7.5, 1.42, true);
  threshold.rotation.y = .12;
  scene.add(threshold);
  const portalMasonry = enrichPortal(threshold,stone);
  const portalVeil = attachPortalVeil(threshold);
  const sideRuins = [portal(stone, -7.2, -.7, -12, 1.05), portal(stone, 5.3, -.3, -17, .88), portal(stone, -5.8, -.85, -23, .9)];
  sideRuins.forEach((g, i) => { g.rotation.y = (i - 1) * .23; scene.add(g); });
  const islandA = floatingIsland(stone, 2.7, -.4, -16, 1.5);
  const islandB = floatingIsland(stone, -2.5, .25, -23.5, 1.25);
  const islandC = floatingIsland(stone, 6.9, 1.9, -28, 1.72);
  scene.add(islandA, islandB, islandC);
  const { moon, sea } = addAtmosphere(scene, stone);
  const atmosphere = enhanceEnvironment(scene, { sea });
  const motes = createAtmosphericMotes(scene);
  document.documentElement.dataset.atmosphericMotes = 'ready';
  let lunar = null;
  document.documentElement.dataset.lunarAsset = 'loading';
  installLunarSurface({
    scene, placeholder: moon,
    onStatus(status) { if (!isDisposed) document.documentElement.dataset.lunarAsset = status; },
  }).then(resource => {
    if (isDisposed) resource?.dispose(); else lunar = resource;
  });
  let photographicSky = null;
  document.documentElement.dataset.photoSky = 'loading';
  installPhotographicSky({ scene, onLoaded(ok) {
    if (!isDisposed) {
      atmosphere.usePhotographicSky(ok);
      document.documentElement.dataset.photoSky = ok ? 'photographic' : 'procedural';
    }
  } }).then(resource => {
    if (isDisposed) resource?.dispose(); else photographicSky = resource;
  });
  // The crimson fabric belongs to the statue, not the portal. Its world-space
  // path begins behind the marble, spills around the right profile, and falls.
  // Crucially, the passage remains architecturally legible on both breakpoints.
  const ribbonA = createSilkRibbon([
    // Emerge from the ruptured face, rise in front of the cheek and then
    // curl BEHIND the head. Bring the roll inside the camera frustum; a long
    // straight run toward x=10 previously read like a horizontal red bar.
    [3.23,.13,-3.42], [3.62,.15,-1.96], [4.55,.31,-.28],
    [5.68,.86,.65], [5.98,1.92,-.68], [5.44,3.03,-2.46],
    [4.94,4.24,-3.05], [5.50,5.50,-2.72],
    [6.52,6.45,-2.17], [7.82,6.93,-1.76],
  ], { width: 1.13, phase: .54, color: 0xac3b2f });
  const ribbonB = createSilkRibbon([
    [2.7,-3.00,-3.65], [3.62,-3.25,-4.10], [4.65,-2.95,-4.30],
    [5.35,-2.45,-3.55], [6.30,-2.80,-3.05], [7.55,-3.55,-2.00],
  ], { width: .48, phase: 2.2, color: 0x852b24 });
  scene.add(ribbonA.mesh, ribbonB.mesh);

  let progress = 0, pointer = { x: 0, y: 0 }, motion = !reducedMotion;
  let scannedOracle = null;
  let sandstone = null;
  let isDisposed = false;
  document.documentElement.dataset.sceneMaterial = 'loading';
  loadSandstoneMaterials(stone, status => {
    if (!isDisposed) document.documentElement.dataset.sceneMaterial = status;
  }).then(value => {
    if (!isDisposed) sandstone = value;
    else value?.dispose();
  });
  document.documentElement.dataset.sceneAsset = 'loading';
  document.documentElement.dataset.webgl = 'loading';
  loadScannedOracle({
    scene,
    fallback: statue,
    onStatus: status => { if (!isDisposed) document.documentElement.dataset.sceneAsset = status; },
  }).then(value => { if (!isDisposed) scannedOracle = value; else value?.dispose(); }).catch(error => {
    console.warn('PBR sculpture loading failed; procedural fallback is still visible.', error);
    document.documentElement.dataset.sceneAsset = 'fallback';
  });
  let pausedByTab = document.hidden, elapsed = 0, last = performance.now(), raf = 0;
  // Dynamic resolution scaling prevents expensive PBR assets from making
  // mid-range mobile GPUs unusable. A hysteresis window avoids DPR flicker.
  let qualityScale = 1;
  let perfFrames = 0, perfSeconds = 0, slowWindows = 0, fastWindows = 0;
  let viewportWidth = 0, viewportHeight = 0, baseDpr = 1;
  const lookSmooth = new THREE.Vector3(0, 0, -5);
  const viewport = () => {
    const w = Math.max(1, window.innerWidth), h = Math.max(1, window.innerHeight);
    const compact = w < 700;
    baseDpr = Math.min(window.devicePixelRatio || 1, softwareRenderer ? .85 : compact ? 1.2 : 1.55);
    const dpr = Math.max(.55, baseDpr * qualityScale);
    viewportWidth = w; viewportHeight = h;
    // Preserve real depth/contact shadows on high-memory phones; less capable
    // mobiles keep the PBR light rig but skip the additional shadow pass.
    const mobileShadows = (navigator.deviceMemory || 0) >= 6 && (navigator.hardwareConcurrency || 0) >= 6;
    renderer.shadowMap.enabled = !softwareRenderer && (!compact || mobileShadows);
    key.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
    motes.setCompact(compact);
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
    // Chrome/SwiftShader can report an RAF timestamp older than a recent
    // performance.now() sample (especially after a tab or screenshot pause).
    // A negative delta makes the exponential damping alpha negative, causing
    // the camera to exponentially shoot millions of world units away.
    const frameNow = performance.now();
    const dt = Math.max(0, Math.min((frameNow - last) / 1000, .05));
    last = frameNow;
    if (motion) elapsed += dt;
    // Evaluate sustained frame time only while visible and moving. Long tab
    // stalls and reduced-motion mode are excluded from quality decisions.
    if (motion && dt > 0 && dt < .049) {
      perfFrames++; perfSeconds += dt;
      if (perfSeconds >= 3.0) {
        const fps = perfFrames / perfSeconds;
        const target = window.innerWidth < 700 ? 29 : 42;
        slowWindows = fps < target ? slowWindows + 1 : 0;
        fastWindows = fps > target + 16 ? fastWindows + 1 : 0;
        if (slowWindows >= 2 && qualityScale > .58) {
          qualityScale = Math.max(.58, qualityScale - .12);
          renderer.setPixelRatio(Math.max(.55, baseDpr * qualityScale));
          renderer.setSize(viewportWidth, viewportHeight, false);
          slowWindows = 0;
        } else if (fastWindows >= 4 && qualityScale < 1) {
          qualityScale = Math.min(1, qualityScale + .08);
          renderer.setPixelRatio(Math.max(.55, baseDpr * qualityScale));
          renderer.setSize(viewportWidth, viewportHeight, false);
          fastWindows = 0;
        }
        document.documentElement.dataset.qualityScale = qualityScale.toFixed(2);
        perfFrames = 0; perfSeconds = 0;
      }
    }
    const current = keyframe(progress);
    const mobile = window.innerWidth < 700;
    if (mobile) {
      const heroFocus = 1 - smooth(.05, .33, progress);
      current.p.x += .12 + heroFocus * 1.35;
      current.p.z += 1.5;
      current.look.x += heroFocus * 1.72;
      current.look.y += heroFocus * .23;
    }
    if (motion) { current.p.x += pointer.x * .13; current.p.y += pointer.y * .10; }
    if (!Number.isFinite(camera.position.lengthSq()) || camera.position.distanceTo(current.p) > 90) {
      camera.position.copy(current.p);
      lookSmooth.copy(current.look);
    }
    camera.position.lerp(current.p, 1 - Math.pow(.0006, dt));
    lookSmooth.lerp(current.look, 1 - Math.pow(.0004, dt));
    camera.lookAt(lookSmooth);
    statue.rotation.y = -.20 + (motion ? .014 * Math.sin(elapsed * .26) : 0);
    scannedOracle?.update(dt, progress, motion);
    atmosphere.update(dt, camera, motion);
    portalVeil?.update(dt, progress, motion);
    if (lunar) lunar.update(dt, motion);
    else moon.rotation.y = elapsed * .009;
    motes.update(dt, motion, renderer.getPixelRatio());
    islandA.visible = progress > .42;
    islandB.visible = progress > .57;
    islandC.visible = progress > .62;
    islandA.position.y = -.4 + (motion ? Math.sin(elapsed * .35) * .09 : 0);
    islandB.position.y = .25 + (motion ? Math.cos(elapsed * .30) * .10 : 0);
    if (motion || elapsed === 0) { ribbonA.update(elapsed); ribbonB.update(elapsed + 1.9); }
    renderer.render(scene, camera);
    if (document.documentElement.dataset.webgl !== 'ready') document.documentElement.dataset.webgl = 'ready';
    if (document.documentElement.dataset.renderFrames !== 'complete') {
      document.documentElement.dataset.renderFrames = 'complete';
      document.documentElement.dataset.renderTriangles = String(renderer.info.render.triangles);
    }
  };
  render(performance.now());
  return {
    debug() {
      camera.updateMatrixWorld(true);
      const coords = obj => {
        const p = obj.getWorldPosition(new THREE.Vector3());
        const projected = p.clone().project(camera);
        return {
          position: p.toArray().map(v => +v.toFixed(2)),
          ndc: projected.toArray().map(v => +v.toFixed(2)),
          visible: Math.abs(projected.x) < 1.3 && Math.abs(projected.y) < 1.3 && projected.z < 1,
        };
      };
      return {
        progress: +progress.toFixed(3),
        camera: camera.position.toArray().map(v => +v.toFixed(2)),
        lookingAt: lookSmooth.toArray().map(v => +v.toFixed(2)),
        statue: coords(scannedOracle?.object || statue),
        portal: coords(threshold),
        renderTriangles: renderer.info.render.triangles,
        canvas: [canvas.width, canvas.height],
        sky: document.documentElement.dataset.photoSky,
        dustMotes: motes.count,
        keyLight: key.position.toArray().map(v => +v.toFixed(2)),
        shadowEnabled: renderer.shadowMap.enabled,
      };
    },
    setProgress(value) { progress = clamp(value); },
    setPointer(x, y) { pointer = { x, y }; },
    setMotion(value) { motion = !reducedMotion && value; },
    dispose() {
      isDisposed = true;
      cancelAnimationFrame(raf);
      scannedOracle?.dispose();
      sandstone?.dispose();
      portalVeil?.dispose();
      portalMasonry?.dispose();
      ribbonA.dispose();
      ribbonB.dispose();
      atmosphere.dispose();
      motes.dispose();
      lunar?.dispose();
      photographicSky?.dispose();
      reflectedLight.dispose();
      proceduralColor.dispose();
      proceduralNormal.dispose();
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
