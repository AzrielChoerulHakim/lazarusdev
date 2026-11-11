import * as THREE from 'three';

// Depth-tested airborne limestone powder with genuine 3D parallax.
// An independently distributed cluster settles through the oracle's fissure.
export function createAtmosphericMotes(scene, { compact = false } = {}) {
  let seed = 20261111;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const fractureCount = 132;
  const atmosphereCount = 316;
  const count = fractureCount + atmosphereCount;
  const positions = new Float32Array(count * 3);
  const metadata = new Float32Array(count * 4);
  const tints = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const fracture = i < fractureCount;
    const j = i * 3;
    if (fracture) {
      positions[j] = 3.75 + (random() - .5) * 4.7;
      positions[j + 1] = .05 + (random() - .5) * 1.75;
      positions[j + 2] = -1.2 + (random() - .5) * 4.3;
    } else {
      positions[j] = -9.5 + random() * 19;
      positions[j + 1] = -2.4 + random() * 8.0;
      positions[j + 2] = -16 + random() * 20;
    }
    const k = i * 4;
    metadata[k] = (fracture ? .58 : .82) + random() * (fracture ? .91 : 1.00);
    metadata[k + 1] = random();
    metadata[k + 2] = fracture ? 1 : 0;
    metadata[k + 3] = random() * Math.PI * 2;
    const warmth = random();
    tints[j] = .73 + warmth * .19;
    tints[j + 1] = .69 + warmth * .15;
    tints[j + 2] = .58 + warmth * .16;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aMeta', new THREE.BufferAttribute(metadata, 4));
  geometry.setAttribute('aTint', new THREE.BufferAttribute(tints, 3));
  geometry.setDrawRange(0, compact ? 244 : count);
  geometry.computeBoundingSphere();
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uDpr: { value: 1 } },
    vertexShader: String.raw`
      precision highp float;
      attribute vec4 aMeta;
      attribute vec3 aTint;
      uniform float uTime;
      uniform float uDpr;
      varying vec3 vTint;
      varying float vOpacity;
      void main() {
        vec3 p = position;
        float drift = .025 + aMeta.y * .105;
        p.x += sin(uTime * (.14 + aMeta.y * .22) + aMeta.w) * drift;
        p.z += cos(uTime * (.09 + aMeta.y * .19) + aMeta.w) * drift * .65;
        if (aMeta.z > .5) {
          // Powder settles slowly through the fracture; never moves like sparks.
          p.y += .39 - mod(uTime * (.035 + aMeta.y * .065) + aMeta.w * .20, .78);
        } else {
          p.y += sin(uTime * (.11 + aMeta.y * .08) + aMeta.w) * .08;
        }
        vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
        float distanceToEye = max(1.0, -viewPosition.z);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = clamp(aMeta.x * 15.0 * uDpr / distanceToEye, .8, 3.25);
        // Shafts of upper-left sunlight give particles directional visibility.
        float sunShaft = exp(-pow((p.x + 2.8 - p.y * .32) / 6.5, 2.0));
        float fractureLift = aMeta.z * exp(-pow((p.y - .05) / .78, 2.0));
        float distanceFade = 1.0 - smoothstep(15.0, 43.0, distanceToEye);
        float shimmer = .90 + .10 * sin(uTime * .27 + aMeta.w * 3.0);
        vOpacity = (.12 + sunShaft * .36 + fractureLift * .23)
                 * (.63 + .37 * aMeta.y) * distanceFade * shimmer;
        vTint = aTint;
      }
    `,
    fragmentShader: String.raw`
      precision highp float;
      varying vec3 vTint;
      varying float vOpacity;
      void main() {
        vec2 p = gl_PointCoord - vec2(.5);
        float r2 = dot(p, p) * 4.0;
        float feather = pow(max(0.0, 1.0 - r2), 2.2);
        float opacity = feather * vOpacity;
        if (opacity < .012) discard;
        gl_FragColor = vec4(vTint, opacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    fog: false,
  });
  const points = new THREE.Points(geometry, material);
  points.name = 'Backlit limestone motes and fracture powder';
  geometry.boundingSphere.radius += 1;
  points.frustumCulled = true;
  points.renderOrder = 3;
  scene.add(points);
  let time = 0;
  return {
    count: geometry.drawRange.count,
    update(dt, motion, pixelRatio) {
      if (motion) time += dt;
      material.uniforms.uTime.value = time;
      material.uniforms.uDpr.value = Math.max(.65, Math.min(2, pixelRatio));
    },
    setCompact(compactView) {
      geometry.setDrawRange(0, compactView ? 244 : count);
      this.count = geometry.drawRange.count;
    },
    dispose() {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    },
  };
}
