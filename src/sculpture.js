import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SCULPT_ASSET = new URL('../assets/models/marble_bust_01.glb', import.meta.url).href;
const modelLoader = new GLTFLoader();
const axis = new THREE.Vector3(0, 1, 0);

// The source model is a CC0 sculpt by Rico Cilliers (Poly Haven).
// Clones share geometry and PBR textures; the two world-space clipping planes
// carve the bust into impossible displaced upper/lower halves without baking it.
export async function loadScannedOracle({ scene, fallback, onStatus = () => {} }) {
  let asset;
  try {
    asset = await modelLoader.loadAsync(SCULPT_ASSET);
  } catch (error) {
    console.warn('Scanned bust could not be loaded; keeping original procedural sculpture.', error);
    onStatus('fallback');
    return null;
  }
  if (!asset?.scene) {
    onStatus('fallback');
    return null;
  }

  const model = asset.scene;
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y < 0.01) {
    onStatus('fallback');
    return null;
  }

  // Normalize the scanned asset's real-world 51.5cm height to a monumental
  // ~5-unit sculpt: its PBR material and facial topology remain untouched.
  const factor = 5.05 / size.y;
  model.scale.setScalar(factor);
  model.position.set(-center.x * factor, -center.y * factor, -center.z * factor);
  model.updateMatrixWorld(true);

  const upper = new THREE.Group();
  const lower = new THREE.Group();
  const lowerCopy = model.clone(true);
  upper.add(model);
  lower.add(lowerCopy);

  const anchor = new THREE.Group();
  anchor.name = 'The Rupture — scanned marble figure';
  anchor.position.set(2.35, .63, -1.55);
  anchor.rotation.y = -.18;
  anchor.rotation.z = -.045;
  anchor.add(upper, lower);

  const cutY = anchor.position.y + .19;
  // Keep a 0.2 world-unit gap, centered across the eye/nose region.
  // Clipping planes are in world space and track the figure's moving halves.
  const upperPlane = new THREE.Plane(axis.clone(), -(cutY + .11));
  const lowerPlane = new THREE.Plane(axis.clone().negate(), cutY - .11);

  function attachClippedMaterial(part, plane) {
    part.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const originals = Array.isArray(object.material) ? object.material : [object.material];
      const clipped = originals.map(material => {
        const m = material.clone();
        m.clippingPlanes = [plane];
        m.clipShadows = true;
        m.side = THREE.DoubleSide;
        if (m.roughness != null) m.roughness = Math.max(.79, m.roughness);
        if ('metalness' in m) m.metalness = Math.min(.03, m.metalness);
        m.needsUpdate = true;
        return m;
      });
      object.material = Array.isArray(object.material) ? clipped : clipped[0];
    });
  }
  attachClippedMaterial(upper, upperPlane);
  attachClippedMaterial(lower, lowerPlane);

  const chips = new THREE.Group();
  const chipStone = new THREE.MeshStandardMaterial({ color: 0xb9a98f, roughness: 1, metalness: 0, flatShading: true });
  for (let i = 0; i < 11; i++) {
    const t = i / 11;
    const a = t * Math.PI * 2 + .2;
    const radius = .76 + Math.sin(i * 1.33) * .18;
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(.035 + (i % 3) * .026, 0), chipStone);
    mesh.position.set(Math.cos(a) * radius, .18 + Math.cos(i * 2.1) * .07, .78 + Math.sin(a) * .2);
    mesh.rotation.set(a, i, -a * .4);
    mesh.castShadow = true;
    chips.add(mesh);
  }
  anchor.add(chips);
  scene.add(anchor);
  fallback.visible = false;

  onStatus('scanned');

  let time = 0;
  return {
    object: anchor,
    update(dt, scrollProgress, ambient) {
      if (ambient) time += dt;
      const r = Math.max(0, Math.min(1, scrollProgress));
      const reveal = Math.sin(Math.min(r * 2.8, 1) * Math.PI / 2);
      const breath = ambient ? Math.sin(time * .23) : 0;
      upper.position.set(-.035 - reveal * .05, .075 + reveal * .13 + breath * .008, .01);
      lower.position.set(.035 + reveal * .11, -.075 - reveal * .10, .025);
      upper.rotation.z = reveal * -.016;
      lower.rotation.z = reveal * .023;
      upperPlane.constant = -(cutY + .11);
      lowerPlane.constant = cutY - .11;
      chips.rotation.y = breath * .014;
      chips.position.x = reveal * .04;
    },
    dispose() {
      scene.remove(anchor);
      [upper, lower].forEach(part => part.traverse(object => {
        if (!object.isMesh) return;
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        mats.forEach(m => m.dispose());
      }));
      chipStone.dispose();
      chips.children.forEach(o => o.geometry.dispose());
    },
  };
}
