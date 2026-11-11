import * as THREE from 'three';

const LUNAR_COLOR = new URL('../assets/moon/lroc_color_2k.jpg', import.meta.url).href;
const LUNAR_ELEVATION = new URL('../assets/moon/ldem_3_8bit.jpg', import.meta.url).href;

/**
 * NASA/GSFC Scientific Visualization Studio (CGI Moon Kit #4720).
 * LROC WAC lunar albedo + LOLA derived elevation. Both are public-domain
 * NASA source material, not fictional painted patterns or sandstone.
 */
export async function installLunarSurface({ scene, placeholder, onStatus = () => {} }) {
  const loader = new THREE.TextureLoader();
  let albedo = null, height = null;
  try {
    [albedo, height] = await Promise.all([
      loader.loadAsync(LUNAR_COLOR),
      loader.loadAsync(LUNAR_ELEVATION),
    ]);
    albedo.colorSpace = THREE.SRGBColorSpace;
    albedo.anisotropy = 4;
    // The low-resolution elevation map supplies subtle visible crater relief,
    // not exaggerated mountain peaks seen in generic sci-fi moon renders.
    const radius = 1.72;
    const geometry = new THREE.SphereGeometry(radius, 120, 80);
    const material = new THREE.MeshStandardMaterial({
      map: albedo,
      displacementMap: height,
      displacementScale: .044,
      displacementBias: -.022,
      bumpMap: height,
      bumpScale: .058,
      color: 0xf8eee0,
      roughness: 1,
      metalness: 0,
      emissive: 0x706d65,
      emissiveIntensity: .11,
      fog: false,
    });
    const moon = new THREE.Mesh(geometry, material);
    moon.name = 'NASA Lunar Reconnaissance Orbiter moon';
    moon.position.copy(placeholder.position);
    moon.rotation.y = -.12;
    moon.castShadow = false;
    moon.receiveShadow = true;
    moon.frustumCulled = false;
    // A subtle distant glow is not a surface texture; avoid bright game-like bloom.
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const ctx = glowCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(64,64,38,64,64,64);
    gradient.addColorStop(0,'rgba(232,208,169,0)');
    gradient.addColorStop(.49,'rgba(237,210,172,.09)');
    gradient.addColorStop(1,'rgba(237,210,172,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,128,128);
    const glowMap = new THREE.CanvasTexture(glowCanvas);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowMap, color: 0xf2debd, transparent: true,
      opacity: .65, depthWrite: false, fog: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.copy(moon.position);
    glow.scale.set(4.9,4.9,1);
    scene.add(moon,glow);
    placeholder.visible = false;
    onStatus('nasa');
    return {
      object: moon,
      update(dt, active) { if (active) moon.rotation.y += Math.min(dt,.05) * .002; },
      dispose() {
        scene.remove(moon,glow);
        geometry.dispose();
        material.dispose();
        albedo.dispose();
        height.dispose();
        glowMap.dispose();
        glowMaterial.dispose();
      }
    };
  } catch(err) {
    albedo?.dispose();
    height?.dispose();
    onStatus('fallback');
    console.warn('NASA lunar maps unavailable; retained untextured fallback.',err);
    return null;
  }
}
