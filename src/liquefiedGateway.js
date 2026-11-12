import * as THREE from 'three';

// A structural impossibility, not a screen-space distortion. These are actual
// shadow-casting stone surfaces sharing the gateway's photographic PBR material.
// The aperture stays clear enough for the live second-world render and camera.
const FLOW_SPECS = [
  { name: 'Right capital becoming a stone waterfall', width: .166, depth: .120, phase: 1,
    points: [[1.41,.33,.50],[1.50,.13,.56],[1.61,-.25,.58],[1.68,-.76,.58],[1.53,-1.30,.60],[1.72,-1.98,.64],[1.51,-2.59,.59]] },
  { name: 'Outer right arch slipping out of its geometry', width: .112, depth: .105, phase: 2,
    points: [[1.23,.88,.48],[1.32,.70,.54],[1.39,.44,.58],[1.46,.08,.64],[1.54,-.36,.60]] },
  { name: 'Keystone flowing inward against its load', width: .138, depth: .087, phase: 3,
    points: [[.45,1.44,.50],[.47,1.26,.57],[.40,1.02,.61],[.46,.78,.64],[.36,.52,.58]] },
  { name: 'Central crown bending into the impossible opening', width: .093, depth: .080, phase: 4,
    points: [[-.30,1.48,.51],[-.34,1.32,.57],[-.24,1.13,.61],[-.36,.89,.58]] },
  { name: 'Left arch flowing upward in reversed gravity', width: .113, depth: .097, phase: 5,
    points: [[-1.31,.61,.52],[-1.44,.76,.57],[-1.55,1.06,.60],[-1.63,1.40,.62],[-1.83,1.72,.61]] },
  { name: 'Left stone jamb liquefying beside the aperture', width: .108, depth: .085, phase: 6,
    points: [[-1.44,-.42,.51],[-1.55,-.75,.56],[-1.48,-1.19,.58],[-1.60,-1.78,.61],[-1.48,-2.57,.60]] },
  { name: 'Thin rising marble thread detached from gravity', width: .060, depth: .068, phase: 7,
    points: [[1.43,.79,.52],[1.54,1.02,.58],[1.62,1.27,.63],[1.68,1.60,.65],[1.75,1.86,.65]] },
];

function softenedStone(points, width, depth, phase) {
  // Elliptical, uneven cross-sections keep the material reading as viscous
  // quarried limestone instead of cylindrical candles or plastic tubes.
  const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'centripetal');
  const rings = Math.max(36, Math.ceil(path.getLength() * 28));
  const sides = 14;
  const positions = [], uvs = [], indices = [];
  const zAxis = new THREE.Vector3(0, 0, 1);
  const lateral = new THREE.Vector3();
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const p = path.getPoint(t);
    const tangent = path.getTangent(t);
    lateral.set(-tangent.y, tangent.x, 0).normalize();
    // Make the start overlap the masonry and finish as a closed, heavy bead.
    const terminal = t > .82 ? Math.max(.018, 1 - Math.pow((t - .82) / .18, 1.45)) : 1;
    const swell = .84 + .20 * Math.sin(Math.PI * t) + .085 * Math.sin(t * 22 + phase);
    const radius = Math.max(.006, terminal * swell);
    for (let j = 0; j <= sides; j++) {
      const a = j / sides * Math.PI * 2;
      const grain = 1 + .062 * Math.sin(a * 3 + t * 33 + phase)
                      + .033 * Math.sin(a * 7 - t * 51);
      const x = Math.cos(a) * width * radius * grain;
      const z = Math.sin(a) * depth * radius * grain;
      positions.push(
        p.x + lateral.x * x,
        p.y + lateral.y * x,
        p.z + zAxis.z * z
      );
      uvs.push(j / sides * 1.15, t * (path.getLength() * .78));
      if (i < rings && j < sides) {
        const q = i * (sides + 1) + j;
        indices.push(q, q + sides + 1, q + 1, q + 1, q + sides + 1, q + sides + 2);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const pseudoRandom = (() => {
  let seed = 926341;
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
})();

export function createLiquefiedGateway(gate, stone) {
  const group = new THREE.Group();
  group.name = 'Impossible stone liquefaction — one original gateway';
  gate.add(group);

  const flows = [];
  FLOW_SPECS.forEach((spec, i) => {
    const mesh = new THREE.Mesh(softenedStone(spec.points, spec.width, spec.depth, spec.phase), stone[i % 4 === 0 ? 1 : 0]);
    mesh.name = spec.name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    group.add(mesh);
    flows.push(mesh);
  });

  // Marble droplets have escaped the softened arch. The same material and
  // lighting make them look like pieces of the stone, not glowing particles.
  const count = 22;
  const shards = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), stone[1], count);
  shards.name = 'Suspended droplets of marble in contradictory gravity';
  shards.frustumCulled = false;
  shards.castShadow = false;
  shards.receiveShadow = false;
  shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(shards);

  const particles = [];
  for (let i = 0; i < count; i++) {
    const r = pseudoRandom();
    const theta = .12 + pseudoRandom() * 2.86;
    const distance = 1.52 + pseudoRandom() * .36;
    const direction = i % 3 === 0 ? -1 : 1;
    const side = Math.cos(theta) > 0 ? 1 : -1;
    particles.push({
      x: Math.cos(theta) * distance + side * .07,
      y: Math.sin(theta) * distance + (r - .5) * .33,
      z: .64 + pseudoRandom() * .39,
      size: .024 + pseudoRandom() * .050,
      phase: pseudoRandom() * Math.PI * 2,
      direction,
      speed: .28 + pseudoRandom() * .58,
    });
  }

  const dummy = new THREE.Object3D();
  let time = 0;
  function update(dt, _progress, motion) {
    if (motion) time += Math.min(Math.max(dt, 0), .05);
    particles.forEach((p, i) => {
      const sway = Math.sin(time * p.speed + p.phase);
      dummy.position.set(
        p.x + (motion ? .027 * Math.cos(time * p.speed * .64 + p.phase) : 0),
        p.y + (motion ? .060 * sway * p.direction : 0),
        p.z + (motion ? .024 * Math.sin(time * .35 + p.phase) : 0),
      );
      dummy.rotation.set(p.phase + time * .08, p.phase * .5 + time * .12, p.phase * 2 - time * .10);
      dummy.scale.set(p.size * .77, p.size * (1.18 + .18 * sway), p.size * .69);
      dummy.updateMatrix();
      shards.setMatrixAt(i, dummy.matrix);
    });
    shards.instanceMatrix.needsUpdate = true;
  }
  update(0, 0, false);

  return {
    update,
    debug: () => ({ actualMeltingMeshes: flows.length, levitatingStoneDroplets: count, openingIntact: true }),
    dispose() {
      gate.remove(group);
      group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    }
  };
}
