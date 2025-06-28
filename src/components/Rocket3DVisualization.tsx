import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface SimulationData {
  time: number;
  altitude: number;
  velocity: number;
  acceleration: number;
  horizontalPosition: number;
  horizontalVelocity: number;
}

interface RocketDesign {
  nose: { name: string; mass: number; drag: number };
  body: { diameter: number; length: number; mass: number };
  fins: { name: string; mass: number; drag: number; stability?: number };
  engine: { name: string; mass: number; drag: number; thrust?: number };
  totalMass: number;
  totalDrag: number;
  thrust: number;
  stability: number;
}

interface Rocket3DProps {
  currentData: SimulationData;
  isSimulating: boolean;
  rocketDesign?: RocketDesign;
}

// Clean wrapper components to avoid attribute conflicts
const CleanCone = React.forwardRef<any, any>((props, ref) => {
  const geometry = new THREE.ConeGeometry(props.args[0], props.args[1], props.args[2]);
  return (
    <mesh ref={ref} geometry={geometry} position={props.position}>
      {props.children}
    </mesh>
  );
});

const CleanCylinder = React.forwardRef<any, any>((props, ref) => {
  const geometry = new THREE.CylinderGeometry(props.args[0], props.args[1], props.args[2], props.args[3]);
  return (
    <mesh ref={ref} geometry={geometry} position={props.position}>
      {props.children}
    </mesh>
  );
});

const CleanSphere = React.forwardRef<any, any>((props, ref) => {
  const geometry = new THREE.SphereGeometry(props.args[0], props.args[1], props.args[2]);
  return (
    <mesh ref={ref} geometry={geometry} position={props.position}>
      {props.children}
    </mesh>
  );
});

const CleanBox = React.forwardRef<any, any>((props, ref) => {
  const geometry = new THREE.BoxGeometry(props.args[0], props.args[1], props.args[2]);
  return (
    <mesh ref={ref} geometry={geometry} position={props.position}>
      {props.children}
    </mesh>
  );
});

