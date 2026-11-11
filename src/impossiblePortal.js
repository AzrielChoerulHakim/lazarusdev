import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Stage 02. A second 3D environment is seen only through the actual gate,
// using a screen-projected live render, and then becomes the whole landscape
// once the camera physically crosses the plane of the opening.
const saturate = v => Math.max(0, Math.min(1, v));
const ease = (a, b, x) => { const t = saturate((x-a)/(b-a)); return t*t*(3-2*t); };

function makeAperture() {
  const r = 1.018;
  const shape = new THREE.Shape();
  shape.moveTo(-r, -2.50);
  shape.lineTo(-r, 0);
  for(let i=0;i<=72;i++) {
    const theta = Math.PI * (1-i/72);
    shape.lineTo(Math.cos(theta)*r, Math.sin(theta)*r);
  }
  shape.lineTo(r, -2.50);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

function terrain(x,z) {
  // Broad, varied wind-formed dunes; the stone road is compacted but not flat.
  const dunes = Math.sin(x*.073 + z*.052 + Math.cos(z*.027))*.55
    + Math.cos(z*.064 - x*.091)*.50
    + Math.sin(x*.22 + Math.cos(z*.11))*.15;
  const passage = ease(2.5,12,Math.abs(x));
  return -3.16 + dunes * (.20 + passage*.63);
}

function buildDesert(scene, tracked) {
  scene.background = new THREE.Color(0xe2b390);
  scene.fog = new THREE.FogExp2(0xe0b08b, .009);
  scene.add(new THREE.HemisphereLight(0xffe5c0, 0x825c49, 1.85));
  const sun = new THREE.DirectionalLight(0xffd5a0, 3.35);
  // Low late-afternoon light: sunset and real directional shadows agree.
  sun.position.set(-12, 8, -54);
  sun.target.position.set(0, -2, -16);
  // The photographed-looking desert needs genuine raking shadows.
  // An intentionally modest shadow atlas works on mid-range hardware;
  // the renderer automatically skips this pass on low-power phones.
  sun.castShadow=true;
  sun.shadow.mapSize.set(512,512);
  Object.assign(sun.shadow.camera,{
    left:-36,right:36,top:36,bottom:-36,near:1,far:100
  });
  sun.shadow.bias=-.0003;
  sun.shadow.normalBias=.035;
  scene.add(sun, sun.target);

  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');
  const pixels=ctx.createImageData(256,256);
  let seed=20261111;
  for(let i=0;i<pixels.data.length;i+=4) {
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const n=((seed>>>8)/16777216-.5)*30;
    pixels.data[i]=Math.max(0,Math.min(255,209+n));
    pixels.data[i+1]=Math.max(0,Math.min(255,186+n*.84));
    pixels.data[i+2]=Math.max(0,Math.min(255,143+n*.65));
    pixels.data[i+3]=255;
  }
  ctx.putImageData(pixels,0,0);
  const texture=new THREE.CanvasTexture(canvas);
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(18,18);
  texture.colorSpace=THREE.SRGBColorSpace;
  const sandMat = new THREE.MeshStandardMaterial({map:texture,color:0xe7c8a1,roughness:1});
  const g=new THREE.PlaneGeometry(160,180,98,110);
  g.rotateX(-Math.PI/2);
  g.translate(0,0,-26);
  const p=g.getAttribute('position');
  for(let i=0;i<p.count;i++)p.setY(i,terrain(p.getX(i),p.getZ(i)));
  g.computeVertexNormals();
  const sand=new THREE.Mesh(g,sandMat);
  sand.receiveShadow=true;
  scene.add(sand);
  tracked.push(texture,g,sandMat);

  // Reuse the sand's mineral photography as diffuse grain for the buried
  // ashlar. The old untextured steps read as flat orange rectangles.
  const pale=new THREE.MeshStandardMaterial({map:texture,color:0xf3e8d5,roughness:.98});
  const aged=new THREE.MeshStandardMaterial({map:texture,color:0xb8a48d,roughness:1});
  tracked.push(pale,aged);
  const block=(w,h,d,x,y,z,mat,rotation=0)=>{
    // Minute edge wear catches grazing sun without synthetic glossy bevels.
    const bevel=Math.min(.021,w*.042,h*.13,d*.038);
    const geo=new RoundedBoxGeometry(w,h,d,3,bevel);
    const pos=geo.attributes.position, normal=geo.attributes.normal;
    const salt=x*1.7+z*.53+y*.82;
    for(let vertex=0;vertex<pos.count;vertex++){
      const px=pos.getX(vertex),py=pos.getY(vertex),pz=pos.getZ(vertex);
      const rough=Math.sin(px*21.3+py*7.4+pz*19.1+salt)*.49
        +Math.sin(pz*15.8-px*12.3+py*9.4-salt)*.36;
      const erosion=rough*.011;
      pos.setXYZ(vertex,px+normal.getX(vertex)*erosion,
        py+normal.getY(vertex)*erosion,pz+normal.getZ(vertex)*erosion);
    }
    pos.needsUpdate=true;
    geo.computeVertexNormals();
    // The sand texture repeats 18 times over the dunes, but no more than
    // ~1.3 times over an individual limestone block.
    const uv=geo.attributes.uv;
    for(let i=0;i<uv.count;i++){
      uv.setXY(i,uv.getX(i)*.071+(x+10)*.003,uv.getY(i)*.071+(z+60)*.002);
    }
    uv.needsUpdate=true;
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(x,y,z);mesh.rotation.y=rotation;
    mesh.castShadow=true;mesh.receiveShadow=true;
    scene.add(mesh);tracked.push(geo);return mesh;
  };
  // A sand-buried causeway; every stone meets the actual terrain.
  // The old rising stairs floated increasingly far above the ground.
  for(let i=0;i<18;i++) {
    const z=-5-i*1.52;
    const x=Math.sin(i*1.41)*.055;
    const w=3.34+i*.075+(i%4===0?.10:0);
    const h=.16-(i%4)*.013;
    const burial=i>10?Math.min(.085,(i-10)*.009):.014;
    block(w,h,1.63,x,terrain(x,z)+h*.5-burial,z,
      i%6===0?aged:pale,Math.sin(i*.84)*.005);
  }
  for(let i=0;i<8;i++) {
    const z=-11-i*5.5;
    const x=(i%2?1:-1)*(5.0+i*1.4);
    const h=3.5+i*.28;
    const y=terrain(x,z);
    block(.84,h,.86,x,y+h/2,z,i%3===0?aged:pale,-.09+i*.04);
    block(1.3,.19,1.28,x,y+h,z,aged);
  }
  for(const [x,z,h,r] of [[-19,-41,10,-.13],[23,-53,14,.24]]) {
    const m=block(3.6,h,3.3,x,terrain(x,z)+h*.42,z,aged,r);
    m.rotation.z=r*.32;
  }

  const skyMat=new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,
    vertexShader:'varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:[
      'precision highp float;varying vec3 vDir;',
      'void main(){',
      'vec3 d=normalize(vDir);',
      'vec3 c=mix(vec3(.91,.56,.37),vec3(.40,.62,.69),smoothstep(-.22,.84,d.y));',
      'vec3 solar=normalize(vec3(-.29,.24,-.93));',
      'float facing=max(0.,dot(d,solar));',
      'float h=pow(facing,19.);',
      'float sun=pow(facing,1400.);',
      'float veil=sin(d.x*8.3+d.z*3.4)*sin(d.z*10.1-d.y*4.8);',
      'float cloud=smoothstep(.38,.85,veil*.12+.48)*smoothstep(.02,.72,d.y);',
      'c=mix(c,c*vec3(.91,.92,.91),cloud*.17);',
      'c+=vec3(.84,.50,.26)*h*.52+vec3(1.,.89,.68)*sun*1.42;',
      'gl_FragColor=vec4(c,1.);',
      '#include <tonemapping_fragment>',
      '#include <colorspace_fragment>',
      '}'
    ].join('\n')
  });
  const skyGeo=new THREE.SphereGeometry(130,36,24);
  const sky=new THREE.Mesh(skyGeo,skyMat);
  sky.renderOrder=-100;sky.frustumCulled=false;
  scene.add(sky);
  tracked.push(skyGeo,skyMat);

  // Sparse airborne sand particles, physically situated in the desert.
  const pts=new Float32Array(120*3);
  let s=7123;
  const random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  for(let i=0;i<120;i++){
    pts[i*3]=(random()-.5)*48;
    pts[i*3+1]=-2+random()*10;
    pts[i*3+2]=-3-random()*75;
  }
  const dustGeo=new THREE.BufferGeometry();
  dustGeo.setAttribute('position',new THREE.BufferAttribute(pts,3));
  const dustMat=new THREE.PointsMaterial({color:0xffe6b9,size:.06,transparent:true,opacity:.44,depthWrite:false});
  scene.add(new THREE.Points(dustGeo,dustMat));
  tracked.push(dustGeo,dustMat);
  return sky;
}

