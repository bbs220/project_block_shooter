import * as THREE from "three";
import { extend, useFrame, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { useEffect, useRef } from "react";

declare module "@react-three/fiber" {
  interface ThreeElements {
    muzzleFlashMaterial: ThreeElement<typeof MuzzleFlashMaterial>;
  }
}

// define the custom shader material with an opacity uniform
const MuzzleFlashMaterial = shaderMaterial(
  { uColor: new THREE.Color("#ffaa00"), uOpacity: 0 },
  // vertex shader passes uv coordinates
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // fragment shader calculates the starburst shape and handles opacity
  `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float angle = atan(center.y, center.x);

    // calculate radius with irregular trigonometric waves for jagged spikes
    float radius = 0.15 + 0.1 * sin(angle * 7.0) + 0.1 * cos(angle * 4.0);

    // create soft edges and multiply by master opacity
    float alpha = smoothstep(radius, radius - 0.1, dist) * uOpacity;
    float core = smoothstep(radius * 0.3, 0.0, dist);

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const onShoot = () => {
      if (materialRef.current && meshRef.current) {
        // instantly show the flash
        materialRef.current.uOpacity = 1;

        // randomize z for rolling and x for pitching to avoid repeating patterns
        meshRef.current.rotation.z = Math.random() * Math.PI * 2;
        meshRef.current.rotation.x = (Math.random() - 0.5) * 0.5;

        // apply slight random scaling
        const s = 0.8 + Math.random() * 0.5;
        meshRef.current.scale.set(s, s, s);
      }
    };

    window.addEventListener("weapon-fired", onShoot);
    return () => window.removeEventListener("weapon-fired", onShoot);
  }, []);

  useFrame(() => {
    if (materialRef.current && materialRef.current.uOpacity > 0) {
      // rapidly fade the flash back out
      materialRef.current.uOpacity = THREE.MathUtils.lerp(
        materialRef.current.uOpacity,
        0,
        0.3,
      );
    }
  });

  return (
    // wrap the geometry and material inside a mesh tag
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[1, 1]} />
      <muzzleFlashMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export default MuzzleFlash;
