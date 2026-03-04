'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Componente do objeto a girar
function WireframeObject() {
  const meshRef = useRef();

  // Faz o objeto girar lentamente em todos os eixos
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={meshRef} scale={1.8}>
      {/* Um Icosaedro é uma forma geométrica super moderna */}
      <icosahedronGeometry args={[1, 1]} />
      {/* wireframe=true deixa apenas as linhas, super profissional */}
      <meshBasicMaterial color="#10b981" wireframe={true} transparent opacity={0.3} />
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: 'transparent' }}>
      <WireframeObject />
    </Canvas>
  );
}