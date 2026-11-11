import * as THREE from 'three';
import { loadScannedOracle } from './sculpture.js';
import { enhanceEnvironment } from './environment.js';
import { attachPortalVeil } from './portalFx.js';
import { loadSandstoneMaterials } from './stoneMaterials.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { installLunarSurface } from './lunarSurface.js';
import { enrichPortal } from './architecturalDetails.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { installPhotographicSky } from './photographicSky.js';
import { createAtmosphericMotes } from './atmosphericParticles.js';

const THREE_BG = 0x081a1d;
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, t) => { const p = clamp((t - a) / (b - a)); return p * p * (3 - 2 * p); };
// Seeded noise is still needed for the sandstone's procedural fallback maps.
// It is unrelated to the removed low-poly statue.
const rand = (() => { let seed = 37021; return () => { seed = (Math.imul(1664525,seed) + 1013904223) >>> 0; return seed / 4294967296; }; })();

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
function weatheredBlock(w, h, d, salt = 0) {
  // Subtle sculpted curvature and chipped corners catch grazing sunlight.
  // Plain perfect cubes are the strongest visual cue that the world is synthetic.
  // Quarried limestone has shallow, irregular relief across its whole face,
  // not a perfectly smooth six-sided box with noise only along the silhouette.
  // Seven subdivisions produce real grazing-light micro shadows on masonry.
  const geo = new RoundedBoxGeometry(w, h, d, 7, Math.min(.017, w * .05, h * .05, d * .05));
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
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: .015, bevelSize: .013, bevelSegments: 1, steps: 1, curveSegments: 3 });
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
  group.name = 'One continuous ancient ashlar gateway';
  const inner = 1.03, outer = 1.48;
  const courseCount = 7, pierHeight = 2.69, courseHeight = pierHeight / courseCount;

  for (const side of [-1,1]) {
    const px = side * 1.255;
    // Actual bonded courses: each face is a separate weathered piece of
    // masonry with tiny shadow-producing joints. This replaces the previous
    // perfect rectangular pier with a cylinder drawn on its surface.
    const core = stoneMesh(weatheredBlock(.49,2.66,.81,31+side),stone[2]);
    core.position.set(px,-1.345,-.025);
    group.add(core);
    for(let row=0;row<courseCount;row++){
      const h=courseHeight-.0045;
      const offset=(Math.sin(row*2.8+side*1.35)*.0045);
      const block=stoneMesh(weatheredBlock(.545,h,.99,12+row*1.7+side),stone[(row+side+12)%7===0?1:0]);
      block.position.set(px+offset,-2.69+(row+.5)*courseHeight,.015);
      block.rotation.y=Math.sin(row*2.3+side)*.003;
      // Every quarried course needs its own part of the original photographic
      // texture; seven identical texture patches read as stacked wooden tiles.
      const uv=block.geometry.attributes.uv;
      const du=.13*row+(side>0?.29:.07);
      const dv=.11*((row*3)%7)+.04*side;
      for(let k=0;k<uv.count;k++) uv.setXY(k,uv.getX(k)*.91+du,uv.getY(k)*.91+dv);
      uv.needsUpdate=true;
      group.add(block);
    }
    // Simple, heavy Romanesque capital and plinth with real relief.
    const plinth=stoneMesh(weatheredBlock(.77,.19,1.15,35+side),stone[1]);
    plinth.position.set(px,-2.66,.015);
    group.add(plinth);
    const impost=stoneMesh(weatheredBlock(.75,.17,1.13,42+side),stone[1]);
    impost.position.set(px,.075,-.008);
    group.add(impost);
    const impostLip=stoneMesh(weatheredBlock(.68,.075,1.09,45+side),stone[0]);
    impostLip.position.set(px,.195,-.008);
    group.add(impostLip);
  }

  const count=15;
  for(let i=0;i<count;i++){
    const a0=i*Math.PI/count+.007;
    const a1=(i+1)*Math.PI/count-.007;
    // The central voussoir is the real keystone. No fake rectangular
    // crown balancing on top of the ring.
    const keystone=i===Math.floor(count/2);
    const exterior=keystone?outer+.075:outer;
    const wedge=archWedge(a0,a1,exterior,inner,.99,stone[keystone?1:i%7===2?1:0]);
    wedge.name=keystone?'Single load-bearing keystone':`Ashlar voussoir ${i+1}`;
    group.add(wedge);
  }
  // There is genuinely nothing filling the passage except fine airborne
  // haze. The back of each solid voussoir is visible during a camera fly-through.
  if(glow){
    const glass=new THREE.MeshBasicMaterial({color:0x9bb5a1,transparent:true,opacity:.055,depthWrite:false,side:THREE.DoubleSide});
    const aperture=new THREE.Shape();
    aperture.moveTo(-inner,-2.5);aperture.lineTo(-inner,0);
    for(let i=0;i<=32;i++){
      const a=Math.PI-i*Math.PI/32;
      aperture.lineTo(Math.cos(a)*inner,Math.sin(a)*inner);
    }
    aperture.lineTo(inner,-2.5);aperture.closePath();
    const membrane=new THREE.Mesh(new THREE.ShapeGeometry(aperture),glass);
    membrane.position.z=-.55;
    membrane.name='Portal light volume';
    group.add(membrane);
  }
  group.position.set(x,y,z);
  group.scale.setScalar(size);
  group.traverse(obj=>{if(obj.isMesh)obj.frustumCulled=false});
  return group;
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
  // The figure lives on the right, the gateway stays on the left; once the
  // figure clears frame, the route travels through the actual stone aperture.
  // Continuous cubic-Hermite tangents eliminate every stop/start at keyframes.
  { t: 0,   p: [0, .15, 9.3],    look: [1.2, .55, -3.3] },
  { t: .16, p: [-.20, .20, 7.8], look: [-1.35, .05, -5.4] },
  { t: .30, p: [-1.18, .20, 4.6],look: [-3.05, -.20, -7.5] },
  { t: .46, p: [-2.35, .23, .1], look: [-3.05, -.42, -7.5] },
  { t: .60, p: [-2.93, .17, -4.8],look: [-3.05, -.35, -10] },
  { t: .70, p: [-3.045, .12, -7.12],look: [-3.06, -.25, -14] },
  { t: .82, p: [-3.06, .13, -11.0],look: [-2.1, .10, -19] },
  { t: 1, p: [.30, .92, -12.8],look: [.2, .12, -23.0] },
];
function sampleCoordinate(field, component, aIndex, u) {
  const bIndex = aIndex + 1;
  const a = CAMERA_KEYS[aIndex], b = CAMERA_KEYS[bIndex];
  const previous = CAMERA_KEYS[Math.max(0, aIndex - 1)];
  const following = CAMERA_KEYS[Math.min(CAMERA_KEYS.length - 1, bIndex + 1)];
  const span = b.t - a.t;
  const m0 = (b[field][component] - previous[field][component]) / (b.t - previous.t);
  const m1 = (following[field][component] - a[field][component]) / (following.t - a.t);
  const u2 = u * u, u3 = u2 * u;
  return (2*u3 - 3*u2 + 1) * a[field][component]
       + (u3 - 2*u2 + u) * span * m0
       + (-2*u3 + 3*u2) * b[field][component]
       + (u3 - u2) * span * m1;
}
function keyframe(t) {
  let i = 0;
  while (i < CAMERA_KEYS.length - 2 && CAMERA_KEYS[i + 1].t < t) i++;
  const a = CAMERA_KEYS[i], b = CAMERA_KEYS[i + 1];
  const u = clamp((t - a.t) / (b.t - a.t));
  return {
    p: new THREE.Vector3(...[0, 1, 2].map(j => sampleCoordinate('p', j, i, u))),
    look: new THREE.Vector3(...[0, 1, 2].map(j => sampleCoordinate('look', j, i, u))),
  };
}

