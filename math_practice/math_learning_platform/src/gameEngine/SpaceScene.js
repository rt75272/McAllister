/**
 * 3D Space Flight Exploration and Planet Landing Engine.
 *
 * Implements real-time spaceship flight with WASD steering, particle trails,
 * orbiting curriculum planets, assessment moons, and landing sequence interpolations.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Trail } from '@react-three/drei';
import * as THREE from 'three';

// Low-poly 10 curriculum planets with positions and details.
const planetConfigs = [
  { id: 1, name: "Sky Garden", color: "#ec4899", size: 1.1, pos: [-8, 0, -5], icon: "🌸", moon: "BOY Star 360" },
  { id: 2, name: "Gorilla Nebula", color: "#a855f7", size: 1.3, pos: [-5, 0, -8], icon: "🦍" },
  { id: 3, name: "Bathhouse Battle", color: "#3b82f6", size: 1.0, pos: [0, 0, -9], icon: "♨️" },
  { id: 4, name: "Tenting Trouble", color: "#06b6d4", size: 1.2, pos: [5, 0, -8], icon: "⛺" },
  { id: 5, name: "Construction Canyon", color: "#14b8a6", size: 1.1, pos: [8, 0, -5], icon: "🏗️", moon: "MOY Star 360" },
  { id: 6, name: "Slo-Mo Valley", color: "#10b981", size: 1.1, pos: [9, 0, 0], icon: "⏳" },
  { id: 7, name: "Dumbo Beat", color: "#84cc16", size: 1.2, pos: [7, 0, 5], icon: "🐘" },
  { id: 8, name: "Djinn's Revenge", color: "#eab308", size: 1.3, pos: [2, 0, 8], icon: "🧞" },
  { id: 9, name: "Safari Park", color: "#f97316", size: 1.0, pos: [-4, 0, 8], icon: "🦁" },
  { id: 10, name: "The Mothership", color: "#ef4444", size: 1.4, pos: [-8, 0, 3], icon: "🛸", moon: "EOY Star 360" }
];

function useKeyboardControls() {
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeys((prev) => ({ ...prev, [e.key]: true }));
      }
    };
    const handleKeyUp = (e) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeys((prev) => ({ ...prev, [e.key]: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}

// Interactive Planet + Orbiting Assessment Moon.
function SpacePlanetWithMoon({ id, index, name, color, size, pos, icon, landingTarget, setLandingTarget }) {
  const planetMeshRef = useRef();
  const moonGroupRef = useRef();
  const moonMeshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [moonHovered, setMoonHovered] = useState(false);

  useFrame((state) => {
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15 + id;
    }
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y = state.clock.getElapsedTime() * 0.4 + id;
    }
    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y = -state.clock.getElapsedTime() * 0.2;
    }
  });

  const handlePlanetClick = (e) => {
    e.stopPropagation();
    if (landingTarget) return;
    setLandingTarget({
      type: 'planet',
      id: id,
      pos: new THREE.Vector3(...pos)
    });
  };

  const handleMoonClick = (e) => {
    e.stopPropagation();
    if (landingTarget) return;

    const moonGlobalPos = new THREE.Vector3();
    if (moonMeshRef.current) {
      moonMeshRef.current.getWorldPosition(moonGlobalPos);
    } else {
      moonGlobalPos.set(pos[0] + 2, pos[1] + 1, pos[2] - 2);
    }

    setLandingTarget({
      type: 'moon',
      id: id,
      pos: moonGlobalPos
    });
  };

  // Determine if this planet should render an orbiting assessment moon
  let moonLabel = "";
  if (index === 0) moonLabel = "BOY Star 360";
  if (index === 4) moonLabel = "MOY Star 360";
  if (index === 9) moonLabel = "EOY Star 360";

  return (
    <group position={pos}>
      {/* 1. Low-Poly Planet Body (local position [0,0,0] relative to parent group) */}
      <mesh
        ref={planetMeshRef}
        onClick={handlePlanetClick}
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
        <dodecahedronGeometry args={[size, 1]} />
        <meshStandardMaterial
          color={color}
          roughness={0.75}
          metalness={0.1}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.35 : 0}
          flatShading={true}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size + 0.15, size + 0.2, 16]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.5 : 0.15} side={THREE.DoubleSide} />
      </mesh>

      <Text
        position={[0, size + 0.8, 0]}
        color="#e0e0ed"
        fontSize={0.22}
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        {`${icon} ${name}`}
      </Text>

      {/* 2. Orbiting Assessment Moon with scale={[0.3,0.3,0.3]} and offset [2, 1, -2] */}
      {moonLabel && (
        <group ref={moonGroupRef}>
          <group position={[2, 1, -2]}>
            <mesh
              ref={moonMeshRef}
              scale={[0.3, 0.3, 0.3]}
              onClick={handleMoonClick}
              onPointerDown={handleMoonClick}
              onPointerOver={(e) => {
                e.stopPropagation();
                setMoonHovered(true);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setMoonHovered(false);
                document.body.style.cursor = 'auto';
              }}
            >
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial
                color="#facc15"
                roughness={0.8}
                metalness={0.3}
                emissive={moonHovered ? '#fef08a' : '#222200'}
                emissiveIntensity={moonHovered ? 0.7 : 0.2}
                flatShading={true}
              />
            </mesh>

            <Text
              position={[0, 0.55, 0]}
              color="#facc15"
              fontSize={0.16}
              fontWeight="bold"
              anchorX="center"
              anchorY="middle"
            >
              {`🌙 ${moonLabel}`}
            </Text>
          </group>
        </group>
      )}
    </group>
  );
}

