import * as THREE from 'three';

/**
 * Cinematic silk strips, not a cloth physics solver.
 * Explicit S-curves, a low-frequency flutter, broad folds and a micro-woven
 * tangent-space normal texture avoid jagged flat shards from twisted strips.
 * The geometry has true depth: it reacts to HDRI and moves through the scene.
 */
function silkWeave() {
  const dim = 256;
  const data = new Uint8Array(dim * dim * 4);
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const dx = Math.sin(x * Math.PI * 2 / 6) * .13;
      const dy = Math.sin(y * Math.PI * 2 / 11) * .09;
      const k = (y * dim + x) * 4;
      data[k] = Math.round(127.5 + dx * 127);
      data[k + 1] = Math.round(127.5 + dy * 127);
      data[k + 2] = 252;
      data[k + 3] = 255;
    }
  }
  const map = new THREE.DataTexture(data,dim,dim,THREE.RGBAFormat);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8,2);
  map.needsUpdate = true;
  return map;
}

export function createSilkRibbon(points, options = {}) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(p => new THREE.Vector3(...p)), false, 'centripetal', .35
  );
  const along = 176, across = 28, cols = across + 1;
  const positions = new Float32Array((along + 1) * cols * 3);
  const uv = new Float32Array((along + 1) * cols * 2);
  const colors = new Float32Array((along + 1) * cols * 3);
  const indices = [];
  const envelope = t => Math.pow(Math.sin(Math.PI * (.04 + .92 * t)), .7);
  for (let i = 0; i <= along; i++) {
    const t = i / along;
    for (let j = 0; j <= across; j++) {
      const v = j / across, k = i * cols + j;
      uv[k * 2] = t; uv[k * 2 + 1] = v;
      // Roll-satin sheen: broad highlights, slightly worn selvage.
      const selvage = Math.pow(Math.abs(v - .5) * 2, 8);
      const luminosity = .95 - .10 * selvage + .04 * Math.cos(t * 13.5);
      colors[k * 3] = luminosity;
      colors[k * 3 + 1] = luminosity * .93;
      colors[k * 3 + 2] = luminosity * .91;
      if (i < along && j < across) {
        const a = k, b = a + cols;
        indices.push(a,b,a+1,a+1,b,b+1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));

  const weave = silkWeave();
  const material = new THREE.MeshPhysicalMaterial({
    color: options.color ?? 0xac3c30,
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: .59,
    metalness: 0,
    sheen: 1,
    sheenColor: new THREE.Color(0xe17b65),
    sheenRoughness: .36,
    specularIntensity: .78,
    specularColor: new THREE.Color(0xf6c3b0),
    clearcoat: 0,
    normalMap: weave,
    normalScale: new THREE.Vector2(.11,.11),
  });
  const mesh = new THREE.Mesh(geometry,material);
  mesh.name = 'Satin ribbon — sculpted spline fabric';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;

  // Preallocate all intermediate vectors. No allocations every RAF frame.
  const center = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const up = new THREE.Vector3(0,1,0);
  const width = options.width ?? .95;
  const phase = options.phase ?? 0;
  let stopped = false;
  function update(time = 0) {
    if (stopped) return;
    for (let i = 0; i <= along; i++) {
      const t = i / along;
      curve.getPoint(t,center);
      curve.getTangent(t,tangent).normalize();
      side.copy(tangent).cross(up).normalize();
      if (side.lengthSq() < .0001) side.set(0,0,1);
      normal.crossVectors(side,tangent).normalize();
      const weight = envelope(t);
      const breeze = Math.sin(8 * t - .5 * time + phase) * .065 * weight;
      const drape = Math.sin(t * Math.PI * 1.6 + phase) * .11 * weight;
      center.y += breeze + drape;
      center.z += Math.sin(11*t + .27*time + phase) * .08 * weight;
      // The long flag gradually rolls around its path as gravity pulls it;
      // a small constant roll never read as three-dimensional fabric.
      const twist = Math.sin(t * 6.8 + phase + time * .15) * .37
        + Math.sin(t * 2.9 + phase * .45) * .17;
      const s = Math.sin(twist), c = Math.cos(twist);
      const w = width * (.16 + .84 * weight);
      for (let j = 0; j <= across; j++) {
        const v = j / across * 2 - 1;
        const k = (i * cols + j) * 3;
        const flutter = (.018 + .055 * t) * weight
          * Math.sin(3 * Math.PI * v + 12.5 * t - time * .53 + phase);
        const curl = .082 * weight * Math.pow(Math.abs(v),3)
          * Math.sin(t * 5.4 - time * .20 + phase);
        const horizontal = v * .5 * w * s + flutter + curl;
        const vertical = v * .5 * w * c;
        positions[k] = center.x + normal.x * vertical + side.x * horizontal;
        positions[k+1] = center.y + normal.y * vertical + side.y * horizontal;
        positions[k+2] = center.z + normal.z * vertical + side.z * horizontal;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  update();
  return {
    mesh, update,
    dispose() { stopped = true; geometry.dispose(); material.dispose(); weave.dispose(); },
  };
}
