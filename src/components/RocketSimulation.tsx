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

interface RocketSimulationProps {
  onSectionChange: (section: string) => void;
  onProgressUpdate: (key: string, value: boolean) => void;
  rocketDesign: RocketDesign | null;
}

const RocketSimulation = ({ onSectionChange, onProgressUpdate, rocketDesign }: RocketSimulationProps) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [cameraOffset, setCameraOffset] = useState(0);

  // Default rocket if none provided
  const defaultRocket: RocketDesign = {
    nose: { name: 'Cone Nose', mass: 10, drag: 0.5 },
    body: { diameter: 24, length: 200, mass: 20 },
    fins: { name: 'Standard Fins', mass: 15, drag: 0.8, stability: 2.0 },
    engine: { name: 'A8-3 Engine', mass: 24, drag: 0.1, thrust: 2.5 },
    totalMass: 69,
    totalDrag: 1.4,
    thrust: 2.5,
    stability: 2.0
  };

  const rocket = rocketDesign || defaultRocket;

  const runSimulation = () => {
    // Validate rocket design before simulation
    if (!rocket || !rocket.engine || !rocket.engine.thrust || rocket.engine.thrust <= 0) {
      console.error('Invalid rocket design: Missing or invalid engine thrust');
      return;
    }

    if (rocket.totalMass <= 0) {
      console.error('Invalid rocket design: Total mass must be greater than 0');
      return;
    }

    setIsSimulating(true);
    setCurrentStep(0);
    onProgressUpdate('simulationRun', true);

    // Constants
    const dt = 0.01; // Smaller time step for better accuracy
    const burnTime = 2.0; // Engine burn time
    const gravity = 9.81; // m/s²
    const seaLevelAirDensity = 1.225; // kg/m³
    const temperatureLapseRate = 0.0065; // K/m
    const seaLevelTemperature = 288.15; // K (15°C)
    const gasConstant = 287.05; // J/(kg·K)
    const windSpeed = 5; // m/s
    const windDirection = Math.random() * 2 * Math.PI; // Random wind direction
    
    // Rocket parameters with validation
    const initialMass = Math.max(rocket.totalMass / 1000, 0.001); // Convert to kg, ensure minimum mass
    const propellantMass = Math.max(rocket.engine.mass * 0.7 / 1000, 0.001); // Assume 70% of engine mass is propellant
    const massFlowRate = propellantMass / burnTime;
    const crossSectionalArea = Math.PI * Math.pow(Math.max(rocket.body.diameter / 2000, 0.001), 2); // Convert to m²
    
    // Initialize simulation variables
    let time = 0;
    let altitude = 0;
    let velocity = 0;
    let horizontalVelocity = 0;
    let horizontalPosition = 0;
    const data: SimulationData[] = [];

    const simulate = () => {
      // Calculate air density based on altitude using barometric formula
      const temperature = Math.max(seaLevelTemperature - temperatureLapseRate * altitude, 0.1);
      const airDensity = seaLevelAirDensity * Math.pow(temperature / seaLevelTemperature, 4.26);

      // Calculate mass change during burn with validation
      const currentMass = Math.max(
        time < burnTime 
          ? initialMass - massFlowRate * time 
          : initialMass - propellantMass,
        0.001
      );

      // Calculate thrust curve (more realistic)
      const thrust = time < burnTime 
        ? rocket.thrust * Math.max(1 - Math.pow(time / burnTime, 1.5), 0) // Use N, no multiplier
        : 0;

      // Calculate forces
      const weight = currentMass * gravity;
      
      // More accurate drag calculation using Reynolds number
      const kinematicViscosity = 1.5e-5; // m²/s
      const relativeVelocity = Math.sqrt(Math.pow(velocity, 2) + Math.pow(horizontalVelocity, 2));
      const reynoldsNumber = Math.max(relativeVelocity * rocket.body.diameter / 1000 / kinematicViscosity, 0.1);
      
      // Base drag coefficient from rocket design with validation
      const baseDragCoeff = Math.max(rocket.totalDrag * 0.01, 0.001);
      
      // Adjust drag coefficient based on Reynolds number
      let dragCoeff = baseDragCoeff;
      if (reynoldsNumber < 1000) {
        dragCoeff *= 1.5; // Laminar flow
      } else if (reynoldsNumber < 100000) {
        dragCoeff *= 1.2; // Transitional flow
      }
      
      // Calculate drag force with validation
      const drag = 0.5 * airDensity * Math.pow(relativeVelocity, 2) * dragCoeff * crossSectionalArea;
      
      // Calculate wind effects (more realistic)
      const windForce = 0.5 * airDensity * Math.pow(windSpeed, 2) * crossSectionalArea * 0.2;
      const windForceX = windForce * Math.cos(windDirection);
      const windForceY = windForce * Math.sin(windDirection);

      // Calculate stability effects with validation
      const stabilityFactor = Math.max(rocket.stability > 1.5 ? 1 : 0.5, 0.1);
      
      // Net forces with stability consideration and validation
      const netVerticalForce = (thrust - weight - drag * (velocity / Math.max(relativeVelocity, 0.1)) + windForceY) * stabilityFactor;
      const netHorizontalForce = (-drag * (horizontalVelocity / Math.max(relativeVelocity, 0.1)) + windForceX) * stabilityFactor;

      // Update velocities and positions using improved Euler method
      const verticalAcceleration = netVerticalForce / currentMass;
      const horizontalAcceleration = netHorizontalForce / currentMass;
      
      // Update velocities with improved accuracy
      velocity += verticalAcceleration * dt;
      horizontalVelocity += horizontalAcceleration * dt;
      // Cap velocity to a reasonable value (e.g., 200 m/s)
      velocity = Math.min(velocity, 200);
      horizontalVelocity = Math.min(horizontalVelocity, 200);
      
      // Update positions
      altitude += velocity * dt;
      horizontalPosition += horizontalVelocity * dt;
      
      // Check if rocket has landed or reached apogee
      if (altitude < 0) {
        altitude = 0;
        velocity = 0;
        horizontalVelocity = 0;
      }
      // Stop simulation if rocket starts descending (apogee)
      if (velocity < 0 && altitude > 0) {
        setIsSimulating(false);
        setSimulationData(data);
        return;
      }
      
      data.push({
        time,
        altitude,
        velocity: Math.max(0, velocity),
        acceleration: verticalAcceleration,
        horizontalPosition,
        horizontalVelocity
      });
      
      time += dt;
      
      // Continue simulation while rocket is above ground and time < 30s
      if (altitude > 0 && time < 30) {
        requestAnimationFrame(simulate);
      } else {
        setIsSimulating(false);
      }
    };

    simulate();
    setSimulationData(data);
  };

  useEffect(() => {
    if (simulationData.length > 0 && isSimulating) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1;
          if (next >= simulationData.length) {
            setIsSimulating(false);
            return prev;
          }
          
          const currentData = simulationData[next];
          
          // Dynamic camera system - camera follows rocket when it gets high enough
          const followThreshold = 30; // Start following after 30m
          
          if (currentData.altitude > followThreshold) {
            // Camera follows rocket, keeping it in the center portion of the view
            const targetCameraOffset = currentData.altitude - 200; // Keep rocket in middle of 400px view
            setCameraOffset(Math.max(0, targetCameraOffset));
          } else {
            setCameraOffset(0);
          }
          
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [simulationData, isSimulating]);

  const maxAltitude = simulationData.length > 0 ? Math.max(...simulationData.map(d => d.altitude)) : 0;
  const maxVelocity = simulationData.length > 0 ? Math.max(...simulationData.map(d => d.velocity)) : 0;
  const flightTime = simulationData.length > 0 ? simulationData[simulationData.length - 1].time : 0;

  const currentData = simulationData[currentStep] || { time: 0, altitude: 0, velocity: 0, acceleration: 0, horizontalPosition: 0, horizontalVelocity: 0 };

  const getPerformanceRating = () => {
    if (maxAltitude > 100) return { rating: 'Excellent', color: 'text-accent' };
    if (maxAltitude > 50) return { rating: 'Good', color: 'text-primary' };
    if (maxAltitude > 20) return { rating: 'Fair', color: 'text-secondary' };
    return { rating: 'Needs Work', color: 'text-destructive' };
  };

  const performanceRating = getPerformanceRating();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Launch Pad</h1>
          <Button variant="outline" onClick={() => onSectionChange('home')}>
            Back to Mission Control
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Visualization Panel */}
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle>Launch Visualization</CardTitle>
              <CardDescription>
                {cameraOffset > 0 ? `📹 Camera Following - View: ${Math.round(cameraOffset)}m to ${Math.round(cameraOffset + 400)}m` : 'Ground View - Camera will follow rocket above 30m altitude'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[600px] bg-gradient-to-b from-blue-900 via-blue-700 to-green-500 rounded-lg overflow-hidden">
                {/* Dynamic altitude markers based on camera position */}
                <div className="absolute left-2 top-4 text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">
                  {Math.round(cameraOffset + 400)}m
                </div>
                <div className="absolute left-2 top-1/4 text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">
                  {Math.round(cameraOffset + 300)}m
                </div>
                <div className="absolute left-2 top-1/2 text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">
                  {Math.round(cameraOffset + 200)}m
                </div>
                <div className="absolute left-2 top-3/4 text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">
                  {Math.round(cameraOffset + 100)}m
                </div>
                <div className="absolute left-2 bottom-4 text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">
                  {Math.round(cameraOffset)}m
                </div>
                
                {/* Sky background with moving clouds based on camera */}
                <div className="absolute inset-0 opacity-30">
                  <div 
                    className="absolute w-16 h-8 bg-white rounded-full transition-all duration-100"
                    style={{ 
                      top: `${10 + (cameraOffset * 0.1) % 100}px`,
                      left: `${10 + (cameraOffset * 0.05) % 50}px`
                    }}
                  ></div>
                  <div 
                    className="absolute w-12 h-6 bg-white rounded-full transition-all duration-100"
                    style={{ 
                      top: `${80 + (cameraOffset * 0.15) % 100}px`,
                      right: `${16 + (cameraOffset * 0.08) % 60}px`
                    }}
                  ></div>
                  <div 
                    className="absolute w-20 h-10 bg-white rounded-full transition-all duration-100"
                    style={{ 
                      top: `${60 + (cameraOffset * 0.12) % 80}px`,
                      left: `${50 + (cameraOffset * 0.06) % 40}%`
                    }}
                  ></div>
                </div>
                
                {/* Ground - only visible when camera is at low altitude */}
                {cameraOffset < 50 && (
                  <div 
                    className="absolute w-full h-16 bg-green-600 transition-all duration-100"
                    style={{ bottom: `${-cameraOffset * 8}px` }}
                  ></div>
                )}
                
                {/* Launch pad - visible when camera is near ground */}
                {cameraOffset < 100 && (
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gray-600 transition-all duration-100"
                    style={{ bottom: `${16 - cameraOffset * 8}px` }}
                  ></div>
                )}
                
                {/* Rocket - positioned relative to camera view */}
                <div
                  className="absolute transition-all duration-100 ease-linear"
                  style={{ 
                    bottom: `${Math.max(0, (currentData.altitude - cameraOffset) * 1.5)}px`,
                    left: `calc(50% + ${currentData.horizontalPosition * 2}px)`,
                    transform: `translateX(-50%) ${isSimulating ? 'scale(0.8)' : 'scale(1)'}`
                  }}
                >
                  <div className="relative">
                    {/* Rocket body */}
                    <div className="w-6 h-16 bg-gradient-to-b from-primary to-primary/70 rounded-t-full mx-auto"></div>
                    <div className="w-4 h-12 bg-muted mx-auto"></div>
                    <div className="w-8 h-3 bg-accent mx-auto"></div>
                    
                    {/* Flame effect during simulation */}
                    {isSimulating && currentData.time < 2 && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="w-3 h-8 bg-gradient-to-b from-red-500 to-yellow-400 rounded-b-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Altitude and position info overlay */}
                {simulationData.length > 0 && (
                  <>
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                      <div>Altitude: {currentData.altitude.toFixed(1)}m</div>
                      <div>Camera: {cameraOffset > 0 ? 'Following' : 'Ground View'}</div>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                      <div>Distance: {currentData.horizontalPosition.toFixed(1)}m</div>
                      <div>Velocity: {currentData.velocity.toFixed(1)} m/s</div>
                    </div>
                  </>
                )}
                
                {/* Camera following indicator */}
                {cameraOffset > 0 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500/80 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    📹 Camera Following Rocket
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Simulation Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={runSimulation} 
                  disabled={isSimulating}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isSimulating ? 'Launching...' : 'Launch Rocket'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSimulationData([]);
                    setCurrentStep(0);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {isSimulating && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Flight Progress</span>
                    <span>{currentData.time.toFixed(1)}s</span>
                  </div>
                  <Progress value={(currentStep / Math.max(simulationData.length - 1, 1)) * 100} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Current Speed</div>
                  <div className="font-semibold">{currentData.velocity.toFixed(1)} m/s</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Acceleration</div>
                  <div className="font-semibold">{currentData.acceleration.toFixed(1)} m/s²</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Horizontal Speed</div>
                  <div className="font-semibold">{currentData.horizontalVelocity.toFixed(1)} m/s</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Wind Speed</div>
                  <div className="font-semibold">5.0 m/s</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Flight Results</CardTitle>
            </CardHeader>
            <CardContent>
              {simulationData.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
                      <div className="text-2xl font-bold">{maxAltitude.toFixed(1)}m</div>
                      <div className="text-xs text-muted-foreground">Max Altitude</div>
                    </div>
                    <div className="text-center">
                      <Clock className="h-6 w-6 text-secondary mx-auto mb-1" />
                      <div className="text-2xl font-bold">{flightTime.toFixed(1)}s</div>
                      <div className="text-xs text-muted-foreground">Flight Time</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Performance Rating</div>
                    <div className={`text-lg font-bold ${performanceRating.color}`}>
                      {performanceRating.rating}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Max Speed:</span>
                      <span>{maxVelocity.toFixed(1)} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stability:</span>
                      <span className={rocket.stability > 1.5 ? 'text-accent' : 'text-destructive'}>
                        {rocket.stability > 1.5 ? 'Good' : 'Poor'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Launch your rocket to see results!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rocket Design Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Rocket Design</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Nose Cone</div>
                <div className="font-medium">{rocket.nose.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Body</div>
                <div className="font-medium">{rocket.body.diameter}×{rocket.body.length}mm</div>
              </div>
              <div>
                <div className="text-muted-foreground">Fins</div>
                <div className="font-medium">{rocket.fins.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Engine</div>
                <div className="font-medium">{rocket.engine.name}</div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => onSectionChange('build')}
              >
                Modify Design
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RocketSimulation;
