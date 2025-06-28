import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface RocketPart {
  id: string;
  type: 'nose' | 'body' | 'fins' | 'engine';
  name: string;
  mass: number;
  drag: number;
  thrust?: number;
  stability?: number;
  finCount?: number; // Allow custom fin count
}

interface DroppedParts {
  [key: number]: RocketPart;
}

interface RocketAssembly3DProps {
  droppedParts: DroppedParts;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, position: number) => void;
  onRemovePart: (position: number) => void;
}

// Clean wrapper components to avoid attribute conflicts
const CleanCone = React.forwardRef<any, any>((props, ref) => {
  const geometry = new THREE.ConeGeometry(props.args[0], props.args[1], props.args[2]);
  return (
    <mesh ref={ref} geometry={geometry} position={props.position} onClick={props.onClick}>
      {props.children}
    </mesh>
  );
});

const CleanCylinder = React.forwardRef<any, any>((props, ref) => {
  const geometry = new THREE.CylinderGeometry(props.args[0], props.args[1], props.args[2], props.args[3]);
  return (
    <mesh ref={ref} geometry={geometry} position={props.position} onClick={props.onClick}>
      {props.children}
    </mesh>
  );
});

const CleanBox = React.forwardRef<any, any>((props, ref) => {
  const geometry = new THREE.BoxGeometry(props.args[0], props.args[1], props.args[2]);
  return (
    <mesh ref={ref} geometry={geometry} position={props.position} onClick={props.onClick}>
      {props.children}
    </mesh>
  );
});

