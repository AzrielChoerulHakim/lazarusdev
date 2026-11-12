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
    const radius = 2.05;
    const topGeometry = new THREE.SphereGeometry(radius, 80, 40, 0, Math.PI * 2, 0, Math.PI / 2 - .075);
    const lowerGeometry = new THREE.SphereGeometry(radius, 80, 40, 0, Math.PI * 2, Math.PI / 2 + .075, Math.PI / 2 - .075);
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
    const moon = new THREE.Group();
    moon.name = 'The Hollow Moon — two suspended lunar hemispheres';
    moon.position.copy(placeholder.position);
    moon.rotation.set(.12, -.12, -.20);
    moon.frustumCulled = false;
    const upper = new THREE.Mesh(topGeometry, material);
    const lower = new THREE.Mesh(lowerGeometry, material);
    upper.position.y = .34;
    lower.position.y = -.34;
    moon.add(upper, lower);
    // Solid dark cut faces make the gap physically readable from oblique
    // viewpoints. These are exclusive hemispheres, never overlapping moons.
    const cutMaterial = new THREE.MeshStandardMaterial({color:0x3e3b33,roughness:.94,side:THREE.DoubleSide});
    const cutGeometry = new THREE.CircleGeometry(radius * Math.cos(.075), 80);
    for (const sign of [-1, 1]) {
      const cut = new THREE.Mesh(cutGeometry, cutMaterial);
      cut.rotation.x = Math.PI / 2;
      cut.position.y = sign * radius * Math.sin(.075);
      (sign > 0 ? upper : lower).add(cut);
    }
    const orbitMaterial = new THREE.MeshStandardMaterial({color:0xc9985e,roughness:.4,metalness:.56});
    const orbitGeometry = new THREE.TorusGeometry(2.63,.022,8,128);
    const orbit = new THREE.Mesh(orbitGeometry,orbitMaterial);
    orbit.rotation.set(1.24, .15, -.24);
    moon.add(orbit);
    const coreGeometry = new THREE.SphereGeometry(.19,24,16);
    const core = new THREE.Mesh(coreGeometry,orbitMaterial);
    core.position.z = .35;
    moon.add(core);
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
    glow.scale.set(6.1,6.1,1);
    scene.add(moon,glow);
    placeholder.visible = false;
    onStatus('nasa');
    let time = 0;
    document.documentElement.dataset.lunarForm = 'hollow-hemispheres';
    return {
      object: moon,
      update(dt, active) {
        if (active) time += Math.min(dt,.06);
        upper.position.y = .34 + Math.sin(time * .19) * .09;
        lower.position.y = -upper.position.y;
        orbit.rotation.z = -.24 + Math.sin(time * .11) * .12;
        moon.rotation.y = -.12 + time * .002;
      },
      debug: () => ({hemispheres:2,gap:+(upper.position.y*2).toFixed(3)}),
      dispose() {
        scene.remove(moon,glow);
        topGeometry.dispose();
        lowerGeometry.dispose();
        cutGeometry.dispose();
        coreGeometry.dispose();
        orbitGeometry.dispose();
        cutMaterial.dispose();
        orbitMaterial.dispose();
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
