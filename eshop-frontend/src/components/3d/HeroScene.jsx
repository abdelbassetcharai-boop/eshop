import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, ContactShadows } from '@react-three/drei';
import { useTheme } from '../../context/ThemeContext';

// مكون صندوق منتج متحرك
const ProductBox = ({ position, rotationSpeed, scale, color }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * rotationSpeed;
    meshRef.current.rotation.x = time * rotationSpeed * 0.5;

    // حركة طفيفة للأعلى والأسفل
    meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh
        ref={meshRef}
        position={position}
        scale={hovered ? scale * 1.1 : scale}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={hovered ? color : color}
          transparent
          opacity={0.9}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

// مكون دائرة متحركة تمثل حركة التجارة
const CommerceRing = ({ position, rotation, scale, color }) => {
  const ringRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ringRef.current.rotation.x = rotation[0] + time * 0.1;
    ringRef.current.rotation.y = rotation[1] + time * 0.15;
    ringRef.current.rotation.z = rotation[2] + time * 0.05;
  });

  return (
    <mesh ref={ringRef} position={position} scale={scale}>
      <torusGeometry args={[2, 0.03, 16, 100]} />
      <meshStandardMaterial color={color} transparent opacity={0.4} roughness={0.1} metalness={0.7} />
    </mesh>
  );
};

// مكون نجمة تمثل التقييمات
const RatingStar = ({ position, size }) => {
  const starRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    starRef.current.rotation.z = time * 0.5;
    starRef.current.position.y = position[1] + Math.sin(time * 3) * 0.2;
  });

  return (
    <mesh ref={starRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.5} />
    </mesh>
  );
};

const HeroScene = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px]">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        {/* الإضاءة */}
        <ambientLight intensity={isDark ? 0.6 : 0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color={isDark ? "#a5b4fc" : "#ffffff"} />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#f97316" />
        <pointLight position={[0, 3, 3]} intensity={0.5} color="#4f46e5" />

        {/* البيئة المحيطة */}
        <Environment preset={isDark ? "night" : "city"} />

        {/* مجموعة العناصر الرئيسية */}
        <group position={[0, 0, 0]}>
          {/* صناديق المنتجات */}
          <ProductBox position={[-1.5, 0.5, 0]} rotationSpeed={0.3} scale={0.8} color={isDark ? "#6366f1" : "#4f46e5"} />
          <ProductBox position={[1.5, -0.5, 0]} rotationSpeed={-0.4} scale={0.6} color={isDark ? "#f97316" : "#ea580c"} />
          <ProductBox position={[0, 1, -1]} rotationSpeed={0.5} scale={0.5} color={isDark ? "#10b981" : "#059669"} />
          <ProductBox position={[0, -1, 1]} rotationSpeed={-0.6} scale={0.7} color={isDark ? "#8b5cf6" : "#7c3aed"} />

          {/* حلقات التجارة */}
          <CommerceRing position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]} scale={1} color={isDark ? "#f97316" : "#ea580c"} />
          <CommerceRing position={[0, 0, 0]} rotation={[0, Math.PI / 4, Math.PI / 6]} scale={1.3} color={isDark ? "#818cf8" : "#4f46e5"} />
          <CommerceRing position={[0, 0, 0]} rotation={[Math.PI / 6, Math.PI / 3, 0]} scale={1.6} color={isDark ? "#10b981" : "#059669"} />

          {/* نجوم التقييم */}
          <RatingStar position={[-2, 2, 1]} size={0.1} />
          <RatingStar position={[2, -2, -1]} size={0.08} />
          <RatingStar position={[2.5, 1.5, 0.5]} size={0.06} />
          <RatingStar position={[-2.5, -1, 1]} size={0.07} />
        </group>

        {/* ظلال تلامسية */}
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={12} blur={2} far={5} />

        {/* تحكم الماوس */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default HeroScene;