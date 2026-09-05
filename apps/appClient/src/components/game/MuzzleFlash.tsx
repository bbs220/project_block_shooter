// import dependencies for shader and rendering
import * as THREE from "three";
import { extend, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

declare module "@react-three/fiber" {
  interface ThreeElements {
    muzzleFlashMaterial: ThreeElement<typeof MuzzleFlashMaterial>;
  }
}

// define the custom shader material
const MuzzleFlashMaterial = shaderMaterial(
  { uColor: new THREE.Color("#ffaa00") },
  // vertex shader passes uv coordinates
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // fragment shader calculates the starburst shape
  `
  varying vec2 vUv;
  uniform vec3 uColor;

  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float angle = atan(center.y, center.x);

    // calculate radius with trigonometric waves for petals
    float radius = 0.2 + 0.15 * cos(angle * 5.0);

    // create soft edges and bright inner core
    float alpha = smoothstep(radius, radius - 0.15, dist);
    float core = smoothstep(radius * 0.4, 0.0, dist);

    // blend colors based on distance from center
    vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 1.0), core);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
  `,
);

// register material with react three fiber
extend({ MuzzleFlashMaterial });

type MuzzleFlashProps = {
  position: [number, number, number];
};

const MuzzleFlash = ({ position }: MuzzleFlashProps) => {
  return (
    <mesh position={position}>
      <planeGeometry args={[0.8, 0.8]} />
      <muzzleFlashMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export default MuzzleFlash;
