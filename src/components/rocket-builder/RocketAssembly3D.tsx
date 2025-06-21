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

const Rocket3DAssembly = ({ droppedParts, onRemovePart }: { droppedParts: DroppedParts; onRemovePart: (position: number) => void }) => {
  const rocketRef = useRef<THREE.Group>(null);

  const handlePartClick = (position: number) => {
    onRemovePart(position);
  };

  // Helper function to get nose cone geometry based on type
  const getNoseConeGeometry = (nosePart: RocketPart) => {
    switch (nosePart.name) {
      case 'Cone Nose':
        return { args: [0.15, 0.4, 8], color: "#8B5CF6" };
      case 'Ogive Nose':
        return { args: [0.12, 0.5, 12], color: "#EC4899" };
      case 'Parabolic Nose':
        return { args: [0.18, 0.35, 6], color: "#06B6D4" };
      default:
        return { args: [0.15, 0.4, 8], color: "#8B5CF6" };
    }
  };

  // Helper function to get fin geometry based on type
  const getFinGeometry = (finPart: RocketPart) => {
    switch (finPart.name) {
      case 'Standard Fins':
        return {
          finCount: 4,
          finSize: { width: 0.03, height: 0.6, depth: 0.3 },
          color: "#10B981"
        };
      case 'Large Fins':
        return {
          finCount: 4,
          finSize: { width: 0.04, height: 0.8, depth: 0.4 },
          color: "#F59E0B"
        };
      case 'Swept Fins':
        return {
          finCount: 3,
          finSize: { width: 0.03, height: 0.7, depth: 0.35 },
          color: "#EF4444"
        };
      default:
        return {
          finCount: 4,
          finSize: { width: 0.03, height: 0.6, depth: 0.3 },
          color: "#10B981"
        };
    }
  };

  // Helper function to get engine geometry based on type
  const getEngineGeometry = (enginePart: RocketPart) => {
    switch (enginePart.name) {
      case 'A8-3 Engine':
        return { args: [0.08, 0.15, 0.25, 8], color: "#F97316" };
      case 'B6-4 Engine':
        return { args: [0.1, 0.15, 0.3, 8], color: "#DC2626" };
      case 'C6-5 Engine':
        return { args: [0.12, 0.15, 0.35, 8], color: "#7C3AED" };
      default:
        return { args: [0.1, 0.15, 0.3, 8], color: "#F97316" };
    }
  };

  // Helper function to render fins based on type
  const renderFins = (finPart: RocketPart) => {
    const config = getFinGeometry(finPart);
    const fins = [];
    const angleStep = (2 * Math.PI) / config.finCount;

    for (let i = 0; i < config.finCount; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * 0.18;
      const z = Math.sin(angle) * 0.18;
      
      fins.push(
        <CleanBox 
          key={i}
          args={[config.finSize.width, config.finSize.height, config.finSize.depth]} 
          position={[x, 0, z]}
          onClick={() => handlePartClick(2)}
        >
          <meshPhongMaterial color={config.color} />
        </CleanBox>
      );
    }

    return fins;
  };

  return (
    <group ref={rocketRef}>
      {/* Nose Cone - Position 0 */}
      {droppedParts[0] && (() => {
        const config = getNoseConeGeometry(droppedParts[0]);
        return (
          <CleanCone 
            args={config.args} 
            position={[0, 1.2, 0]}
            onClick={() => handlePartClick(0)}
          >
            <meshPhongMaterial color={config.color} />
          </CleanCone>
        );
      })()}
      
      {/* Body Tube - Position 1 */}
      {droppedParts[1] && (
        <CleanCylinder 
          args={[0.15, 0.15, 0.8, 8]} 
          position={[0, 0.4, 0]}
          onClick={() => handlePartClick(1)}
        >
          <meshPhongMaterial color="#FFFFFF" />
        </CleanCylinder>
      )}
      
      {/* Fins - Position 2 */}
      {droppedParts[2] && renderFins(droppedParts[2])}
      
      {/* Engine - Position 3 */}
      {droppedParts[3] && (() => {
        const config = getEngineGeometry(droppedParts[3]);
        return (
          <CleanCylinder 
            args={config.args} 
            position={[0, -0.15, 0]}
            onClick={() => handlePartClick(3)}
          >
            <meshPhongMaterial color={config.color} />
          </CleanCylinder>
        );
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
