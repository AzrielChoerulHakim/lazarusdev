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

  float wave(vec2 p) {
    return sin(p.x*.27+sin(p.y*.16))*.5
         + sin(p.y*.63-p.x*.38)*.24
         + sin(p.x*.92+p.y*.52)*.09;
  }
  void main() {
    vec2 p = vPosition.xz;
    vec2 wind = vec2(uTime*.20,-uTime*.17);
    float swell = wave(p+wind);
    float ripples = wave(p*2.1-wind*.7);
    vec3 view = normalize(uEye-vPosition);

    // Analytic multi-scale wave gradients form a physically plausible normal
    // for grazing-angle reflection without a heavy reflection render pass.
    float nx = .055*cos(p.x*.74+uTime*.34)
             + .023*cos(p.x*1.9-p.y*.81-uTime*.48);
    float nz = .051*sin(p.y*.83-uTime*.23)
             + .019*sin(p.x*.75+p.y*1.6+uTime*.29);
    vec3 normal = normalize(vec3(-nx,1.,-nz));
    float fresnel = pow(1.-clamp(dot(normal,view),0.,1.),3.0);

    vec3 depthColor = vec3(.018,.081,.093);
    vec3 surfaceColor = vec3(.080,.144,.145);
    vec3 surface = mix(depthColor,surfaceColor,
        clamp(.53+swell*.19+ripples*.065,0.,1.));
    // Real sea reflects horizon illumination at grazing angles.
    vec3 skyReflection = vec3(.30,.338,.316);
    surface = mix(surface,skyReflection,fresnel*.47);

    // The principal carved gate enters the water at two distinct feet.
    // A broad, soft occlusion footprint and barely visible lapping rings
    // connect it to the surface; the water shader cannot receive shadow maps.
    vec2 footLeft = p - vec2(-4.83,-7.35);
    vec2 footRight = p - vec2(-1.27,-7.35);
    float contactLeft = exp(-dot(footLeft * vec2(1.55,1.05), footLeft * vec2(1.55,1.05)));
    float contactRight = exp(-dot(footRight * vec2(1.55,1.05), footRight * vec2(1.55,1.05)));
    float stoneContact = max(contactLeft,contactRight);
    surface *= 1.0 - .25 * stoneContact;
    float nearFoot = min(length(footLeft),length(footRight));
    float waterLap = sin(nearFoot * 11.5 - uTime * .78)
                   * exp(-nearFoot * 1.32) * .010;
    surface += vec3(.71,.77,.72) * waterLap;

    // Match the water's sun glints to the upper-left sculptural key light.
    vec3 sunDirection = normalize(vec3(-.32,.62,.71));
    vec3 reflectedSun = reflect(-sunDirection,normal);
    float spec = pow(max(0.,dot(reflectedSun,view)),40.);
    surface += vec3(.49,.35,.22)*spec*.24;
    float glitter = pow(max(0.,sin(p.x*.69+uTime*.31)
                   * cos(p.y*1.22-uTime*.28)),19.);
    surface += vec3(.18,.15,.11)*glitter*.065;

    float dist = length(uEye-vPosition);
    // Distant water merges toward photographic horizon rather than ending
    // in a hard teal seam under the photographed sky.
    float horizonHaze = smoothstep(16.,85.,dist);
    vec3 haze = vec3(.235,.294,.293);
    surface = mix(surface,haze,horizonHaze*.75);
    gl_FragColor = vec4(surface,.975);
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
      transparent:true, opacity:.16+(i%4)*.055,
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
    usePhotographicSky(enabled) {
      sky.visible = !enabled;
    },
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
