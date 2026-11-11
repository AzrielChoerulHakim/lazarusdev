import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SCULPT_ASSET = new URL('../assets/models/marble_bust_01.glb', import.meta.url).href;
const modelLoader = new GLTFLoader();
const axis = new THREE.Vector3(0, 1, 0);

// The source model is a CC0 sculpt by Rico Cilliers (Poly Haven).
// Clones share geometry and PBR textures; the two world-space clipping planes
// carve the bust into impossible displaced upper/lower halves without baking it.

function fractureRim(level, normalDirection, variant) {
  // A physically shaded, irregular cross-section at the two sides of the
  // displaced stone face. The open center is intentional: the photographed
  // atmosphere should remain visible through the impossible rupture.
  const segments = 72, rings = 4;
  const vertices = [], colors = [], indices = [];
  for (let r = 0; r < rings; r++) {
    const depth = r / (rings - 1);
    const radius = 1 - depth * .205;
    for (let i = 0; i < segments; i++) {
      const a = i / segments * Math.PI * 2;
      const edge = Math.sin(a * 13 + variant) * .035
                 + Math.sin(a * 29 - variant * .7) * .014
                 + Math.cos(a * 7 + .5) * .026;
      const rr = radius + edge * (1 - depth * .4);
      const yy = level + normalDirection * (
        depth * .085 + Math.sin(a * 17 + variant) * .018
        + Math.cos(a * 33 - variant) * .008
      );
      vertices.push(Math.cos(a) * 1.51 * rr, yy, Math.sin(a) * 1.07 * rr + .12);
      const shade = .79 + Math.sin(a * 19 + depth * 9) * .085 - depth * .19;
      colors.push(shade * 1.00, shade * .90, shade * .73);
    }
  }
  for (let r = 0; r < rings - 1; r++) {
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments;
      const a = r * segments + i, b = r * segments + j;
      const d = (r + 1) * segments + i, e = (r + 1) * segments + j;
      indices.push(a, b, d, b, e, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: 0xd0bba0, vertexColors: true, roughness: 1, metalness: 0,
    side: THREE.DoubleSide, flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = normalDirection > 0 ? 'Exposed upper limestone fracture' : 'Exposed lower limestone fracture';
  return mesh;
}

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
  const factor = 6.75 / size.y;
  model.scale.setScalar(factor);
  model.position.set(-center.x * factor, -center.y * factor, -center.z * factor);
  model.updateMatrixWorld(true);

  const upper = new THREE.Group();
  const lower = new THREE.Group();
  const lowerCopy = model.clone(true);
  upper.add(model);
  lower.add(lowerCopy);
  // Recessed fractured rims catch real HDR light and keep the rupture hollow,
  // rather than showing raw triangle clipping with an unnaturally flat edge.
  const upperRim = fractureRim(1.18, -1, .7);
  const lowerRim = fractureRim(.94, 1, 1.4);
  // The physical rims are retained as an optional art-direction layer, but
  // disabled until a true mesh boolean cut matches the scan silhouette.
  // The previous loose ring looked like a synthetic beige bar across the face.
  upperRim.visible = false;
  lowerRim.visible = false;
  upper.add(upperRim);
  lower.add(lowerRim);

  const anchor = new THREE.Group();
  anchor.name = 'The Rupture — scanned marble figure';
  // The reference is a monumental face emerging from an impossible landscape,
  // not a small museum bust on a pedestal. The base is intentionally below the
  // horizon while the face fills the right side of a desktop viewport.
  anchor.position.set(3.72, -1.58, -1.28);
  anchor.scale.setScalar(1.56);
  anchor.rotation.y = -.13;
  anchor.rotation.z = -.045;
  anchor.add(upper, lower);

  const cutY = anchor.position.y + 1.06 * anchor.scale.y;
  // Keep a 0.2 world-unit gap, centered across the eye/nose region.
  // Clipping planes are in world space and track the figure's moving halves.
  const upperPlane = new THREE.Plane(axis.clone(), -(cutY + .11 * anchor.scale.y));
  const lowerPlane = new THREE.Plane(axis.clone().negate(), cutY - .11 * anchor.scale.y);

  // Shaded, irregular world-space fracture rather than the dead-straight
  // horizontal cut of two stock clipping planes. A permissive clipping plane
  // still provides GPU/shadow culling; the actual crack edge is resolved in
  // the surface shader, so it inherits the scan's photographic PBR detail.
  const fractureUniforms = [];
  function attachClippedMaterial(part, plane, isUpper) {
    part.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      // The scanned asset is rebased and cloned beneath moving parents.
      // Some GPU/browser combinations cull its original local-space bounds;
      // the bust is the hero focal point, so it must never disappear.
      object.frustumCulled = false;
      const originals = Array.isArray(object.material) ? object.material : [object.material];
      const clipped = originals.map(material => {
        const m = material.clone();
        m.clippingPlanes = [plane];
        m.clipShadows = true;
        const cutUniform = { value: cutY };
        fractureUniforms.push({ cutUniform, isUpper });
        m.onBeforeCompile = shader => {
          shader.uniforms.uRuptureCut = cutUniform;
          shader.uniforms.uRuptureDirection = { value: isUpper ? 1.0 : -1.0 };
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\n varying vec3 vRuptureWorld;')
            .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vRuptureWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
          shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', '#include <common>\n varying vec3 vRuptureWorld;\n uniform float uRuptureCut;\n uniform float uRuptureDirection;')
            .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
              float fracture = 0.065 * sin(vRuptureWorld.x * 4.05 + sin(vRuptureWorld.z * 3.1) * .7)
                  + 0.027 * sin(vRuptureWorld.x * 10.3 - vRuptureWorld.z * 7.2)
                  + 0.010 * sin(vRuptureWorld.x * 23.1 + vRuptureWorld.z * 19.3);
              if (uRuptureDirection * (vRuptureWorld.y - uRuptureCut - fracture) < 0.0) discard;`);
        };
        m.side = THREE.DoubleSide;
        if (m.roughness != null) m.roughness = Math.max(.83, m.roughness);
        if (m.color) m.color.multiply(new THREE.Color(0xe8dbc7));
        if (m.normalScale) m.normalScale.multiplyScalar(1.07);
        if ('envMapIntensity' in m) m.envMapIntensity = .65;
        if ('metalness' in m) m.metalness = Math.min(.03, m.metalness);
        m.needsUpdate = true;
        return m;
      });
      object.material = Array.isArray(object.material) ? clipped : clipped[0];
    });
  }
  attachClippedMaterial(upper, upperPlane, true);
  attachClippedMaterial(lower, lowerPlane, false);

  const chips = new THREE.Group();
  const chipStone = new THREE.MeshStandardMaterial({ color: 0xb9a98f, roughness: 1, metalness: 0, flatShading: true });
  for (let i = 0; i < 11; i++) {
    const t = i / 11;
    const a = t * Math.PI * 2 + .2;
    const radius = .76 + Math.sin(i * 1.33) * .18;
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(.035 + (i % 3) * .026, 0), chipStone);
    mesh.position.set(Math.cos(a) * radius, 1.07 + Math.cos(i * 2.1) * .09, .89 + Math.sin(a) * .25);
    mesh.rotation.set(a, i, -a * .4);
    mesh.castShadow = true;
    chips.add(mesh);
  }
  chips.visible = false; // Floating polyhedral chips read as visual noise rather than damaged marble.
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
      upper.position.set(-.018 - reveal * .035, .04 + reveal * .055 + breath * .006, .01);
      lower.position.set(.018 + reveal * .045, -.04 - reveal * .045, .02);
      upper.rotation.z = reveal * -.016;
      lower.rotation.z = reveal * .023;
      const topCut = cutY + (.11 + upper.position.y) * anchor.scale.y;
      const bottomCut = cutY + (-.11 + lower.position.y) * anchor.scale.y;
      // Permit a 14cm fringe for the irregular shader edge.
      upperPlane.constant = -(topCut - .14);
      lowerPlane.constant = bottomCut + .14;
      for (const { cutUniform, isUpper } of fractureUniforms) {
        cutUniform.value = isUpper ? topCut : bottomCut;
      }
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
      [upperRim, lowerRim].forEach(o => { o.geometry.dispose(); o.material.dispose(); });
      chips.children.forEach(o => o.geometry.dispose());
    },
  };
}
