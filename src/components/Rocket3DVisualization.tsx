
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Cone, Sky, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface SimulationData {
  time: number;
  altitude: number;
  velocity: number;
  acceleration: number;
  horizontalPosition: number;
  horizontalVelocity: number;
}

interface Rocket3DProps {
  currentData: SimulationData;
  isSimulating: boolean;
}

const Rocket3D = ({ currentData, isSimulating }: Rocket3DProps) => {
  const rocketRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (rocketRef.current) {
      // Position rocket based on simulation data
      rocketRef.current.position.x = currentData.horizontalPosition / 50; // Scale down for visualization
      rocketRef.current.position.y = currentData.altitude / 50; // Scale down for visualization
      rocketRef.current.position.z = 0;
      
      // Add slight rotation based on velocity for realism
      rocketRef.current.rotation.z = currentData.horizontalVelocity * 0.01;
    }

    if (flameRef.current) {
      // Animate flame during burn time
      if (isSimulating && currentData.time < 2) {
        flameRef.current.visible = true;
        flameRef.current.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.3;
      } else {
        flameRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={rocketRef}>
      {/* Nose Cone */}
      <Cone
        args={[0.15, 0.4, 8]}
        position={[0, 1, 0]}
        material={new THREE.MeshPhongMaterial({ color: '#8B5CF6' })}
      />
      
      {/* Main Body - Upper */}
      <Cylinder
        args={[0.15, 0.15, 0.8, 8]}
        position={[0, 0.2, 0]}
        material={new THREE.MeshPhongMaterial({ color: '#FFFFFF' })}
      />
      
      {/* Main Body - Lower */}
      <Cylinder
        args={[0.15, 0.15, 0.6, 8]}
        position={[0, -0.5, 0]}
        material={new THREE.MeshPhongMaterial({ color: '#10B981' })}
      />
      
      {/* Side Boosters */}
      <Cylinder
        args={[0.08, 0.08, 1.2, 8]}
        position={[0.25, -0.2, 0]}
        material={new THREE.MeshPhongMaterial({ color: '#10B981' })}
      />
      <Cylinder
        args={[0.08, 0.08, 1.2, 8]}
        position={[-0.25, -0.2, 0]}
        material={new THREE.MeshPhongMaterial({ color: '#10B981' })}
      />
      
      {/* Booster Nozzles */}
      <Cylinder
        args={[0.06, 0.08, 0.2, 8]}
        position={[0.25, -0.9, 0]}
        material={new THREE.MeshPhongMaterial({ color: '#F97316' })}
      />
      <Cylinder
        args={[0.06, 0.08, 0.2, 8]}
        position={[-0.25, -0.9, 0]}
        material={new THREE.MeshPhongMaterial({ color: '#F97316' })}
      />
      
      {/* Main Engine Nozzle */}
      <Cylinder
        args={[0.1, 0.15, 0.3, 8]}
        position={[0, -1, 0]}
        material={new THREE.MeshPhongMaterial({ color: '#F97316' })}
      />
      
      {/* Flame Effect */}
      <group ref={flameRef} position={[0, -1.3, 0]}>
        <Cone
          args={[0.1, 0.8, 8]}
          material={new THREE.MeshBasicMaterial({ 
            color: '#FFD700',
            transparent: true,
            opacity: 0.8
          })}
        />
        <Cone
          args={[0.06, 1.2, 8]}
          material={new THREE.MeshBasicMaterial({ 
            color: '#FF4500',
            transparent: true,
            opacity: 0.6
          })}
        />
      </group>
      
      {/* Side Booster Flames */}
      {isSimulating && currentData.time < 2 && (
        <>
          <Cone
            args={[0.04, 0.6, 8]}
            position={[0.25, -1.1, 0]}
            material={new THREE.MeshBasicMaterial({ 
              color: '#FFD700',
              transparent: true,
              opacity: 0.7
            })}
          />
          <Cone
            args={[0.04, 0.6, 8]}
            position={[-0.25, -1.1, 0]}
            material={new THREE.MeshBasicMaterial({ 
              color: '#FFD700',
              transparent: true,
              opacity: 0.7
            })}
          />
        </>
      )}
    </group>
  );
};

const Ground = () => {
  return (
    <Plane
      args={[100, 100]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2, 0]}
      material={new THREE.MeshLambertMaterial({ 
        color: '#8B7355',
        transparent: true,
        opacity: 0.8
      })}
    />
  );
};

const Clouds = () => {
  const positions = [
    [10, 8, -20],
    [-15, 12, -25],
    [20, 15, -30],
    [-25, 10, -15],
    [30, 18, -35],
  ];

  return (
    <>
      {positions.map((pos, index) => (
        <Sphere
          key={index}
          args={[3, 16, 16]}
          position={pos as [number, number, number]}
          material={new THREE.MeshBasicMaterial({ 
            color: '#FFFFFF',
            transparent: true,
            opacity: 0.6
          })}
        />
      ))}
    </>
  );
};

const Rocket3DVisualization = ({ currentData, isSimulating }: Rocket3DProps) => {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-blue-900 to-blue-300 rounded-lg overflow-hidden relative">
      <Canvas
        camera={{ 
          position: [8, 5, 8], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 5, 0]} intensity={0.5} />

        {/* Sky */}
        <Sky
          distance={450000}
          sunPosition={[1, 1, 0]}
          inclination={0}
          azimuth={0.25}
        />

        {/* Scene Objects */}
        <Rocket3D currentData={currentData} isSimulating={isSimulating} />
        <Ground />
        <Clouds />

        {/* Grid for reference */}
        <gridHelper args={[20, 20, '#666666', '#666666']} position={[0, -2, 0]} />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={50}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* 3D Info Overlay */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-semibold">
        <div>Altitude: {currentData.altitude.toFixed(1)}m</div>
        <div>Time: {currentData.time.toFixed(1)}s</div>
        <div>3D View - Drag to rotate, scroll to zoom</div>
      </div>
      
      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-semibold">
        <div>Distance: {currentData.horizontalPosition.toFixed(1)}m</div>
        <div>Velocity: {currentData.velocity.toFixed(1)} m/s</div>
      </div>
    </div>
  );
};

export default Rocket3DVisualization;
