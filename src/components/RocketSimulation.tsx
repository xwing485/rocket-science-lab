import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw, TrendingUp, Clock } from 'lucide-react';

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

interface SimulationData {
  time: number;
  altitude: number;
  velocity: number;
  acceleration: number;
  horizontalPosition: number;
  horizontalVelocity: number;
}

interface SimulationResults {
  maxAltitude: number;
  maxVelocity: number;
  flightTime: number;
  performanceRating: string;
}

interface RocketSimulationProps {
  onSectionChange: (section: string) => void;
  onProgressUpdate: (key: string, value: boolean) => void;
  rocketDesign: RocketDesign | null;
  onSimulationUpdate: (results: SimulationResults) => void;
}

// Realistic 2D Rocket Simulation (SVG side view, flight path, graphs)
export default function RocketSimulation2D() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [flightTime, setFlightTime] = useState(0);
  const [rocketPosition, setRocketPosition] = useState({ x: 100, y: 350 });
  const [flightData, setFlightData] = useState<Array<{time: number, altitude: number, velocity: number}>>([]);

  // Realistic simulation parameters
  const thrust = 100; // N (engine thrust)
  const mass = 0.5; // kg (total rocket mass)
  const gravity = 9.81; // m/s²
  const dragCoeff = 0.3; // drag coefficient
  const crossSectionalArea = 0.01; // m² (π * radius²)
  const airDensity = 1.225; // kg/m³ (at sea level)
  const timeStep = 0.05; // seconds (smaller for more accuracy)
  const burnTime = 2.0; // seconds (engine burn duration)

  // SVG dimensions
  const svgWidth = 400;
  const svgHeight = 300;
  const launchPadY = svgHeight - 20;

  // Rocket dimensions
  const rocketWidth = 8;
  const rocketHeight = 40;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLaunching) {
      interval = setInterval(() => {
        setFlightTime(prev => {
          const newTime = prev + timeStep;
          
          // Realistic physics simulation
          let acceleration = 0;
          let velocity = 0;
          let altitude = 0;
          
          if (newTime <= burnTime) {
            // Powered ascent phase
            const dragForce = 0.5 * dragCoeff * airDensity * crossSectionalArea * Math.pow(velocity, 2);
            acceleration = (thrust - mass * gravity - dragForce) / mass;
            velocity = Math.max(0, acceleration * newTime);
            altitude = 0.5 * acceleration * newTime * newTime;
          } else {
            // Ballistic descent phase (no thrust)
            const timeSinceBurnout = newTime - burnTime;
            const burnoutVelocity = (thrust - mass * gravity) / mass * burnTime;
            const burnoutAltitude = 0.5 * ((thrust - mass * gravity) / mass) * burnTime * burnTime;
            
            // Parabolic trajectory: h = h0 + v0*t - 0.5*g*t²
            altitude = burnoutAltitude + burnoutVelocity * timeSinceBurnout - 0.5 * gravity * timeSinceBurnout * timeSinceBurnout;
            velocity = burnoutVelocity - gravity * timeSinceBurnout;
          }
          
          // Update rocket position (scaled for SVG)
          const rocketX = 100; // Center horizontally
          const rocketY = Math.max(launchPadY - rocketHeight, launchPadY - (altitude * 1.5)); // Scale altitude for visibility
          
          setRocketPosition({ x: rocketX, y: rocketY });
          
          // Store flight data
          setFlightData(prev => [...prev, { time: newTime, altitude: Math.max(0, altitude), velocity: Math.max(0, velocity) }]);
          
          // Stop simulation when rocket hits ground or after 15 seconds
          if (newTime > 15 || altitude <= 0) {
            setIsLaunching(false);
            return 0;
          }
          
          return newTime;
        });
      }, 50); // Update every 50ms for smoother animation
    }

    return () => clearInterval(interval);
  }, [isLaunching]);

  const handleLaunch = () => {
    setIsLaunching(true);
    setFlightTime(0);
    setFlightData([]);
    setRocketPosition({ x: 100, y: launchPadY - rocketHeight });
  };

  const handleReset = () => {
    setIsLaunching(false);
    setFlightTime(0);
    setFlightData([]);
    setRocketPosition({ x: 100, y: 350 });
  };

  // Generate flight path points
  const flightPathPoints = flightData
    .map((point, index) => {
      const x = 100 + index * 1.5; // Spread horizontally
      const y = launchPadY - (point.altitude * 1.5);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">2D Rocket Simulation</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flight Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Path</CardTitle>
          </CardHeader>
          <CardContent>
            <svg width={svgWidth} height={svgHeight} className="border bg-gray-50 rounded">
              {/* Launch Pad */}
              <rect x={80} y={launchPadY} width={40} height={10} fill="#8b5a2b" />
              <rect x={85} y={launchPadY - 5} width={30} height={5} fill="#654321" />
              
              {/* Flight Path */}
              {flightData.length > 1 && (
                <polyline
                  points={flightPathPoints}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
              
              {/* Rocket */}
              <g transform={`translate(${rocketPosition.x - rocketWidth/2}, ${rocketPosition.y})`}>
                {/* Body */}
                <rect width={rocketWidth} height={rocketHeight} fill="#6b7280" stroke="#374151" strokeWidth={1} />
                {/* Nose */}
                <polygon
                  points={`${rocketWidth/2},0 ${0},${rocketHeight} ${rocketWidth},${rocketHeight}`}
                  fill="#8b5cf6"
                  stroke="#7c3aed"
                  strokeWidth={1}
                />
                {/* Fins */}
                <polygon
                  points={`0,${rocketHeight-10} -8,${rocketHeight} 0,${rocketHeight}`}
                  fill="#10b981"
                  stroke="#047857"
                  strokeWidth={1}
                />
                <polygon
                  points={`${rocketWidth},${rocketHeight-10} ${rocketWidth+8},${rocketHeight} ${rocketWidth},${rocketHeight}`}
                  fill="#10b981"
                  stroke="#047857"
                  strokeWidth={1}
                />
                {/* Engine */}
                <rect x={rocketWidth/2-2} y={rocketHeight} width={4} height={8} fill="#f97316" stroke="#ea580c" strokeWidth={1} />
              </g>
              
              {/* Grid lines */}
              {Array.from({ length: 6 }, (_, i) => (
                <line
                  key={i}
                  x1={0}
                  y1={launchPadY - (i * 50)}
                  x2={svgWidth}
                  y2={launchPadY - (i * 50)}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              ))}
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
                <svg width={350} height={150} className="border bg-white rounded">
                  {flightData.length > 1 && (
                    <polyline
                      points={flightData.map((point, i) => `${i * 2},${150 - point.altitude * 1.5}`).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  )}
                  <line x1={0} y1={150} x2={350} y2={150} stroke="#000" strokeWidth={1} />
                  <line x1={0} y1={0} x2={0} y2={150} stroke="#000" strokeWidth={1} />
                </svg>
              </div>
              
              {/* Velocity Graph */}
              <div>
                <h3 className="font-semibold mb-2">Velocity vs Time</h3>
                <svg width={350} height={150} className="border bg-white rounded">
                  {flightData.length > 1 && (
                    <polyline
                      points={flightData.map((point, i) => `${i * 2},${150 - point.velocity * 2}`).join(' ')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  )}
                  <line x1={0} y1={150} x2={350} y2={150} stroke="#000" strokeWidth={1} />
                  <line x1={0} y1={0} x2={0} y2={150} stroke="#000" strokeWidth={1} />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