const Rocket3D = ({ currentData, isSimulating, rocketDesign }: Rocket3DProps) => {
  const rocketRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Group>(null);

  // Debug logging
  React.useEffect(() => {
    console.log('Rocket3D received data:', currentData);
    console.log('Is simulating:', isSimulating);
  }, [currentData, isSimulating]);

  useFrame(() => {
    if (rocketRef.current) {
      // Scale down the movement to be visible in the 3D space
      // For model rockets, typical altitudes are 50-200m, so scale accordingly
      const scaleFactor = 0.05; // Scale down by 20x to make movement visible
      const newX = currentData.horizontalPosition * scaleFactor;
      const newY = currentData.altitude * scaleFactor;
      
      rocketRef.current.position.x = newX;
      rocketRef.current.position.y = newY;
      rocketRef.current.position.z = 0;
      rocketRef.current.rotation.z = currentData.horizontalVelocity * 0.005; // Reduced rotation
      
      // Debug position every 50 frames
      if (Math.floor(Date.now() / 100) % 50 === 0) {
        console.log(`Rocket position: x=${newX.toFixed(3)}, y=${newY.toFixed(3)}, altitude=${currentData.altitude.toFixed(2)}m`);
      }
    }

    if (flameRef.current) {
      if (isSimulating && currentData.time < 2) {
        flameRef.current.visible = true;
        flameRef.current.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.3;
      } else {
        flameRef.current.visible = false;
      }
    }
  });

  // Helper function to get nose cone geometry based on type
  const getNoseConeGeometry = (nosePart: any) => {
    // Scale factor: 1 unit = 1mm in real world
    const scale = 0.001; // Convert mm to meters for 3D model
    
    switch (nosePart?.name) {
      case 'Pointed Cone':
        // Sharp, pointed cone - narrow and tall
        // Base diameter: 24mm, height: 50mm (typical model rocket proportions)
        return { args: [12 * scale, 50 * scale, 8], color: "#8B5CF6" };
      case 'Rounded Cone':
        // Rounded cone - wider and shorter with more segments for smoothness
        // Base diameter: 24mm, height: 40mm
        return { args: [12 * scale, 40 * scale, 12], color: "#EC4899" };
      case 'Blunt Cone':
        // Blunt cone - very wide and short
        // Base diameter: 24mm, height: 25mm
        return { args: [12 * scale, 25 * scale, 6], color: "#06B6D4" };
      default:
        return { args: [12 * scale, 40 * scale, 8], color: "#8B5CF6" };
    }
  };

  // Helper function to get fin geometry based on type
  const getFinGeometry = (finPart: any) => {
    // Scale factor: 1 unit = 1mm in real world
    const scale = 0.001; // Convert mm to meters for 3D model
    
    switch (finPart?.name) {
      case 'Standard Fins':
        // Standard rectangular fins - 4 fins, medium size
        // Width: 2mm, height: 30mm, depth: 15mm
        return {
          finCount: 4,
          finSize: { width: 2 * scale, height: 30 * scale, depth: 15 * scale },
          color: "#10B981"
        };
      case 'Large Fins':
        // Large fins - 4 fins, bigger for more stability
        // Width: 3mm, height: 40mm, depth: 20mm
        return {
          finCount: 4,
          finSize: { width: 3 * scale, height: 40 * scale, depth: 20 * scale },
          color: "#F59E0B"
        };
      case 'Swept Fins':
        // Swept fins - 3 fins, swept back design
        // Width: 2mm, height: 35mm, depth: 18mm
        return {
          finCount: 3,
          finSize: { width: 2 * scale, height: 35 * scale, depth: 18 * scale },
          color: "#EF4444"
        };
      default:
        return {
          finCount: 4,
          finSize: { width: 2 * scale, height: 30 * scale, depth: 15 * scale },
          color: "#10B981"
        };
    }
  };

  // Helper function to get engine geometry based on type
  const getEngineGeometry = (enginePart: any) => {
    // Scale factor: 1 unit = 1mm in real world
    const scale = 0.001; // Convert mm to meters for 3D model
    
    switch (enginePart?.name) {
      case 'A8-3 Engine':
        // Smallest engine - low thrust
        // Diameter: 18mm, length: 70mm
        return { args: [9 * scale, 9 * scale, 70 * scale, 8], color: "#F97316" };
      case 'B6-4 Engine':
        // Medium engine - medium thrust
        // Diameter: 18mm, length: 70mm (same size, different propellant)
        return { args: [9 * scale, 9 * scale, 70 * scale, 8], color: "#DC2626" };
      case 'C6-5 Engine':
        // Largest engine - high thrust
        // Diameter: 18mm, length: 70mm (same size, different propellant)
        return { args: [9 * scale, 9 * scale, 70 * scale, 8], color: "#7C3AED" };
      default:
        return { args: [9 * scale, 9 * scale, 70 * scale, 8], color: "#F97316" };
    }
  };

  // Helper function to render fins based on type
  const renderFins = (finPart: any) => {
    const config = getFinGeometry(finPart);
    const fins = [];
    const angleStep = (2 * Math.PI) / config.finCount;
    
    // Use the body tube radius for proper fin attachment
    const bodyRadius = 12 * 0.001; // 12mm radius in meters

    for (let i = 0; i < config.finCount; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * bodyRadius;
      const z = Math.sin(angle) * bodyRadius;
      
      fins.push(
        <CleanBox 
          key={i}
          args={[config.finSize.width, config.finSize.height, config.finSize.depth]} 
          position={[x, 0, z]}
        >
          <meshPhongMaterial color={config.color} />
        </CleanBox>
      );
    }

    return fins;
  };

  // Use rocket design if provided, otherwise use default
  const noseConfig = getNoseConeGeometry(rocketDesign?.nose);
  const engineConfig = getEngineGeometry(rocketDesign?.engine);

  return (
    <group ref={rocketRef} scale={[40, 40, 40]}>
      {/* Nose Cone */}
      <CleanCone args={noseConfig.args} position={[0, 1.2, 0]}>
        <meshPhongMaterial color={noseConfig.color} />
      </CleanCone>
      
      {/* Body Tube */}
      <CleanCylinder args={[12 * 0.001, 12 * 0.001, 200 * 0.001, 8]} position={[0, 0.4, 0]}>
        <meshPhongMaterial color="#FFFFFF" />
      </CleanCylinder>
      
      {/* Fins */}
      {rocketDesign?.fins && renderFins(rocketDesign.fins)}
      
      {/* Engine */}
      <CleanCylinder args={engineConfig.args} position={[0, -0.15, 0]}>
        <meshPhongMaterial color={engineConfig.color} />
      </CleanCylinder>
      
      {/* Engine Flame */}
      <group ref={flameRef} position={[0, -0.15 - engineConfig.args[2]/2, 0]}>
        <CleanCone args={[engineConfig.args[0], 0.8, 8]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </CleanCone>
        <CleanCone args={[engineConfig.args[0] * 0.6, 1.2, 8]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#FF4500" transparent opacity={0.6} />
        </CleanCone>
      </group>
    </group>
  );
};

const LaunchPad = () => {
  return (
    <group position={[0, -1.8, 0]}>
      {/* Main platform - reduced from diameter 4 to 2.4 */}
      <CleanCylinder args={[1.2, 1.2, 0.15, 16]} position={[0, 0, 0]}>
        <meshPhongMaterial color="#CCCCCC" />
      </CleanCylinder>
      
      {/* Support legs - reduced spacing and size */}
      <CleanBox args={[0.1, 0.6, 0.1]} position={[0.9, -0.4, 0.9]}>
        <meshPhongMaterial color="#999999" />
      </CleanBox>
      <CleanBox args={[0.1, 0.6, 0.1]} position={[-0.9, -0.4, 0.9]}>
        <meshPhongMaterial color="#999999" />
      </CleanBox>
      <CleanBox args={[0.1, 0.6, 0.1]} position={[0.9, -0.4, -0.9]}>
        <meshPhongMaterial color="#999999" />
      </CleanBox>
      <CleanBox args={[0.1, 0.6, 0.1]} position={[-0.9, -0.4, -0.9]}>
        <meshPhongMaterial color="#999999" />
      </CleanBox>
      
      {/* Central support tower - slightly smaller */}
      <CleanCylinder args={[0.08, 0.08, 1.2, 8]} position={[0, 0.55, 0]}>
        <meshPhongMaterial color="#FF0000" />
      </CleanCylinder>
      
      {/* Platform details - adjusted positions */}
      <CleanCylinder args={[0.04, 0.04, 0.2, 8]} position={[0.5, 0.18, 0]}>
        <meshPhongMaterial color="#FFFF00" />
      </CleanCylinder>
      <CleanCylinder args={[0.04, 0.04, 0.2, 8]} position={[-0.5, 0.18, 0]}>
        <meshPhongMaterial color="#FFFF00" />
      </CleanCylinder>
    </group>
  );
};

const Ground = () => {
  const geometry = new THREE.PlaneGeometry(100, 100);
  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2, 0]}
    >
      <meshLambertMaterial color="#22C55E" />
    </mesh>
  );
};

