import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Independent, physically shaded masonry layer for the monumental main gate.
// Keep this anchored to the existing portal: no images or billboard impostors.
function block(w, h, d, material, x, y, z, bevel = .025) {
  const g = new RoundedBoxGeometry(w, h, d, 3, bevel);
  const mesh = new THREE.Mesh(g, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  return mesh;
}

function fluteGeometry(radius, height, flutes = 16) {
  const radiusSegments = 128, heightSegments = 9;
  const geometry = new THREE.CylinderGeometry(radius, radius * 1.08, height, radiusSegments, heightSegments);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    const theta = Math.atan2(z, x);
    const lip = Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, y / height + .5)))), .55);
    const groove = (Math.cos(theta * flutes) + 1) * .5;
    const shrink = 1 - .065 * groove * lip;
    position.setXYZ(i, x * shrink, y, z * shrink);
  }
  geometry.computeVertexNormals();
  return geometry;
}
function archivolt(radius, tube, mat, z) {
  const geometry = new THREE.TorusGeometry(radius, tube, 8, 118, Math.PI);
  const ring = new THREE.Mesh(geometry, mat);
  ring.position.set(0, 0, z);
  ring.castShadow = true;
  ring.receiveShadow = true;
  ring.frustumCulled = false;
  return ring;
}
function stoneCracks() {
  // Hairline microfractures are thin world-space lines engraved on the front
  // surface. They follow the columns instead of being random floating sparks.
  const lines = [];
  const rng = seed => {
    let x = seed >>> 0;
    return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
  };
  const random = rng(20261111);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 13; i++) {
      let x = side * 1.255 + (random() - .5) * .34;
      let y = -2.38 + random() * 2.27;
      const z = .405;
      for (let j = 0; j < 4; j++) {
        let dx = (random() - .48) * .058;
        let dy = (.018 + random() * .07) * (random() > .5 ? 1 : -1);
        lines.push(x,y,z,x+dx,y+dy,z);
        x += dx; y += dy;
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(lines,3));
  const material = new THREE.LineBasicMaterial({ color: 0x4d483b, transparent: true, opacity: .29, depthWrite: false });
  const mesh = new THREE.LineSegments(geometry,material);
  mesh.renderOrder = 3;
  return mesh;
}

export function enrichPortal(gate, stone) {
  const detail = new THREE.Group();
  detail.name = 'Lazarus carved travertine architectural details';
  gate.add(detail);
  const pale = stone[0], aged = stone[1], deep = stone[2];

  for (const side of [-1, 1]) {
    const x = side * 1.255;
    // The old rectangular core becomes a structural pier behind the facing
    // column. The fluted shaft has actual 3D curvature and grazing-light ridges.
    const column = new THREE.Mesh(fluteGeometry(.245,2.47),pale);
    column.position.set(x, -1.35, .215);
    column.castShadow = true;
    column.receiveShadow = true;
    column.frustumCulled = false;
    detail.add(column);
    for (const [radius, height, yy, z] of [
      [.286,.095,-2.62,.215],[.26,.062,-2.51,.215],
      [.263,.083,-.20,.215],[.30,.12,-.11,.215],
    ]) {
      const geometry = new THREE.CylinderGeometry(radius,radius*1.025,height,36);
      const crown = new THREE.Mesh(geometry, yy< -2.4 ? aged : pale);
      crown.position.set(x,yy,z);
      crown.castShadow = crown.receiveShadow = true;
      detail.add(crown);
    }
    // Two stepped stylobate slabs anchor the portal in the water, rather
    // than letting parallel cardboard legs float in mid-air.
    detail.add(block(.86,.12,1.05,aged,x,-2.68,.07,.024));
    detail.add(block(.68,.20,.89,pale,x,-2.55,.06,.017));
    detail.add(block(.84,.16,.93,aged,x,.09,.07,.022));
    detail.add(block(.70,.12,.86,pale,x,.18,.08,.02));
    // Side-facing recessed shadow slot in stone: real parallax at oblique view.
    detail.add(block(.053,2.1,.042,deep,x + side * .213,-1.36,.43,.008));
  }
  // Multiple profiled archivolts create actual stone depth and catch
  // directional light, replacing two perfect thin rings.
  detail.add(archivolt(1.382,.061,aged,.461));
  detail.add(archivolt(1.305,.023,deep,.51));
  detail.add(archivolt(1.145,.053,pale,.48));
  detail.add(archivolt(1.060,.016,deep,.493));

  // Heavy keystone and upper weathered cornice; never close the central hole.
  detail.add(block(.46,.29,.88,pale,0,1.52,.04,.028));
  detail.add(block(.77,.095,1.04,aged,0,1.71,.015,.018));

  // Semi-submerged foundation / treads: positioned so the enlarged gate
  // meets the ocean plane at approximately y=-3.245 world-space.
  detail.add(block(3.65,.15,1.16,aged,0,-2.745,.15,.045));
  detail.add(block(3.25,.08,.83,pale,0,-2.64,.31,.025));
  detail.add(block(3.45,.085,.43,deep,0,-2.735,.94,.026));

  detail.add(stoneCracks());
  return {
    object: detail,
    dispose() {
      gate.remove(detail);
      detail.traverse(item => {
        if (item.geometry) item.geometry.dispose();
        if (item.isLineSegments) item.material?.dispose();
      });
    },
  };
}