// Realistic triangular fin geometry for Rocket Builder
const RealisticFin = React.forwardRef<any, any>((props, ref) => {
  const rootChord = props.rootChord || 0.03;
  const tipChord = props.tipChord || 0.01;
  const height = props.height || 0.035;
  const thickness = props.thickness || 0.002;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(rootChord, 0);
  shape.lineTo(tipChord, height);
  shape.lineTo(0, height);
  shape.lineTo(0, 0);
  const extrudeSettings = { depth: thickness, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  return (
    <mesh ref={ref} geometry={geometry} position={props.position} rotation={props.rotation} onClick={props.onClick}>
      {props.children}
    </mesh>
  );
});

const Rocket3DAssembly = ({ droppedParts, onRemovePart }: { droppedParts: DroppedParts; onRemovePart: (position: number) => void }) => {
  const rocketRef = useRef<THREE.Group>(null);

  const handlePartClick = (position: number) => {
    onRemovePart(position);
  };

  // Helper function to get nose cone geometry based on type
  const getNoseConeGeometry = (nosePart: RocketPart) => {
    // Scale factor: 1 unit = 1mm in real world
    const scale = 0.001; // Convert mm to meters for 3D model
    
    switch (nosePart.name) {
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
  const getFinGeometry = (finPart: RocketPart) => {
    // Scale factor: 1 unit = 1mm in real world
    const scale = 0.001; // Convert mm to meters for 3D model
    
    switch (finPart.name) {
      case 'Standard Fins':
        // Flat, wide fins: thickness 0.5mm, height 20mm, span 15mm
        return {
          finCount: 4,
          finSize: { width: 0.5 * scale, height: 20 * scale, depth: 15 * scale },
          color: "#10B981"
        };
      case 'Large Fins':
        // Larger flat fins: thickness 0.5mm, height 25mm, span 20mm
        return {
          finCount: 4,
          finSize: { width: 0.5 * scale, height: 25 * scale, depth: 20 * scale },
          color: "#F59E0B"
        };
      case 'Swept Fins':
        // Swept fins: thickness 0.5mm, height 22mm, span 18mm
        return {
          finCount: 3,
          finSize: { width: 0.5 * scale, height: 22 * scale, depth: 18 * scale },
          color: "#EF4444"
        };
      default:
        return {
          finCount: 4,
          finSize: { width: 0.5 * scale, height: 20 * scale, depth: 15 * scale },
          color: "#10B981"
        };
    }
  };

  // Helper function to get engine geometry based on type
  const getEngineGeometry = (enginePart: RocketPart) => {
    // Scale factor: 1 unit = 1mm in real world
    const scale = 0.001; // Convert mm to meters for 3D model
    
    switch (enginePart.name) {
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

  // Helper function to get body tube geometry based on type
  const getBodyTubeGeometry = (bodyPart: RocketPart) => {
    // Scale factor: 1 unit = 1mm in real world
    const scale = 0.001; // Convert mm to meters for 3D model
    
    switch (bodyPart.name) {
      case 'Standard Tube':
        // Standard diameter: 24mm, length: 200mm
        return { args: [12 * scale, 12 * scale, 200 * scale, 8], color: "#FFFFFF" };
      case 'Wide Tube':
        // Wider diameter: 30mm, length: 200mm
        return { args: [15 * scale, 15 * scale, 200 * scale, 8], color: "#E5E7EB" };
      case 'Narrow Tube':
        // Narrower diameter: 18mm, length: 200mm
        return { args: [9 * scale, 9 * scale, 200 * scale, 8], color: "#F3F4F6" };
      default:
        return { args: [12 * scale, 12 * scale, 200 * scale, 8], color: "#FFFFFF" };
    }
  };

  // Helper function to render fins based on type
  const renderFins = (finPart: RocketPart, yPos: number) => {
    const config = getFinGeometry(finPart);
    const count = finPart.finCount || config.finCount || 4;
    const fins = [];
    const angleStep = (2 * Math.PI) / count;
    const bodyRadius = 12 * 0.001;
    const finOffset = bodyRadius + 0.001;
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * finOffset;
      const z = Math.sin(angle) * finOffset;
      fins.push(
        <RealisticFin
          key={i}
          rootChord={0.03}
          tipChord={0.01}
          height={0.035}
          thickness={0.002}
          position={[x, yPos - 0.0175, z]}
          rotation={[0, angle, 0]}
          onClick={() => handlePartClick(2)}
        >
          <meshPhongMaterial color={config.color} />
        </RealisticFin>
      );
    }
    return fins;
  };

  return (
    <group ref={rocketRef} scale={[5, 5, 5]}>
      {/* DEBUG: Always render a large magenta body tube at the origin */}
      <CleanCylinder
        args={[0.2, 0.2, 1.5, 16]}
        position={[0, 0, 0]}
      >
        <meshPhongMaterial color={'#FF00FF'} />
      </CleanCylinder>
      {(() => {
        // Get geometry for each part, or use defaults for body if only fins are present
        const nose = droppedParts[0] ? getNoseConeGeometry(droppedParts[0]) : null;
        const body = droppedParts[1] ? getBodyTubeGeometry(droppedParts[1]) : (droppedParts[2] ? getBodyTubeGeometry({ name: 'Standard Tube' } as RocketPart) : null);
        const engine = droppedParts[3] ? getEngineGeometry(droppedParts[3]) : null;
        // Heights
        const noseHeight = nose ? nose.args[1] : 0;
        const bodyHeight = body ? body.args[2] : 0;
        const engineHeight = engine ? engine.args[2] : 0;
        // Y positions (stack from bottom up)
        let y = 0;
        // Engine (bottom)
        let engineY = y + engineHeight / 2;
        y += engineHeight;
        // Body
        let bodyY = y + bodyHeight / 2;
        y += bodyHeight;
        // Nose
        let noseY = y + noseHeight / 2;
        return <>
          {/* Engine - Position 3 */}
          {engine && (
            <CleanCylinder
              args={engine.args}
              position={[0, engineY, 0]}
              onClick={() => handlePartClick(3)}
            >
              <meshPhongMaterial color={engine.color} />
            </CleanCylinder>
          )}
          {/* Body Tube - Position 1 (or default if only fins) */}
          {body && (
            <CleanCylinder
              args={[0.2, 0.2, 1.5, 16]} // DEBUG: exaggerated size
              position={[0, bodyY, 0]}
              onClick={() => handlePartClick(1)}
            >
              <meshPhongMaterial color={'#FF00FF'} />
            </CleanCylinder>
          )}
          {/* Nose Cone - Position 0 */}
          {nose && (
            <CleanCone
              args={nose.args}
              position={[0, noseY, 0]}
              onClick={() => handlePartClick(0)}
            >
              <meshPhongMaterial color={nose.color} />
            </CleanCone>
          )}
          {/* Fins - Position 2 (attach to bottom of body) */}
          {droppedParts[2] && body && renderFins(droppedParts[2], bodyY - bodyHeight / 2)}
        </>;
      })()}
    </group>
  );
};

const DropZone = ({ position, onDragOver, onDrop, hasDroppedPart, partName }: {
  position: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, position: number) => void;
  hasDroppedPart: boolean;
  partName: string;
}) => {
  if (hasDroppedPart) return null;

  const heights = [80, 120, 80, 60]; // Heights for nose, body, fins, engine
  const labels = ['Nose Cone', 'Body Tube', 'Fins', 'Engine'];

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, position)}
      className={`border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors absolute inset-0 bg-background/80`}
      style={{ height: `${heights[position]}px` }}
    >
      <div className="text-center text-muted-foreground">
        <div className="font-medium">{labels[position]}</div>
        <div className="text-sm">Drop part here</div>
      </div>
    </div>
  );
};