const Clouds = () => {
  const positions: [number, number, number][] = [
    [10, 8, -20],
    [-15, 12, -25],
    [20, 15, -30],
    [-25, 10, -15],
    [30, 18, -35],
  ];

  return (
    <>
      {positions.map((pos, index) => (
        <CleanSphere key={index} args={[3, 16, 16]} position={pos}>
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} />
        </CleanSphere>
      ))}
    </>
  );
};

// Custom camera component that follows the rocket
const FollowCamera = ({ currentData, isSimulating }: { currentData: SimulationData; isSimulating: boolean }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    if (isSimulating) {
      const scaleFactor = 0.05;
      const rocketX = currentData.horizontalPosition * scaleFactor;
      const rocketY = currentData.altitude * scaleFactor;
      
      // Better camera positioning for launch view
      const cameraX = rocketX + 3; // Closer to rocket
      const cameraY = Math.max(rocketY * 0.5 + 1, 0.5); // Lower height, follow rocket but stay lower
      const cameraZ = 6; // Closer distance
      
      // Update camera position
      camera.position.set(cameraX, cameraY, cameraZ);
      
      // Look slightly above the rocket for better launch view
      camera.lookAt(rocketX, rocketY + 0.5, 0);
    }
    // Don't override camera when not simulating - let OrbitControls handle it
  });
  
  return null;
};

const Rocket3DVisualization = ({ currentData, isSimulating, rocketDesign }: Rocket3DProps) => {
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
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 5, 0]} intensity={0.5} />

        <FollowCamera currentData={currentData} isSimulating={isSimulating} />
        <Rocket3D currentData={currentData} isSimulating={isSimulating} rocketDesign={rocketDesign} />
        <LaunchPad />
        <Ground />
        <Clouds />

        <gridHelper args={[20, 20, '#666666', '#666666']} position={[0, -2, 0]} />

        <OrbitControls
          enablePan={!isSimulating}
          enableZoom={!isSimulating}
          enableRotate={!isSimulating}
          minDistance={3}
          maxDistance={50}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
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
