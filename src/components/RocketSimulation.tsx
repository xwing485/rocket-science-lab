import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RocketAICoach from './RocketAICoach';
import PerformanceStats from './rocket-builder/PerformanceStats';

// Realistic 2D Rocket Simulation (Styled like screenshot, improved physics)
export default function RocketSimulation2D() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [flightTime, setFlightTime] = useState(0);
  const [rocketPosition, setRocketPosition] = useState({ x: 150, y: 260 });
  const [flightData, setFlightData] = useState<Array<{time: number, altitude: number, velocity: number}>>([]);

  // Physics
  const thrust = 100; // N
  const mass = 0.5; // kg
  const gravity = 9.81; // m/s²
  const dragCoeff = 0.5; // more realistic drag
  const crossSectionalArea = 0.01; // m²
  const airDensity = 1.225; // kg/m³
  const timeStep = 0.01; // seconds
  const burnTime = 2.0; // seconds

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

  // Dummy rocket stats for now
  const dummyRocket = {
    nose: { name: 'Pointed Cone', mass: 10, drag: 0.4 },
    body: { diameter: 24, length: 200, mass: 20 },
    fins: { name: 'Standard Fins', mass: 15, drag: 0.2, stability: 2.0 },
    engine: { name: 'A8-3 Engine', mass: 24, drag: 0.1, thrust: 2.5 },
    totalMass: 500,
    totalDrag: 1.2,
    thrust: 100,
    stability: 2.0,
    thrustToWeightRatio: 100 / (0.5 * 9.81),
  };
  const dummyResults = {
    maxAltitude: 120,
    maxVelocity: 60,
    flightTime: 5.2,
    performanceRating: 'Good',
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLaunching) {
      let velocity = 0;
      let altitude = 0;
      let time = 0;
      let powered = true;
      let running = true;
      let data: Array<{time: number, altitude: number, velocity: number}> = [];
      interval = setInterval(() => {
        if (!running) return;
        let currentThrust = (time < burnTime) ? thrust : 0;
        let drag = 0.5 * dragCoeff * airDensity * crossSectionalArea * velocity * velocity * (velocity > 0 ? 1 : -1);
        let netForce = currentThrust - (mass * gravity) - drag;
        let acceleration = netForce / mass;
        velocity += acceleration * timeStep;
        altitude += velocity * timeStep;
        time += timeStep;
        if (altitude < 0) {
          altitude = 0;
          velocity = 0;
          running = false;
          setIsLaunching(false);
        }
        if (velocity <= 0 && time > burnTime) {
          running = false;
          setIsLaunching(false);
        }
        setRocketPosition({ x: svgWidth / 2, y: Math.max(padY - rocketHeight, padY - (altitude * 2)) });
        data.push({ time, altitude, velocity });
        setFlightTime(time);
        setFlightData([...data]);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isLaunching]);

  const handleLaunch = () => {
    setIsLaunching(true);
    setFlightTime(0);
    setFlightData([]);
    setRocketPosition({ x: svgWidth / 2, y: padY - rocketHeight });
  };

  const handleReset = () => {
    setIsLaunching(false);
    setFlightTime(0);
    setFlightData([]);
    setRocketPosition({ x: svgWidth / 2, y: 260 });
  };

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
            <svg width={svgWidth} height={svgHeight} style={{ background: '#b6d0e2', borderRadius: 12 }}>
              {/* Ground */}
              <rect x={0} y={groundY} width={svgWidth} height={svgHeight - groundY} fill="#3b3b3b" />
              {/* Launch Pad */}
              <rect x={svgWidth/2 - 40} y={padY} width={80} height={20} fill="#232323" stroke="#111" strokeWidth={2} rx={4} />
              {/* Rocket */}
              <g transform={`translate(${rocketPosition.x - rocketWidth/2}, ${rocketPosition.y})`}>
                {/* Engine flame (only during powered ascent) */}
                {isLaunching && flightTime <= burnTime && (
                  <ellipse cx={rocketWidth/2} cy={rocketHeight + engineHeight/2} rx={10} ry={8} fill="#fff7ae" opacity="0.7" />
                )}
                {/* Engine */}
                <rect x={rocketWidth/2 - 6} y={rocketHeight - engineHeight} width={12} height={engineHeight} fill="#888" stroke="#444" strokeWidth={2} rx={2} />
                {/* Body */}
                <rect x={rocketWidth/2 - 8} y={noseHeight} width={16} height={rocketHeight - noseHeight - engineHeight} fill="#e5e7eb" stroke="#888" strokeWidth={2} />
                {/* Body outline */}
                <rect x={rocketWidth/2 - 8} y={noseHeight} width={16} height={rocketHeight - noseHeight - engineHeight} fill="none" stroke="#222" strokeWidth={1.5} />
                {/* Nose cone */}
                <polygon points={`${rocketWidth/2},0 0,${noseHeight} ${rocketWidth},${noseHeight}`} fill="#222" stroke="#111" strokeWidth={2} />
                {/* Fins */}
                <polygon points={`0,${rocketHeight-engineHeight-8} -12,${rocketHeight-engineHeight+16} 0,${rocketHeight-engineHeight+8}`} fill="#888" stroke="#444" strokeWidth={2} />
                <polygon points={`${rocketWidth},${rocketHeight-engineHeight-8} ${rocketWidth+12},${rocketHeight-engineHeight+16} ${rocketWidth},${rocketHeight-engineHeight+8}`} fill="#888" stroke="#444" strokeWidth={2} />
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
          totalMass={dummyRocket.totalMass}
          thrust={dummyRocket.thrust}
          stability={dummyRocket.stability}
          thrustToWeightRatio={dummyRocket.thrustToWeightRatio}
        />
        <RocketAICoach rocketDesign={dummyRocket} simulationResults={dummyResults} />
      </div>
    </div>
  );
}
