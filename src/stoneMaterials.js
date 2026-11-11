import * as THREE from 'three';

const FILES = {
  diffuse: new URL('../assets/textures/old_sandstone_02_diff_1k.jpg', import.meta.url).href,
  normal: new URL('../assets/textures/old_sandstone_02_nor_gl_1k.jpg', import.meta.url).href,
  roughness: new URL('../assets/textures/old_sandstone_02_rough_1k.jpg', import.meta.url).href,
};
const loader = new THREE.TextureLoader();

// Convert the authentic sandstone photograph to a softly neutral limestone
// albedo, while preserving all its microscopic mineral grain. The raw quarry
// photograph has strong ochre streaks which looked like wood in long pillars.
// The real photographed normal/roughness maps are retained, not replaced.
function limestoneAlbedo(source) {
  const image=source.image;
  const canvas=document.createElement('canvas');
  canvas.width=image.naturalWidth||image.width;
  canvas.height=image.naturalHeight||image.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
  for(let i=0;i<pixels.data.length;i+=4){
    const l=(.2126*pixels.data[i]+.7152*pixels.data[i+1]+.0722*pixels.data[i+2])/255;
    // Retain the licensed stone photograph's mineral veins and real pitting:
    // overly compressing the tonal range made every face a flat chalk slab.
    const mineral=Math.max(.44,Math.min(.93,.74+(l-.50)*.78));
    // Cool-cream travertine; key lighting supplies natural warm highlights.
    const value=mineral*255;
    pixels.data[i]=value;
    pixels.data[i+1]=value*.982;
    pixels.data[i+2]=value*.947;
  }
  ctx.putImageData(pixels,0,0);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

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
    const neutralDiffuse=limestoneAlbedo(diffuse);
    diffuse.dispose();
    maps = { diffuse:neutralDiffuse, normal, roughness };
    for (const texture of [neutralDiffuse,normal,roughness]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 4;
      texture.repeat.set(1.18, 1.18);
      texture.needsUpdate = true;
    }
    materials.forEach((material, index) => {
      material.map = neutralDiffuse;
      material.normalMap = normal;
      material.normalScale.set(.68, .68);
      material.roughnessMap = roughness;
      material.roughness = .98;
      material.metalness = 0;
      // Most blocks are from the same neutral limestone bed, with only
      // occasional weathered darker courses.
      // The previous near-white tint was washed out by the key light and
      // made the temple resemble plaster. Stone is warm-gray limestone with
      // naturally darker, water-exposed blocks.
      const tints = [0xc8c0b1, 0xb3aa99, 0x888073];
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
