import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function cutBlock(w,h,d,material,x,y,z,bevel=.024) {
  const geometry=new RoundedBoxGeometry(w,h,d,3,bevel);
  const block=new THREE.Mesh(geometry,material);
  block.position.set(x,y,z);
  block.castShadow=block.receiveShadow=true;
  return block;
}
function carvedWear() {
  const vertices=[];
  let seed=812031;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  for(const side of [-1,1]) {
    // The front is approximately z=.51 in local gate space. Incisions are
    // registered to the face of the real ashlar, not hovering in open space.
    for(let i=0;i<28;i++){
      const row=Math.floor(rnd()*7);
      const cy=-2.69+(row+.5)*2.69/7;
      let xx=side*1.255+(rnd()-.5)*.41;
      let yy=cy+(rnd()-.5)*.21;
      for(let j=0;j<2;j++){
        const dx=(rnd()-.5)*.072;
        const dy=(rnd()-.47)*.105;
        vertices.push(xx,yy,.514,xx+dx,yy+dy,.514);
        xx+=dx;yy+=dy;
      }
    }
  }
  // Hairline weathering along several individual voussoir faces.
  for(let i=0;i<12;i++){
    const theta=.17+rnd()*(Math.PI-.34);
    const r=1.12+rnd()*.24;
    const x=Math.cos(theta)*r,y=Math.sin(theta)*r;
    const dx=(rnd()-.5)*.03,dy=(rnd()-.5)*.036;
    vertices.push(x,y,.515,x+dx,y+dy,.515);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  const m=new THREE.LineBasicMaterial({color:0x494238,transparent:true,opacity:.23,depthWrite:false});
  const lines=new THREE.LineSegments(g,m);
  lines.name='Small surface erosion marks';
  return lines;
}

export function enrichPortal(gate,stone) {
  const detail=new THREE.Group();
  detail.name='Stone foundation, carved erosion and shadowed inner jambs';
  gate.add(detail);
  const pale=stone[0],aged=stone[1],deep=stone[2];

  // Two full-depth recessed returns tie the pier to the arch throat.
  // The old decorative front cylinders and multiple torus rings are gone:
  // they were competing geometry and made the gate look computer-generated.
  for(const side of [-1,1]){
    const x=side*1.255;
    detail.add(cutBlock(.055,2.50,.86,deep,side*1.02,-1.33,-.015,.012));
    // Abutting vertical edge wears differently from the exposed face.
    detail.add(cutBlock(.075,2.30,.065,aged,side*1.061,-1.37,-.445,.009));
    const footing=cutBlock(.86,.135,1.17,aged,x,-2.74,.005,.034);
    detail.add(footing);
  }
  // Roughly submerged stone steps. A single crossing sill preserves an
  // unbroken walking route when the 3D camera moves through the opening.
  detail.add(cutBlock(3.5,.14,1.20,aged,0,-2.825,-.06,.046));
  detail.add(cutBlock(3.12,.075,.92,pale,0,-2.725,.095,.027));

  const grainsG=new THREE.IcosahedronGeometry(1,0);
  const grit=new THREE.InstancedMesh(grainsG,aged,38);
  const obj=new THREE.Object3D();
  let seed=900714;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<grit.count;i++){
    const side=i%2?1:-1;
    obj.position.set(side*(.99+rnd()*.53),-2.629+rnd()*.012,.36+rnd()*.24);
    obj.rotation.set(rnd()*3,rnd()*3,rnd()*3);
    const radius=.009+rnd()*.021;
    obj.scale.set(radius*1.6,radius*.5,radius);
    obj.updateMatrix();
    grit.setMatrixAt(i,obj.matrix);
  }
  grit.instanceMatrix.needsUpdate=true;
  grit.name='Weathered grains resting on stylobate';
  detail.add(grit);
  detail.add(carvedWear());
  return {
    object:detail,
    dispose(){
      gate.remove(detail);
      detail.traverse(item=>{
        item.geometry?.dispose();
        if(item.isLineSegments)item.material?.dispose();
      });
    },
  };
}
