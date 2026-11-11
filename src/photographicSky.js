import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const SKY_JPG = new URL('../assets/hdris/sky_photo_2k.jpg', import.meta.url).href;
const SKY_HDR = new URL('../assets/hdris/kloppenheim_06_puresky_1k.hdr', import.meta.url).href;

// The photographed panorama is intentionally distinct from the lighting probe:
// mobile devices decode a small JPG for the visible sky, while the 1k RGBE HDR
// provides the directional radiance needed for believable PBR highlights.
export async function installPhotographicSky({ scene, onLoaded = () => {} }) {
  const images = [];
  try {
    const [photo, hdr] = await Promise.all([
      new THREE.TextureLoader().loadAsync(SKY_JPG),
      new RGBELoader().loadAsync(SKY_HDR),
    ]);
    images.push(photo, hdr);
    photo.mapping = THREE.EquirectangularReflectionMapping;
    photo.colorSpace = THREE.SRGBColorSpace;
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = photo;
    scene.backgroundIntensity = .73;
    scene.backgroundRotation.set(0, 1.32, 0);
    scene.environment = hdr;
    scene.environmentRotation.set(0, 1.32, 0);
    scene.environmentIntensity = .70;
    onLoaded(true);
    return { dispose() { images.forEach(texture => texture.dispose()); } };
  } catch (error) {
    images.forEach(texture => texture.dispose());
    console.warn('Photographic sky unavailable; retaining procedural atmosphere.', error);
    onLoaded(false);
    return null;
  }
}
