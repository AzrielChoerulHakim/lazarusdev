import * as THREE from 'three';

const SKY_VERTEX = `
  varying vec3 vDirection;
  void main(){
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
const SKY_FRAGMENT = `
  precision highp float;
  varying vec3 vDirection;
  uniform float uTime;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
               mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
  }
  float fbm(vec2 x){
    float v=0.0, a=.5;
    for(int i=0;i<5;i++){v+=noise(x)*a;x=x*2.01+vec2(17.3,8.1);a*=.5;}
    return v;
  }
  void main(){
    vec3 d=normalize(vDirection);
    float h=smoothstep(-.24,.76,d.y);
    vec3 horizon=vec3(.225,.302,.308);
    vec3 mid=vec3(.050,.123,.148);
    vec3 zenith=vec3(.020,.051,.066);
    vec3 col=mix(horizon,mid,smoothstep(.0,.48,d.y));
    col=mix(col,zenith,smoothstep(.36,1.,d.y));
    vec2 uv=vec2(atan(d.z,d.x)*1.2, d.y*2.1);
    float vapor=fbm(uv*3.0+vec2(uTime*.003,0.));
    vapor += fbm(uv*6.2+vec2(uTime*.006,5.0))*.24;
    float cloud=smoothstep(.54,.80,vapor + (.13-abs(d.y)*.1));
    float warm=smoothstep(-.1,.35,d.y);
    vec3 cream=vec3(.76,.68,.54);
    vec3 rim=vec3(.50,.43,.35);
    col=mix(col,mix(rim,cream,cloud),cloud*.48*warm);
    col+=vec3(.17,.065,.039)*pow(1.-abs(d.y+.10),9.)*.35;
    float v=1.-.12*smoothstep(.4,1.,abs(d.x));
    gl_FragColor=vec4(col*v,1.0);
  }
`;
const WATER_VERTEX = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  void main(){
    vUv=uv;
    vec3 p=position;
    p.z += sin(p.x*.34+uTime*.38)*.055;
    p.z += sin(p.y*.55-uTime*.28+p.x*.22)*.036;
    vPosition=(modelMatrix*vec4(p,1.)).xyz;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
  }
`;
const WATER_FRAGMENT = `
  precision highp float;
  uniform float uTime;
  uniform vec3 uEye;
  varying vec2 vUv;
  varying vec3 vPosition;
  float wave(vec2 p){return sin(p.x*.24+sin(p.y*.13))*.5+sin(p.y*.6-p.x*.38)*.25;}
  void main(){
    vec2 p=vPosition.xz;
    float wa=wave(p+vec2(uTime*.20,-uTime*.18));
    float wb=wave(p*2.17+vec2(-uTime*.12,uTime*.3));
    float sparkle=pow(max(0.,sin(p.x*.75+wa*3.)*cos(p.y*.33+wb*3.)),15.);
    vec3 dark=vec3(.025,.107,.119);
    vec3 teal=vec3(.105,.185,.183);
    vec3 color=mix(dark,teal,.45+.23*wa+.12*wb);
    float viewDistance=length(uEye-vPosition);
    float grazing=pow(1.-abs(normalize(uEye-vPosition).y),3.);
    color+=vec3(.12,.15,.145)*grazing;
    color+=vec3(.42,.25,.13)*sparkle*.17;
    color=mix(color,vec3(.042,.099,.108),smoothstep(10.,65.,viewDistance)*.64);
    gl_FragColor=vec4(color,.96);
  }
`;
function generateCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const cx = canvas.getContext('2d');
  const circles = [
    [39,76,26],[61,58,31],[82,70,27],[52,82,32],[98,88,22]
  ];
  const im=cx.createImageData(128,128);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    let a=0;
    for(const [px,py,r] of circles){
      const distance=Math.hypot(x-px,(y-py)*1.25);
      a=Math.max(a,Math.max(0,1-distance/r));
    }
    const i=(y*128+x)*4;
    im.data[i]=224;
    im.data[i+1]=212;
    im.data[i+2]=189;
    im.data[i+3]=Math.round(Math.pow(a,1.5)*110);
  }
  cx.putImageData(im,0,0);
  const tx=new THREE.CanvasTexture(canvas);
  tx.colorSpace=THREE.SRGBColorSpace;
  return tx;
}

export function enhanceEnvironment(scene, { sea }) {
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: SKY_VERTEX,
    fragmentShader: SKY_FRAGMENT,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(100, 40, 24), skyMaterial);
  sky.frustumCulled = false;
  sky.renderOrder = -20;
  scene.add(sky);

  if (sea) sea.visible = false;
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: {value: 0}, uEye: {value: new THREE.Vector3()} },
    vertexShader: WATER_VERTEX,
    fragmentShader: WATER_FRAGMENT,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(190, 190, 70, 70), waterMaterial);
  water.rotation.x=-Math.PI/2;
  water.position.y=-3.245;
  water.receiveShadow=true;
  scene.add(water);

  const vaporTexture=generateCloudTexture();
  const haze = new THREE.Group();
  for(let i=0;i<15;i++){
    const mat=new THREE.SpriteMaterial({
      map:vaporTexture,
      color:i%3===0?0xd9c9aa:0xa9b3aa,
      transparent:true, opacity:.28+(i%4)*.08,
      depthWrite:false, fog:true,
    });
    const sprite=new THREE.Sprite(mat);
    sprite.position.set(-26+i*3.9, -1.4+Math.sin(i*1.8)*1.55, -30-(i%4)*5.2);
    const s=6+(i%5)*2.1;
    sprite.scale.set(s,s*.65,1);
    haze.add(sprite);
  }
  scene.add(haze);
  let time=0;
  return {
    update(dt, camera, animate) {
      if(animate)time+=dt;
      skyMaterial.uniforms.uTime.value=time;
      waterMaterial.uniforms.uTime.value=time;
      waterMaterial.uniforms.uEye.value.copy(camera.position);
      haze.position.x=Math.sin(time*.026)*.25;
    },
    dispose() {
      scene.remove(sky,water,haze);
      sky.geometry.dispose();
      skyMaterial.dispose();
      water.geometry.dispose();
      waterMaterial.dispose();
      haze.traverse(obj => {if(obj.material)obj.material.dispose();});
      vaporTexture.dispose();
    },
  };
}
