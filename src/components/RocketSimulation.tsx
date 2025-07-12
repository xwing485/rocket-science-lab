import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RocketAICoach from './RocketAICoach';
import PerformanceStats from './rocket-builder/PerformanceStats';
import Matter from 'matter-js';

interface RocketDesign {
  nose: { name: string; mass: number; drag: number };
  body: { diameter: number; length: number; mass: number };
  fins: { name: string; mass: number; drag: number; stability?: number };
  engine: { name: string; mass: number; drag: number; thrust?: number };
  totalMass: number;
  totalDrag: number;
  thrust: number;
  stability: number;
  thrustToWeightRatio?: number;
}

interface SimulationResults {
  maxAltitude: number;
  maxVelocity: number;
  flightTime: number;
  performanceRating: string;
}

interface RocketSimulation2DProps {
  rocketDesign: RocketDesign | null;
  onSectionChange: (section: string) => void;
  onProgressUpdate: (key: string, value: boolean) => void;
  onSimulationUpdate: (results: SimulationResults) => void;
}

export default function RocketSimulation2D({ 
  rocketDesign, 
  onSectionChange, 
  onProgressUpdate, 
  onSimulationUpdate 
}: RocketSimulation2DProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [flightTime, setFlightTime] = useState(0);
  const [rocketPosition, setRocketPosition] = useState({ x: 150, y: 260 });
  const [flightData, setFlightData] = useState<Array<{time: number, altitude: number, velocity: number}>>([]);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const rocketBodyRef = useRef<Matter.Body | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  if (!rocketDesign) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">2D Rocket Simulation</h1>
        <div className="text-center text-muted-foreground py-12">
          Build a rocket or select a saved design to simulate its flight.
        </div>
      </div>
    );
  }

  // Use rocket parameters for simulation
  const rocket = rocketDesign;
  const mass = rocket.totalMass / 1000; // convert g to kg
  const thrust = rocket.thrust; // N
  const gravity = 9.81; // m/s²
  const dragCoeff = rocket.totalDrag || 0.5;
  const crossSectionalArea = Math.PI * Math.pow((rocket.body.diameter / 1000) / 2, 2); // m²
  const airDensity = 1.225; // kg/m³
  const burnTime = rocket.engine.thrust ? 2.0 : 0; // seconds (placeholder, can be improved)

  // SVG dimensions
  const svgWidth = 300;
  const svgHeight = 300;
  const groundY = svgHeight - 30;
  const padY = groundY - 20;

  // Rocket dimensions
  const rocketWidth = 24;
  const rocketHeight = 80;
  const noseHeight = 20;
  const engineHeight = 16;

  // Camera follow logic
  const altitudeScale = 3; // pixels per meter
  const rocketAltitude = flightData.length > 0 ? flightData[flightData.length - 1].altitude : 0;
  // Center rocket, but don't scroll below ground
  const cameraY = Math.max(0, (padY - rocketHeight - rocketAltitude * altitudeScale) - svgHeight / 2 + rocketHeight / 2);

  // SVG part styles based on rocketDesign
  // Nose cone
  let noseColor = '#222';
  let noseShape = 'pointed';
  if (rocket.nose.name.toLowerCase().includes('rounded')) {
    noseColor = '#888';
    noseShape = 'rounded';
  } else if (rocket.nose.name.toLowerCase().includes('blunt')) {
    noseColor = '#c02626';
    noseShape = 'blunt';
  }

  // Body tube
  let bodyColor = '#e5e7eb';
  let bodyWidth = 16;
  if (rocket.body.diameter >= 30) {
    bodyColor = '#bae6fd';
    bodyWidth = 22;
  } else if (rocket.body.diameter <= 20) {
    bodyColor = '#d1d5db';
    bodyWidth = 10;
  }
  let bodyLength = rocketHeight - noseHeight - engineHeight;

  // Fins
  let finColor = '#10b981';
  let finShape = 'standard';
  if (rocket.fins.name.toLowerCase().includes('large')) {
    finColor = '#3b82f6';
    finShape = 'large';
  } else if (rocket.fins.name.toLowerCase().includes('swept')) {
    finColor = '#f59e42';
    finShape = 'swept';
  }

  // Engine
  let engineColor = '#f97316';
  if (rocket.engine.name.toLowerCase().includes('b6')) {
    engineColor = '#dc2626';
  } else if (rocket.engine.name.toLowerCase().includes('c6')) {
    engineColor = '#7c3aed';
  }

  // --- Matter.js Physics Simulation ---
  useEffect(() => {
    if (!isLaunching) return;
    // Clean up any previous engine
    if (engineRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      Matter.Engine.clear(engineRef.current);
      engineRef.current = null;
      rocketBodyRef.current = null;
    }
    // Create engine and world
    const engine = Matter.Engine.create();
    engine.gravity.y = gravity / 9.81; // scale gravity to m/s²
    engineRef.current = engine;
    // Create rocket body (vertical, 1D motion)
    const rocketBody = Matter.Bodies.rectangle(svgWidth / 2, padY - rocketHeight, bodyWidth, rocketHeight, {
      mass: mass,
      frictionAir: 0, // We'll handle drag manually
      friction: 0,
      restitution: 0,
      isStatic: false,
    });
    rocketBodyRef.current = rocketBody;
    Matter.World.add(engine.world, [rocketBody]);
    // State for simulation
    let time = 0;
    let data: Array<{time: number, altitude: number, velocity: number}> = [];
    let maxAltitude = 0;
    let maxVelocity = 0;
    const dt = 1 / 60; // 60 FPS
    // Thrust and drag application
    const update = () => {
      if (!isLaunching) return;
      // Apply thrust (upwards, only during burn)
      if (time < burnTime) {
        // F = ma, so force = thrust (N)
        // Matter.js expects force in N, but per update: F * dt / mass
        const force = thrust * dt; // N * s
        Matter.Body.applyForce(rocketBody, rocketBody.position, { x: 0, y: -force });
      }
      // Calculate drag (opposes velocity)
      const velocityY = rocketBody.velocity.y;
      const dragMag = 0.5 * dragCoeff * airDensity * crossSectionalArea * velocityY * velocityY;
      const drag = dragMag * (velocityY > 0 ? 1 : -1);
      Matter.Body.applyForce(rocketBody, rocketBody.position, { x: 0, y: -drag * dt });
      // Step the engine
      Matter.Engine.update(engine, dt * 1000); // ms
      // Update time and data
      time += dt;
      // Altitude: how high above the pad (in meters)
      let altitude = Math.max(0, (padY - rocketHeight - rocketBody.position.y) / altitudeScale);
      let velocity = -velocityY;
      // Clamp/check for NaN/Infinity
      if (!isFinite(altitude) || isNaN(altitude)) altitude = 0;
      if (!isFinite(velocity) || isNaN(velocity)) velocity = 0;
      data.push({ time, altitude, velocity });
      setFlightTime(time);
      setFlightData([...data]);
      setRocketPosition({ x: svgWidth / 2, y: rocketBody.position.y });
      maxAltitude = Math.max(maxAltitude, altitude);
      maxVelocity = Math.max(maxVelocity, Math.abs(velocity));
      // Stop if rocket hits ground or starts descending after burnout
      if (altitude <= 0 && time > 0.1) {
        setIsLaunching(false);
        onProgressUpdate('simulationRun', false);
        const results = {
          maxAltitude,
          maxVelocity,
          flightTime: time,
          performanceRating: thrustToWeightRatio > 5 ? 'Excellent' : thrustToWeightRatio > 3 ? 'Good' : thrustToWeightRatio > 1.5 ? 'Fair' : 'Poor',
        };
        onSimulationUpdate(results);
        return;
      }
      animationFrameRef.current = requestAnimationFrame(update);
    };
    // Start simulation
    animationFrameRef.current = requestAnimationFrame(update);
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
        engineRef.current = null;
      }
      rocketBodyRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLaunching]);

  const handleLaunch = () => {
    setIsLaunching(true);
    setFlightTime(0);
    setFlightData([]);
    setRocketPosition({ x: svgWidth / 2, y: padY - rocketHeight });
    onProgressUpdate('simulationRun', true);
  };

  const handleReset = () => {
    setIsLaunching(false);
    setFlightTime(0);
    setFlightData([]);
    setRocketPosition({ x: svgWidth / 2, y: padY - rocketHeight });
  };

  // Calculate thrust-to-weight ratio for stats
  const thrustToWeightRatio = rocket.thrust / (rocket.totalMass / 1000 * gravity);

  // Prepare simulation results for AI coach
  const maxAltitude = flightData.length > 0 ? Math.max(...flightData.map(d => d.altitude)) : 0;
  const maxVelocity = flightData.length > 0 ? Math.max(...flightData.map(d => d.velocity)) : 0;
  const simulationResults = flightData.length > 0 ? {
    maxAltitude,
    maxVelocity,
    flightTime,
    performanceRating: thrustToWeightRatio > 5 ? 'Excellent' : thrustToWeightRatio > 3 ? 'Good' : thrustToWeightRatio > 1.5 ? 'Fair' : 'Poor',
  } : null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">2D Rocket Simulation</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Launch Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Launch</CardTitle>
          </CardHeader>
          <CardContent>
            <svg
              width={svgWidth}
              height={svgHeight}
              style={{ background: '#b6d0e2', borderRadius: 12 }}
              viewBox={`0 ${cameraY} ${svgWidth} ${svgHeight}`}
            >
              {/* Ground */}
              <rect x={0} y={groundY} width={svgWidth} height={svgHeight - groundY} fill="#3b3b3b" />
              {/* Launch Pad */}
              <rect x={svgWidth/2 - 40} y={padY} width={80} height={20} fill="#232323" stroke="#111" strokeWidth={2} rx={4} />
              {/* Rocket */}
              <g transform={`translate(${rocketPosition.x - bodyWidth/2}, ${rocketPosition.y})`}>
                {/* Engine flame (only during powered ascent) */}
                {isLaunching && flightTime <= burnTime && (
                  <ellipse cx={bodyWidth/2} cy={rocketHeight + engineHeight/2} rx={10} ry={8} fill="#fff7ae" opacity="0.7" />
                )}
                {/* Engine */}
                <rect x={bodyWidth/2 - 6} y={rocketHeight - engineHeight} width={12} height={engineHeight} fill={engineColor} stroke="#444" strokeWidth={2} rx={2} />
                {/* Body */}
                <rect x={bodyWidth/2 - bodyWidth/2} y={noseHeight} width={bodyWidth} height={bodyLength} fill={bodyColor} stroke="#888" strokeWidth={2} />
                {/* Body outline */}
                <rect x={bodyWidth/2 - bodyWidth/2} y={noseHeight} width={bodyWidth} height={bodyLength} fill="none" stroke="#222" strokeWidth={1.5} />
                {/* Nose cone */}
                {noseShape === 'pointed' && (
                  <polygon points={`${bodyWidth/2},0 0,${noseHeight} ${bodyWidth},${noseHeight}`} fill={noseColor} stroke="#111" strokeWidth={2} />
                )}
                {noseShape === 'rounded' && (
                  <ellipse cx={bodyWidth/2} cy={noseHeight/2} rx={bodyWidth/2} ry={noseHeight/2} fill={noseColor} stroke="#111" strokeWidth={2} />
                )}
                {noseShape === 'blunt' && (
                  <rect x={bodyWidth/2 - bodyWidth/2} y={0} width={bodyWidth} height={noseHeight} fill={noseColor} stroke="#111" strokeWidth={2} rx={bodyWidth/3} />
                )}
                {/* Fins */}
                {finShape === 'standard' && (
                  <>
                    <polygon points={`0,${rocketHeight-engineHeight-8} -12,${rocketHeight-engineHeight+16} 0,${rocketHeight-engineHeight+8}`} fill={finColor} stroke="#444" strokeWidth={2} />
                    <polygon points={`${bodyWidth},${rocketHeight-engineHeight-8} ${bodyWidth+12},${rocketHeight-engineHeight+16} ${bodyWidth},${rocketHeight-engineHeight+8}`} fill={finColor} stroke="#444" strokeWidth={2} />
                  </>
                )}
                {finShape === 'large' && (
                  <>
                    <polygon points={`0,${rocketHeight-engineHeight-8} -18,${rocketHeight-engineHeight+28} 0,${rocketHeight-engineHeight+8}`} fill={finColor} stroke="#444" strokeWidth={2} />
                    <polygon points={`${bodyWidth},${rocketHeight-engineHeight-8} ${bodyWidth+18},${rocketHeight-engineHeight+28} ${bodyWidth},${rocketHeight-engineHeight+8}`} fill={finColor} stroke="#444" strokeWidth={2} />
                  </>
                )}
                {finShape === 'swept' && (
                  <>
                    <polygon points={`0,${rocketHeight-engineHeight-8} -10,${rocketHeight-engineHeight+24} 8,${rocketHeight-engineHeight+8}`} fill={finColor} stroke="#444" strokeWidth={2} />
                    <polygon points={`${bodyWidth},${rocketHeight-engineHeight-8} ${bodyWidth+10},${rocketHeight-engineHeight+24} ${bodyWidth-8},${rocketHeight-engineHeight+8}`} fill={finColor} stroke="#444" strokeWidth={2} />
                  </>
                )}
              </g>
            </svg>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Time: {flightTime.toFixed(1)}s</span>
                <span>Altitude: {flightData[flightData.length - 1]?.altitude.toFixed(1) || 0}m</span>
                <span>Velocity: {flightData[flightData.length - 1]?.velocity.toFixed(1) || 0}m/s</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLaunch} disabled={isLaunching}>
                  Launch Rocket
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Performance Graphs */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Altitude Graph */}
              <div>
                <h3 className="font-semibold mb-2">Altitude vs Time</h3>
                <svg width={250} height={100} className="border bg-white rounded">
                  {flightData.length > 1 && (
                    <polyline
                      points={flightData.map((point, i) => `${i * 2},${100 - point.altitude * 1.2}`).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  )}
                  <line x1={0} y1={100} x2={250} y2={100} stroke="#000" strokeWidth={1} />
                  <line x1={0} y1={0} x2={0} y2={100} stroke="#000" strokeWidth={1} />
                </svg>
              </div>
              {/* Velocity Graph */}
              <div>
                <h3 className="font-semibold mb-2">Velocity vs Time</h3>
                <svg width={250} height={100} className="border bg-white rounded">
                  {flightData.length > 1 && (
                    <polyline
                      points={flightData.map((point, i) => `${i * 2},${100 - point.velocity * 1.5}`).join(' ')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  )}
                  <line x1={0} y1={100} x2={250} y2={100} stroke="#000" strokeWidth={1} />
                  <line x1={0} y1={0} x2={0} y2={100} stroke="#000" strokeWidth={1} />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Rocket Info and AI Coach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <PerformanceStats
          totalMass={rocket.totalMass}
          thrust={rocket.thrust}
          stability={rocket.stability}
          thrustToWeightRatio={thrustToWeightRatio}
        />
        <RocketAICoach rocketDesign={rocket} simulationResults={simulationResults} />
      </div>
    </div>
  );
}
