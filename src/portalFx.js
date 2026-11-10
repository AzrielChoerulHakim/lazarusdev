import * as THREE from 'three';

// A translucent, living threshold suspended inside the masonry.
// Geometry remains an actual 3D portal: the shader is a local surface treatment.
export function attachPortalVeil(portal, options = {}) {
  const membrane = portal.getObjectByName('Portal light volume');
  if (!membrane) return null;
  membrane.material.dispose();
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: {value: 0},
      uTravel: {value: 0},
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    vertexShader: `
      varying vec2 vLocal;
      void main() {
        vLocal = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vLocal;
      uniform float uTime;
      uniform float uTravel;
      float noise(vec2 p) {
        vec2 i=floor(p), f=fract(p);
        f=f*f*(3.-2.*f);
        float a=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5453);
        float b=fract(sin(dot(i+vec2(1.,0.),vec2(127.1,311.7)))*43758.5453);
        float c=fract(sin(dot(i+vec2(0.,1.),vec2(127.1,311.7)))*43758.5453);
        float d=fract(sin(dot(i+vec2(1.,1.),vec2(127.1,311.7)))*43758.5453);
        return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
      }
      void main() {
        vec2 st=vec2(vLocal.x*.57+.5,(vLocal.y+2.5)/3.55);
        float flow=noise(st*5.+vec2(uTime*.018,-uTime*.025));
        float shimmer=sin(st.y*20.-uTime*.65+sin(st.x*11.)*2.)*.5+.5;
        float core=1.-smoothstep(.02,.85,abs(st.x-.5));
        vec3 sea=vec3(.11,.29,.28), sand=vec3(.58,.50,.36);
        vec3 color=mix(sea,sand,.20+flow*.16+shimmer*.13);
        float threshold=smoothstep(.15,.42,uTravel)*(1.-smoothstep(.57,.83,uTravel));
        float alpha=(.07+.15*core+.13*flow+.06*shimmer) + threshold*.19;
        alpha*=smoothstep(0.,.12,st.y);
        gl_FragColor=vec4(color,alpha);
      }
    `,
  });
  membrane.material = material;
  membrane.renderOrder = 1;
  const trim = new THREE.Group();
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xbacbb6, transparent: true, opacity: .14, depthWrite: false });
  const top = new THREE.Mesh(new THREE.TorusGeometry(1.09, .015, 4, 46, Math.PI), lineMaterial);
  top.position.z = -.03;
  trim.add(top);
  for (const x of [-1.09,1.09]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.015,2.5,.015),lineMaterial);
    leg.position.set(x,-1.25,-.03);
    trim.add(leg);
  }
  portal.add(trim);
  let time=0;
  return {
    update(dt, progress, animate) {
      if(animate)time+=dt;
      material.uniforms.uTime.value=time;
      material.uniforms.uTravel.value=progress;
      lineMaterial.opacity=.10+.11*Math.sin(Math.PI*Math.min(1,progress));
    },
    dispose() {
      material.dispose();
      lineMaterial.dispose();
      trim.traverse(object=>object.geometry?.dispose());
    },
  };
}