// Low-Poly Player Spaceship with WASD flight + Landing Interpolation lerps
function SpaceShipConsole({ landingTarget, onLandingComplete }) {
  const shipRef = useRef();
  const keys = useKeyboardControls();
  const { camera } = useThree();

  const speed = 5.5;
  const rotSpeed = 3.5;
  const velocity = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!shipRef.current) return;

    const frameDelta = Math.min(delta, 0.1);

    // LANDING ANIMATION MECHANIC LERP
    if (landingTarget) {
      const shipPos = shipRef.current.position;
      const targetPos = landingTarget.pos.clone();
      
      if (landingTarget.type === 'planet') {
        targetPos.y += 0.4; // Hover slightly above surface
      }

      const dist = shipPos.distanceTo(targetPos);

      if (dist > 0.05) {
        shipPos.lerp(targetPos, 0.05);
        
        const lookDir = targetPos.clone().sub(shipPos).normalize();
        const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(shipPos, targetPos, new THREE.Vector3(0, 1, 0))
        );
        shipRef.current.quaternion.slerp(targetQuaternion, 0.08);

        const camTarget = targetPos.clone().add(new THREE.Vector3(0, 1.5, 3));
        camera.position.lerp(camTarget, 0.04);
        camera.lookAt(targetPos);
      } else {
        onLandingComplete(landingTarget);
      }
      return;
    }

    // REGULAR WASD STEERING
    let moveForward = keys.w || keys.ArrowUp;
    let moveBackward = keys.s || keys.ArrowDown;
    let rotateLeft = keys.a || keys.ArrowLeft;
    let rotateRight = keys.d || keys.ArrowRight;

    if (rotateLeft) shipRef.current.rotation.y += rotSpeed * frameDelta;
    if (rotateRight) shipRef.current.rotation.y -= rotSpeed * frameDelta;

    const forwardDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(shipRef.current.quaternion);
    
    if (moveForward) {
      velocity.current.copy(forwardDirection).multiplyScalar(speed * frameDelta);
    } else if (moveBackward) {
      velocity.current.copy(forwardDirection).multiplyScalar(-speed * frameDelta * 0.6);
    } else {
      velocity.current.set(0, 0, 0);
    }

    shipRef.current.position.add(velocity.current);

    const targetCamOffset = new THREE.Vector3(0, 4, 7).applyQuaternion(shipRef.current.quaternion);
    const desiredCamPos = shipRef.current.position.clone().add(targetCamOffset);
    camera.position.lerp(desiredCamPos, 0.08);
    camera.lookAt(shipRef.current.position);
  });

  return (
    <group ref={shipRef} position={[0, 0, 10]}>
      <Trail width={0.35} length={6} color="#06b6d4" attenuation={(t) => t * t}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.26, 1.1, 5]} />
          <meshStandardMaterial color="#ffffff" flatShading={true} roughness={0.4} />
        </mesh>
      </Trail>
      <mesh position={[0, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.08, 0.2, 4]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </group>
  );
}

// Low-spec system optimizer
function ChromebookOptimizer() {
  const { gl } = useThree();
  useEffect(() => {
    gl.shadowMap.enabled = false;
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, [gl]);
  return null;
}

/**
 * Main 3D Space Scene Navigation Canvas
 */
export default function SpaceScene({ onSelectPlanet, onSelectMoon }) {
  const [landingTarget, setLandingTarget] = useState(null);

  const handleLandingComplete = (target) => {
    setLandingTarget(null);
    if (target.type === 'planet') {
      onSelectPlanet(target.id);
    } else if (target.type === 'moon') {
      onSelectMoon(target.id);
    }
  };

  return (
    <div className="w-full h-full relative bg-[#020409]">
      <Canvas
        camera={{ position: [0, 8, 14], fov: 45 }}
        gl={{ antialias: false, alpha: false }}
      >
        <ChromebookOptimizer />

        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 10, 5]} intensity={1.1} />

        <Stars radius={100} depth={40} count={1500} factor={4} saturation={0.2} fade speed={1.2} />

        <gridHelper args={[24, 24, '#1e293b', '#0f172a']} position={[0, -0.15, 0]} opacity={0.15} transparent />

        {planetConfigs.map((planet, index) => (
          <SpacePlanetWithMoon
            key={planet.id}
            id={planet.id}
            index={index}
            name={planet.name}
            color={planet.color}
            size={planet.size}
            pos={planet.pos}
            icon={planet.icon}
            landingTarget={landingTarget}
            setLandingTarget={setLandingTarget}
          />
        ))}

        <SpaceShipConsole
          landingTarget={landingTarget}
          onLandingComplete={handleLandingComplete}
        />
      </Canvas>

      {/* Control instructions overlay */}
      <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md pointer-events-none select-none max-w-[240px] text-slate-300 z-10">
        <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
          🚀 PILOT FLIGHT DASHBOARD
        </h4>
        <div className="text-[9px] text-slate-400 mt-2 space-y-1">
          <p><span className="font-bold text-indigo-400">W / Arrow Up</span>: Accelerate Ship</p>
          <p><span className="font-bold text-indigo-400">A / D / Keys</span>: Steer Vessel</p>
          <p className="pt-1.5 border-t border-slate-800/80 mt-1">
            Click on any **Planet** or orbiting **Assessment Moon** to initiate full landing protocols!
          </p>
        </div>
      </div>

      {landingTarget && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-indigo-950/90 border border-indigo-500/80 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-2xl backdrop-blur-md animate-pulse tracking-wide z-10">
          🛬 Autopilot initialized on {landingTarget.type} {landingTarget.id}. Landing ship...
        </div>
      )}
    </div>
  );
}