export function createWorld(canvas, { initialProgress = 0 } = {}) {
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
  // No synthetic fallback is ever placed over the photographic scan.
  // A failed network load leaves the landscape intact, never a low-poly head.
  const statue = null;
  const threshold = portal(stone, -3.05, .52, -7.5, 1.42, true);
  threshold.rotation.y = .12;
  scene.add(threshold);
  const portalMasonry = enrichPortal(threshold,stone);
  const portalVeil = attachPortalVeil(threshold);
  // One deliberate portal and one photographed sculpture: decorative
  // duplicate arches, hovering islands and faceted rocks obscured the scan.
  // Keeping the distance uncluttered also makes the threshold readable.
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
  // No ribbons, primitive busts, doubled scans or decorative geometry overlap the face.
  let progress = clamp(initialProgress), targetProgress = clamp(initialProgress), pointer = { x: 0, y: 0 }, motion = !reducedMotion;
  let portalFlight = null;
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
    onStatus: status => { if (!isDisposed) document.documentElement.dataset.sceneAsset = status; },
  }).then(value => { if (!isDisposed) scannedOracle = value; else value?.dispose(); }).catch(error => {
    console.warn('Photographic marble scan failed; the editorial page remains usable.', error);
    document.documentElement.dataset.sceneAsset = 'unavailable';
  });
  let pausedByTab = document.hidden, elapsed = 0, last = performance.now(), raf = 0;
  // Dynamic resolution scaling prevents expensive PBR assets from making
  // mid-range mobile GPUs unusable. A hysteresis window avoids DPR flicker.
  let qualityScale = 1;
  let perfFrames = 0, perfSeconds = 0, slowWindows = 0, fastWindows = 0;
  let viewportWidth = 0, viewportHeight = 0, baseDpr = 1;
  // The previous renderer began at camera (0,0,0) and eased toward a distant
  // hero pose, producing an obvious opening-scene jump before the visitor
  // touched the page. Initialize the physically correct pose immediately.
  const initialCamera=keyframe(progress);
  if (window.innerWidth < 700) {
    const heroFocus = 1 - smooth(.05, .33, progress);
    initialCamera.p.x += .12 + heroFocus * 1.35;
    initialCamera.p.z += 1.5;
    initialCamera.look.x += heroFocus * 1.72;
    initialCamera.look.y += heroFocus * .23;
  }
  camera.position.copy(initialCamera.p);
  const lookSmooth=initialCamera.look.clone();
  camera.lookAt(lookSmooth);
  const viewport = () => {
    const w = Math.max(1, window.innerWidth), h = Math.max(1, window.innerHeight);
    const compact = w < 700;
    const lowPower = (navigator.deviceMemory || 8) <= 4;
    baseDpr = Math.min(window.devicePixelRatio || 1,
      softwareRenderer ? .85 : compact ? (lowPower ? 1.05 : 1.17) : (lowPower ? 1.25 : 1.45));
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
  let lastViewportWidth=window.innerWidth;
  let lastViewportHeight=window.innerHeight;
  const onResize = () => {
    const w=window.innerWidth, h=window.innerHeight;
    // Mobile URL bars resize the visual viewport while a finger is scrolling.
    // Do not change projection matrix, WebGL backing size, or shadows mid-swipe.
    if(w<700 && Math.abs(w-lastViewportWidth)<3 && Math.abs(h-lastViewportHeight)<155)return;
    lastViewportWidth=w;lastViewportHeight=h;
    viewport();
  };
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
    const frameDelta = Math.max(0, (frameNow - last) / 1000);
    // Frame time must match the elapsed real time. Capping at 50 ms caused
    // the cinematic pose to lag multiple seconds behind scroll on mobile
    // devices drawing fewer than 20 frames per second.
    const dt = Math.min(frameDelta, .22);
    last = frameNow;
    if (motion) elapsed += dt;
    // Crucially: count genuinely slow frames. The old dt < .049 filter
    // excluded every frame below ~20fps, preventing resolution reduction on
    // precisely the machines where the scroll would judder.
    if (motion && frameDelta > 0 && frameDelta < .5) {
      perfFrames++; perfSeconds += frameDelta;
      if (perfSeconds >= 1.8) {
        const fps = perfFrames / perfSeconds;
        const target = window.innerWidth < 700 ? 29 : 42;
        slowWindows = fps < target ? slowWindows + 1 : 0;
        fastWindows = fps > target + 16 ? fastWindows + 1 : 0;
        if (slowWindows >= 1 && qualityScale > .58) {
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
    // Damped scroll coordinates smooth mouse wheels, touchpad momentum and
    // finger scrolling without rewriting native scroll / accessibility.
    if (portalFlight) {
      // Use wall time: SwiftShader may draw only a few frames per second.
      // A camera journey must not last longer just because the GPU is slow.
      portalFlight.elapsed = Math.max(0, (frameNow - portalFlight.startedAt) / 1000);
      const flightT = clamp(portalFlight.elapsed / 2.15);
      progress = mix(portalFlight.start, .82, smooth(0, 1, flightT));
      portalFlight.onProgress?.(flightT);
      if (portalFlight.elapsed >= 2.42) {
        const finish = portalFlight.onEntered;
        portalFlight = null;
        finish?.();
      }
    } else {
      // One damped stage only: camera pose smooths the native scroll.
      // Damping progress AND camera previously doubled the lag and made the
      // start of each scroll gesture look stuck, then abruptly catch up.
      progress = targetProgress;
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
    // Parallax is kept subtle, and disappears during a guided portal flight.
    if (motion && !portalFlight) { current.p.x += pointer.x * .065; current.p.y += pointer.y * .045; }
    if (!Number.isFinite(camera.position.lengthSq()) || camera.position.distanceTo(current.p) > 90) {
      camera.position.copy(current.p);
      lookSmooth.copy(current.look);
    }
    // One spring, measured in real seconds. The flight is kept a little
    // tighter; ordinary scroll remains eased without sticking on slow GPUs.
    const positionRate = portalFlight ? 13.0 : 10.2;
    const lookRate = portalFlight ? 13.0 : 10.2;
    camera.position.lerp(current.p, 1 - Math.exp(-dt * positionRate));
    lookSmooth.lerp(current.look, 1 - Math.exp(-dt * lookRate));
    camera.lookAt(lookSmooth);
    scannedOracle?.update(dt, progress, motion);
    atmosphere.update(dt, camera, motion);
    portalVeil?.update(dt, progress, motion);
    if (lunar) lunar.update(dt, motion);
    else moon.rotation.y = elapsed * .009;
    motes.update(dt, motion, renderer.getPixelRatio());
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
        if (!obj) return {position:null,ndc:null,visible:false};
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
        targetProgress: +targetProgress.toFixed(3),
        portalFlying: Boolean(portalFlight),
        worldObjects: scene.children.length,
        camera: camera.position.toArray().map(v => +v.toFixed(2)),
        lookingAt: lookSmooth.toArray().map(v => +v.toFixed(2)),
        statue: coords(scannedOracle?.object),
        statueMode: document.documentElement.dataset.statueMode,
        statueMeshCount: scannedOracle?.meshCount ?? 0,
        statueDuplicatesRemoved: scannedOracle?.duplicatesRemoved ?? 0,
        statueMeshes: scannedOracle?.meshSummary ?? [],
        scanRootCount: scene.children.filter(o=>o.name==='The Oracle — single photographic marble scan').length,
        syntheticBustCount: scene.children.filter(o=>o.name==='Fragmented marble oracle').length,
        portal: coords(threshold),
        renderTriangles: renderer.info.render.triangles,
        canvas: [canvas.width, canvas.height],
        sky: document.documentElement.dataset.photoSky,
        dustMotes: motes.count,
        keyLight: key.position.toArray().map(v => +v.toFixed(2)),
        shadowEnabled: renderer.shadowMap.enabled,
      };
    },
    setProgress(value) { targetProgress = clamp(value); },
    enterPortal(onProgress, onEntered) {
      if (portalFlight) return false;
      if (reducedMotion) { onEntered?.(); return true; }
      portalFlight = {
        elapsed: 0, startedAt: performance.now(), start: Math.max(.21, progress),
        onProgress, onEntered,
      };
      return true;
    },
    setPointer(x, y) { pointer = { x, y }; },
    setMotion(value) { motion = !reducedMotion && value; },
    dispose() {
      isDisposed = true;
      cancelAnimationFrame(raf);
      scannedOracle?.dispose();
      sandstone?.dispose();
      portalVeil?.dispose();
      portalMasonry?.dispose();
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