const RocketAssembly3D = ({ droppedParts, onDragOver, onDrop, onRemovePart }: RocketAssembly3DProps) => {
  const hasAnyParts = Object.keys(droppedParts).length > 0;

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-blue-900 to-blue-300 rounded-lg overflow-hidden">
      {hasAnyParts ? (
        <Canvas
          camera={{ 
            position: [2, 1, 2], 
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
          />
          <pointLight position={[0, 2, 0]} intensity={0.5} />

          <Rocket3DAssembly droppedParts={droppedParts} onRemovePart={onRemovePart} />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={5}
            autoRotate
            autoRotateSpeed={2}
          />
        </Canvas>
      ) : (
        <div className="flex items-center justify-center h-full text-white text-center">
          <div>
            <div className="text-lg font-semibold mb-2">Start Building Your Rocket</div>
            <div className="text-sm opacity-80">Drag parts here to see your 3D rocket</div>
          </div>
        </div>
      )}

      {/* Drop zones overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative h-full">
          {/* Nose cone drop zone */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 pointer-events-auto"
            style={{ height: '80px' }}
          >
            <DropZone 
              position={0} 
              onDragOver={onDragOver} 
              onDrop={onDrop} 
              hasDroppedPart={!!droppedParts[0]}
              partName="Nose Cone"
            />
          </div>

          {/* Body tube drop zone */}
          <div 
            className="absolute top-20 left-1/2 transform -translate-x-1/2 w-32 pointer-events-auto"
            style={{ height: '120px' }}
          >
            <DropZone 
              position={1} 
              onDragOver={onDragOver} 
              onDrop={onDrop} 
              hasDroppedPart={!!droppedParts[1]}
              partName="Body Tube"
            />
          </div>

          {/* Fins drop zone */}
          <div 
            className="absolute top-56 left-1/2 transform -translate-x-1/2 w-32 pointer-events-auto"
            style={{ height: '80px' }}
          >
            <DropZone 
              position={2} 
              onDragOver={onDragOver} 
              onDrop={onDrop} 
              hasDroppedPart={!!droppedParts[2]}
              partName="Fins"
            />
          </div>

          {/* Engine drop zone */}
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 pointer-events-auto"
            style={{ height: '60px' }}
          >
            <DropZone 
              position={3} 
              onDragOver={onDragOver} 
              onDrop={onDrop} 
              hasDroppedPart={!!droppedParts[3]}
              partName="Engine"
            />
          </div>
        </div>
      </div>

      {/* Info overlay */}
      {hasAnyParts && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
          <div>Click parts to remove</div>
          <div>Drag to rotate, scroll to zoom</div>
        </div>
      )}
    </div>
  );
};

export default RocketAssembly3D;
