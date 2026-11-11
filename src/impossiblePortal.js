import * as THREE from 'three';

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
  const dunes = Math.sin(x*.095 + z*.052)*.52
    + Math.cos(z*.084 - x*.049)*.62
    + Math.sin(x*.31 + Math.cos(z*.11))* .12;
  const passage = ease(2,10,Math.abs(x));
  return -3.16 + dunes * (.26 + passage*.65);
}

function buildDesert(scene, tracked) {
  scene.background = new THREE.Color(0xe2b390);
  scene.fog = new THREE.FogExp2(0xe0b08b, .009);
  scene.add(new THREE.HemisphereLight(0xffe5c0, 0x825c49, 1.85));
  const sun = new THREE.DirectionalLight(0xffd5a0, 3.35);
  sun.position.set(-18, 29, 13);
  sun.target.position.set(0, -2, -16);
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

  const pale=new THREE.MeshStandardMaterial({color:0xdab591,roughness:.96});
  const aged=new THREE.MeshStandardMaterial({color:0xa17f66,roughness:1});
  tracked.push(pale,aged);
  const block=(w,h,d,x,y,z,mat,rotation=0)=>{
    const geo=new THREE.BoxGeometry(w,h,d);
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(x,y,z);mesh.rotation.y=rotation;
    mesh.castShadow=true;mesh.receiveShadow=true;
    scene.add(mesh);tracked.push(geo);return mesh;
  };
  // Sand-buried limestone stairs end somewhere beyond the horizon.
  for(let i=0;i<18;i++) {
    const z=-5-i*1.5;
    block(3.6+i*.11,.14,1.65,0,terrain(0,z)+.12+i*.065,z,
      i%5===0?aged:pale);
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
      'float h=pow(max(0.,dot(d,normalize(vec3(.25,.26,-1.)))),18.);',
      'float sun=pow(max(0.,dot(d,normalize(vec3(.25,.26,-1.)))),950.);',
      'c+=vec3(.94,.48,.18)*h*.72+vec3(1.,.88,.59)*sun*1.6;',
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
      'col+=vec3(.13,.063,.02)*(1.-smoothstep(.005,.11,edge));',
      'gl_FragColor=vec4(col,1.);',
      '#include <tonemapping_fragment>',
      '#include <colorspace_fragment>',
      '}'
    ].join('\n'),
    depthWrite:true,depthTest:true,side:THREE.DoubleSide,
    transparent:false,toneMapped:false,fog:false
  });
  const windowMesh=new THREE.Mesh(makeAperture(),windowMaterial);
  windowMesh.position.z=-.575;
  windowMesh.frustumCulled=false;
  windowMesh.name='Live perspective-correct opening into the impossible desert';
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

    blend=ease(.695,.805,progress)*(1-ease(.90,.995,progress));
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
