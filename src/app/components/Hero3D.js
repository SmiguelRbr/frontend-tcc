'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// 1. Adicionamos a variável 'color' aqui. 
// O ='#10b981' significa: "se ninguém me der uma cor, eu uso o verde por padrão".
function WireframeObject({ color = '#10b981' }) {
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
      {/* 2. Trocamos o código HEX fixo pela nossa variável 'color' */}
      <meshBasicMaterial color={color} wireframe={true} transparent opacity={0.3} />
    </mesh>
  );
}

// 3. O componente principal também precisa receber a cor para passar para o objeto
export default function Hero3D({ color }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: 'transparent' }}>
      {/* Passamos a cor para o objeto lá dentro */}
      <WireframeObject color={color} />
    </Canvas>
  );
}