export function createImpossiblePortal({renderer,camera,threshold}) {
  const tracked=[];
  const desert=new THREE.Scene();
  const sky=buildDesert(desert,tracked);
  const secondCamera=new THREE.PerspectiveCamera(camera.fov,camera.aspect,.07,240);
  const target=new THREE.WebGLRenderTarget(512,512,{
    depthBuffer:true,stencilBuffer:false,
    magFilter:THREE.LinearFilter,minFilter:THREE.LinearFilter,
    generateMipmaps:false
  });
  target.texture.name='Live 3D daylit desert viewed from the night';
  const windowMaterial=new THREE.ShaderMaterial({
    uniforms:{
      uDesert:{value:target.texture},
      uViewport:{value:new THREE.Vector2(1,1)}
    },
    vertexShader:'varying vec2 vPoint;void main(){vPoint=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:[
      'precision highp float;',
      'uniform sampler2D uDesert;uniform vec2 uViewport;varying vec2 vPoint;',
      'void main(){',
      'vec2 uv=clamp(gl_FragCoord.xy/uViewport,vec2(0.),vec2(1.));',
      'vec3 col=texture2D(uDesert,uv).rgb;',
      'float side=1.018-abs(vPoint.x);',
      'float roof=vPoint.y>0.?1.018-length(vPoint):100.;',
      'float edge=max(0.,min(min(side,roof),vPoint.y+2.50));',
      'col+=vec3(.035,.024,.011)*(1.-smoothstep(.005,.10,edge));',
      'float lip=smoothstep(.003,.063,edge);',
      'float buried=smoothstep(-2.48,-1.91,vPoint.y);',
      'float alpha=lip*buried;',
      'gl_FragColor=vec4(col,alpha);',
      '#include <tonemapping_fragment>',
      '#include <colorspace_fragment>',
      '}'
    ].join('\n'),
    // Fade into the actual water below the sill and let the ancient masonry
    // retain its original depth, rather than projecting an opaque rectangle.
    // It is an impossible dimensional window, not a reflection on the
    // ocean. The foreground water's depth may not erase the landscape
    // inside the arch; the geometry and feathered rim still provide its
    // physical silhouette.
    depthWrite:false,depthTest:false,side:THREE.DoubleSide,
    transparent:true,toneMapped:false,fog:false
  });
  const windowMesh=new THREE.Mesh(makeAperture(),windowMaterial);
  windowMesh.position.z=-.575;
  windowMesh.frustumCulled=false;
  windowMesh.name='Live perspective-correct opening into the impossible desert';
  windowMesh.renderOrder = .35;
  threshold.add(windowMesh);
  tracked.push(windowMesh.geometry,windowMaterial);
  const light=new THREE.PointLight(0xffbd83,1.35,7,2);
  light.position.set(0,-.6,-.38);
  threshold.add(light);

  // Full-view scene transition begins only once the camera has physically
  // advanced into the portal. The night and desert are continuously linked.
  const compositeScene=new THREE.Scene();
  const compositeCamera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);
  compositeCamera.position.z=1;
  const coverMat=new THREE.MeshBasicMaterial({
    map:target.texture,transparent:true,opacity:0,
    depthWrite:false,depthTest:false,toneMapped:false
  });
  const cover=new THREE.Mesh(new THREE.PlaneGeometry(2,2),coverMat);
  compositeScene.add(cover);
  tracked.push(cover.geometry,coverMat);
  const screen=new THREE.Vector2();
  const inverse=new THREE.Quaternion();
  const origin=new THREE.Vector3();
  let lastResolution='';
  let lastPose='';
  let frame=0;
  let blend=0;

  function renderSecondWorld(progress,software=false){
    threshold.updateWorldMatrix(true,false);
    secondCamera.position.copy(threshold.worldToLocal(origin.copy(camera.position)));
    threshold.getWorldQuaternion(inverse);
    inverse.invert();
    secondCamera.quaternion.copy(inverse).multiply(camera.quaternion);
    secondCamera.fov=camera.fov;
    secondCamera.aspect=camera.aspect;
    secondCamera.updateProjectionMatrix();
    sky.position.copy(secondCamera.position);

    // Stay in the new reality for most of Selected Worlds; fade only
    // when the visitor continues toward the studio/practice sections.
    blend=ease(.695,.805,progress)*(1-ease(.95,1.0,progress));
    coverMat.opacity=blend;
    windowMesh.visible=progress<.80;
    light.intensity=1.35*(1-ease(.75,.85,progress));
    document.documentElement.dataset.portalState=blend>.5?'inside':(progress>.28&&progress<.83?'threshold':'night');

    renderer.getDrawingBufferSize(screen);
    windowMaterial.uniforms.uViewport.value.copy(screen);
    const compact=window.innerWidth<700;
    const ratio=software?.40:compact?.62:.73;
    // Preserve exact camera aspect ratio when limiting GPU render-target size.
    // Otherwise a wide-screen desert gets distorted inside the gateway.
    const scale=Math.min(ratio,(compact?580:1120)/screen.x,900/screen.y);
    const width=Math.max(128,Math.round(screen.x*scale));
    const height=Math.max(128,Math.round(screen.y*scale));
    const resolution=width+'x'+height;
    if(resolution!==lastResolution) {
      target.setSize(width,height);
      lastResolution=resolution;
      lastPose='';
    }
    // Outside the world crossing, stop rendering the second scene when
    // neither its window nor the full-screen desert is visible.
    if(!windowMesh.visible&&blend<.002)return;
    frame++;
    const pose=[
      ...secondCamera.position.toArray(),
      ...secondCamera.quaternion.toArray(),secondCamera.aspect,secondCamera.fov
    ].map(x=>x.toFixed(3)).join(',');
    // A still camera needs no extra draw every RAF.
    if(lastPose===pose&&frame%12!==0)return;
    lastPose=pose;
    const original=renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    renderer.render(desert,secondCamera);
    renderer.setRenderTarget(original);
  }
  function composite(){
    if(blend<.002)return;
    const clear=renderer.autoClear;
    renderer.autoClear=false;
    renderer.clearDepth();
    renderer.render(compositeScene,compositeCamera);
    renderer.autoClear=clear;
  }
  return{
    update:renderSecondWorld,
    composite,
    debug:()=>({
      otherWorldObjects:desert.children.length,
      windowVisible:windowMesh.visible,
      desertResolution:[target.width,target.height],
      transitionBlend:+blend.toFixed(3),
      localCamera:secondCamera.position.toArray().map(v=>+v.toFixed(2))
    }),
    dispose(){
      threshold.remove(windowMesh,light);
      target.dispose();
      tracked.forEach(resource=>resource.dispose?.());
    }
  };
}
