import * as THREE from 'three';

const FILES = {
  diffuse: new URL('../assets/textures/old_sandstone_02_diff_1k.jpg', import.meta.url).href,
  normal: new URL('../assets/textures/old_sandstone_02_nor_gl_1k.jpg', import.meta.url).href,
  roughness: new URL('../assets/textures/old_sandstone_02_rough_1k.jpg', import.meta.url).href,
};
const loader = new THREE.TextureLoader();

// Replace lightweight procedural stone with licensed physical maps after the
// first render. This maintains a usable experience on slow connections.
export async function loadSandstoneMaterials(materials, onStatus = () => {}) {
  let maps;
  try {
    const [diffuse, normal, roughness] = await Promise.all([
      loader.loadAsync(FILES.diffuse),
      loader.loadAsync(FILES.normal),
      loader.loadAsync(FILES.roughness),
    ]);
    maps = { diffuse, normal, roughness };
    diffuse.colorSpace = THREE.SRGBColorSpace;
    for (const texture of [diffuse,normal,roughness]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 2;
      texture.repeat.set(.92, .92);
      texture.needsUpdate = true;
    }
    materials.forEach((material, index) => {
      material.map = diffuse;
      material.normalMap = normal;
      material.normalScale.set(.48, .48);
      material.roughnessMap = roughness;
      material.roughness = .99;
      material.metalness = 0;
      const tints = [0xf4e6d0, 0xc8b79d, 0x948875];
      material.color.setHex(tints[index] || tints[0]);
      material.needsUpdate = true;
    });
    onStatus('photographic');
    return {
      dispose() {Object.values(maps).forEach(texture=>texture.dispose());},
    };
  } catch (error) {
    if (maps) Object.values(maps).forEach(texture=>texture.dispose());
    console.warn('PBR sandstone unavailable; keeping procedural stone surface.',error);
    onStatus('procedural');
    return null;
  }
}
