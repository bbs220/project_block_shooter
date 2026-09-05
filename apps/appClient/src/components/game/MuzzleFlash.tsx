type MuzzleFlashProps = {
  position: [number, number, number];
};

const MuzzleFlash = ({ position }: MuzzleFlashProps) => {
  return (
    <mesh position={position}>
      <planeGeometry args={[0.8, 0.8]} />
      <meshNormalMaterial />
    </mesh>
  );
};

export default MuzzleFlash;
