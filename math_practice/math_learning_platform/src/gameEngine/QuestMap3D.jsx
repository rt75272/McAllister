import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Center, Text, Float } from '@react-three/drei';
import { units } from '../data/questData.js';
import * as THREE from 'three';

// 3D Unit Island Figurine
function UnitIslandNode({ id, name, topic, icon, color, position, isSelected, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Soft rotation and float animation
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(t * 1.5 + id) * 0.12;
      meshRef.current.rotation.y = t * 0.25;
    }
  });

  return (
    <group position={position}>
      {/* Interactive Node Mesh */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Floating Ring Base */}
        <cylinderGeometry args={[1.2, 1.4, 0.4, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          emissive={hovered || isSelected ? color : '#000000'}
          emissiveIntensity={hovered ? 0.6 : isSelected ? 0.4 : 0}
        />

        {/* Central Core Sphere */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.1}
            metalness={0.9}
            emissive={hovered ? '#cbd5e1' : '#000000'}
          />
        </mesh>
      </mesh>

      {/* Standee Hover Text Info */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={[0, 1.8, 0]}>
          <Text
            color="#ffffff"
            fontSize={0.26}
            maxWidth={4}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/quicksand/v30/6xKtdSZaM9iE8KbpRA_hK1QN.woff" // Falls back to standard if offline
          >
            {`UNIT ${id}\n${name}`}
          </Text>
        </group>
      </Float>

      {/* Flat Platform Ring */}
      <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.8, 32]} />
        <meshBasicMaterial color={hovered ? '#ffffff' : color} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Connector curves between islands
function ConnectionLine({ start, end, active }) {
  const points = [];
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  
  // Create an arched bezier curve
  const midPoint = new THREE.Vector3()
    .addVectors(startVec, endVec)
    .multiplyScalar(0.5);
  midPoint.y += 1.5; // Arched height

  const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
  const pathPoints = curve.getPoints(50);

  return (
    <line>
      <bufferGeometry attach="geometry">
        <float32BufferAttribute
          attach="attributes-position"
          args={[new Float32Array(pathPoints.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        attach="material"
        color={active ? '#10b981' : '#475569'}
        linewidth={active ? 3 : 1}
        transparent
        opacity={active ? 0.8 : 0.4}
      />
    </line>
  );
}

// Starfield nebula map wrapper
export default function QuestMap3D({ selectedUnit, setSelectedUnit, setSelectedTopic }) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 8, 10], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#020617']} />
        
        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 15, 10]} intensity={1.5} decay={2} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        
        {/* Distant Twinkling Stars */}
        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0.5} fade speed={1.5} />

        {/* 3D Grid Floor Terrain */}
        <gridHelper args={[30, 30, '#1e293b', '#0f172a']} position={[0, -0.4, 0]} opacity={0.3} transparent />

        {/* Dynamic Curved Pathway Connections */}
        {units.slice(0, -1).map((unit, index) => {
          const nextUnit = units[index + 1];
          return (
            <ConnectionLine
              key={`conn-${unit.id}`}
              start={unit.position}
              end={nextUnit.position}
              active={unit.id < 3} // Simulate completed status
            />
          );
        })}

        {/* Interactive Island Nodes */}
        <Center>
          {units.map((unit) => (
            <UnitIslandNode
              key={unit.id}
              id={unit.id}
              name={unit.name}
              topic={unit.topic}
              icon={unit.icon}
              color={unit.color}
              position={unit.position}
              isSelected={selectedUnit?.id === unit.id}
              onClick={() => {
                setSelectedUnit(unit);
                setSelectedTopic(null); // Clear active minigame on parent zoom
              }}
            />
          ))}
        </Center>

        {/* Orbital Navigation Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={4}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2.1} // Constrain camera so it doesn't go below horizon
          makeDefault
        />
      </Canvas>

      {/* In-Canvas Instruction Overlay */}
      <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 text-xs px-3 py-2 rounded-xl backdrop-blur-md pointer-events-none select-none">
        <p className="font-bold text-slate-300">🎮 3D Navigation Guide</p>
        <p className="text-slate-400 mt-0.5">• Left-Click & Drag to rotate board</p>
        <p className="text-slate-400">• Scroll wheel to zoom in/out</p>
        <p className="text-slate-400">• Click on any floating island to select</p>
      </div>
    </div>
  );
}
