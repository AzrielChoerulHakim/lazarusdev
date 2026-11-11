import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SCULPT_ASSET = new URL('../assets/models/marble_bust_01.glb', import.meta.url).href;
const loader = new GLTFLoader();

// One actual museum-quality 3D scan. Previously the scene contained a primitive
// fallback bust PLUS two full copies of the scan with independent clipping
// shaders. Even with the fallback hidden, the split layers could read as two
// overlapping faces (especially during upload/compilation on mobile GPUs).
// A single object is more credible and has no z-fighting or duplicated eyes.
export async function loadScannedOracle({ scene, onStatus = () => {} }) {
  let asset;
  try {
    asset = await loader.loadAsync(SCULPT_ASSET);
  } catch (error) {
    console.warn('Marble scan unavailable; keeping the semantic page without a synthetic replacement.', error);
    onStatus('unavailable');
    return null;
  }
  const model = asset?.scene;
  if (!model) {
    onStatus('unavailable');
    return null;
  }
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y < .01) {
    onStatus('unavailable');
    return null;
  }

  // Convert the source's ~51.5 cm photographed marble sculpture into the
  // oversized, classical monument. Its geometry is NEVER copied.
  const factor = 6.75 / size.y;
  model.scale.setScalar(factor);
  model.position.set(-center.x * factor, -center.y * factor, -center.z * factor);
  model.updateMatrixWorld(true);
  const anchor = new THREE.Group();
  anchor.name = 'The Oracle — single photographic marble scan';
  anchor.position.set(3.72, -1.58, -1.28);
  anchor.scale.setScalar(1.56);
  anchor.rotation.set(0, -.13, -.045);
  anchor.add(model);

  const materials = [];
  let count = 0;
  model.traverse(object => {
    if (!object.isMesh) return;
    count++;
    object.castShadow = true;
    object.receiveShadow = true;
    // Our monumental scan moves close to the clipping frustum. Do not let its
    // imported, small-scale local bounding box make it disappear.
    object.frustumCulled = false;
    const originals = Array.isArray(object.material) ? object.material : [object.material];
    const shaded = originals.map(src => {
      const material = src.clone();
      if (material.color) material.color.multiply(new THREE.Color(0xf3f0e8));
      if (material.roughness != null) material.roughness = Math.max(.72, material.roughness);
      if (material.metalness != null) material.metalness = Math.min(.025, material.metalness);
      if ('envMapIntensity' in material) material.envMapIntensity = .84;
      materials.push(material);
      return material;
    });
    object.material = Array.isArray(object.material) ? shaded : shaded[0];
  });
  scene.add(anchor);
  document.documentElement.dataset.fracture = 'single-scan';
  document.documentElement.dataset.statueMode = 'single-scan';
  document.documentElement.dataset.statueMeshes = String(count);
  onStatus('scanned');
  return {
    object: anchor,
    meshCount: count,
    // Keep this monument stable in world space. An animated stone figure was
    // the source of visible jitter against fixed editorial text.
    update() {},
    dispose() {
      scene.remove(anchor);
      for (const material of materials) material.dispose();
      // Mesh geometry/textures belong to this one GLTF and will be disposed by
      // the scene owner's general resource teardown if still attached.
      model.traverse(object => {
        if (!object.isMesh) return;
        object.geometry?.dispose();
      });
    },
  };
}
