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
        // Thin, optically quiet mineral haze instead of a solid cyan
        // sci-fi screen. The landscape remains visible through the arch.
        vec3 cool=vec3(.19,.23,.22), limestone=vec3(.49,.45,.38);
        vec3 color=mix(cool,limestone,.24+flow*.12+shimmer*.06);
        float crossing=smoothstep(.45,.69,uTravel)*(1.-smoothstep(.77,.87,uTravel));
        float alpha=(.018+.052*core+.042*flow+.015*shimmer) + crossing*.08;
        alpha*=smoothstep(0.,.17,st.y);
        gl_FragColor=vec4(color,alpha);
      }
    `,
  });
  membrane.material = material;
  membrane.renderOrder = 1;
  let time=0;
  return {
    update(dt, progress, animate) {
      if(animate)time+=dt;
      material.uniforms.uTime.value=time;
      material.uniforms.uTravel.value=progress;

    },
    dispose() {
      material.dispose();

    },
  };
}
