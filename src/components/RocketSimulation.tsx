import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw, TrendingUp, Clock } from 'lucide-react';
import Rocket3DVisualization from './Rocket3DVisualization';
import RocketAICoach from './RocketAICoach';

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

const RocketSimulation = ({ onSectionChange, onProgressUpdate, rocketDesign, onSimulationUpdate }: RocketSimulationProps) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Default rocket if none provided
  const defaultRocket: RocketDesign = {
    nose: { name: 'Pointed Cone', mass: 10, drag: 0.4 },
    body: { diameter: 24, length: 200, mass: 20 },
    fins: { name: 'Standard Fins', mass: 15, drag: 0.2, stability: 2.0 },
    engine: { name: 'A8-3 Engine', mass: 24, drag: 0.1, thrust: 2.5 },
    totalMass: 69,
    totalDrag: 1.4,
    thrust: 2.5,
    stability: 2.0
  };

  const rocket = rocketDesign || defaultRocket;

  const runSimulation = () => {
    console.log('=== SIMULATION START ===');
    console.log('Button clicked, runSimulation called');
    
    // Validate rocket design before simulation
    if (!rocket || !rocket.engine || !rocket.engine.thrust || rocket.engine.thrust <= 0) {
      console.error('Invalid rocket design: Missing or invalid engine thrust');
      return;
    }

    if (rocket.totalMass <= 0) {
      console.error('Invalid rocket design: Total mass must be greater than 0');
      return;
    }

    console.log('Starting simulation with rocket:', rocket);
    console.log('Thrust:', rocket.thrust, 'Mass:', rocket.totalMass);

    setIsSimulating(true);
    setCurrentStep(0);
    onProgressUpdate('simulationRun', true);

    // Physical constants
    const dt = 0.01; // 10ms time step for good balance of accuracy and performance
    const gravity = 9.80665; // Standard gravity (m/s²)
    const seaLevelAirDensity = 1.225; // kg/m³ at sea level
    const temperatureLapseRate = 0.0065; // K/m (standard atmosphere)
    const seaLevelTemperature = 288.15; // K (15°C)
    const gasConstant = 287.05; // J/(kg·K) for air
    const kinematicViscosity = 1.4607e-5; // m²/s at 15°C
    
    // Rocket parameters - calculate from individual components
    const noseMass = rocket.nose.mass / 1000; // kg
    const bodyMass = rocket.body.mass / 1000; // kg
    const finsMass = rocket.fins.mass / 1000; // kg
    const engineMass = rocket.engine.mass / 1000; // kg
    
    const initialMass = noseMass + bodyMass + finsMass + engineMass; // Total mass in kg
    const propellantMass = rocket.engine.mass * 0.75 / 1000; // 75% of engine mass is propellant
    const dryMass = initialMass - propellantMass; // Mass after burn
    const massFlowRate = propellantMass / 2.0; // 2-second burn time
    const burnTime = 2.0; // Engine burn time
    
    console.log('Component masses - Nose:', noseMass, 'Body:', bodyMass, 'Fins:', finsMass, 'Engine:', engineMass, 'kg');
    console.log('Initial mass:', initialMass, 'kg, Dry mass:', dryMass, 'kg');
    console.log('Propellant mass:', propellantMass, 'kg');
    
    // Calculate cross-sectional area (πr²)
    const rocketRadius = rocket.body.diameter / 2000; // Convert mm to m
    const crossSectionalArea = Math.PI * rocketRadius * rocketRadius;
    
    console.log('Cross-sectional area:', crossSectionalArea, 'm²');
    
    // Calculate drag coefficient based on individual components
    const baseDragCoeff = 0.4; // Higher base drag coefficient for realistic model rocket performance
    
    // Component-specific drag contributions
    const noseDragCoeff = rocket.nose.drag * 0.05; // Nose cone contribution
    const bodyDragCoeff = 0.1; // Body tube contribution (higher for realistic drag)
    const finDragCoeff = rocket.fins.drag * 0.15; // Fin contribution (much higher due to surface area)
    const engineDragCoeff = rocket.engine.drag * 0.02; // Engine contribution
    
    // Total drag coefficient
    const totalDragCoeff = baseDragCoeff + noseDragCoeff + bodyDragCoeff + finDragCoeff + engineDragCoeff;
    
    console.log('Drag coefficients - Base:', baseDragCoeff, 'Nose:', noseDragCoeff, 'Body:', bodyDragCoeff, 'Fins:', finDragCoeff, 'Engine:', engineDragCoeff);
    console.log('Total drag coefficient:', totalDragCoeff);
    
    // Initialize simulation variables
    let time = 0;
    let altitude = 0;
    let velocity = 0;
    let horizontalVelocity = 0;
    let horizontalPosition = 0;
    const data: SimulationData[] = [];

    const simulate = () => {
      // Calculate atmospheric properties using International Standard Atmosphere
      const temperature = Math.max(seaLevelTemperature - temperatureLapseRate * altitude, 216.65); // Min temp at tropopause
      const pressure = 101325 * Math.pow(temperature / seaLevelTemperature, 5.256); // Barometric formula
      const airDensity = pressure / (gasConstant * temperature);
      
      // Calculate current mass (decreasing during burn)
      const currentMass = Math.max(
        time < burnTime 
          ? initialMass - massFlowRate * time 
          : dryMass,
        dryMass // Minimum mass (dry mass)
      );

      // Calculate thrust curve (realistic rocket motor curve)
      let thrust = 0;
      if (time < burnTime) {
        // Realistic thrust curve: peak at start, gradual decline
        const burnProgress = time / burnTime;
        // More conservative thrust curve for realistic performance
        thrust = Math.max(rocket.thrust * (0.8 - 0.2 * burnProgress - 0.1 * Math.pow(burnProgress, 2)), rocket.thrust * 0.1);
      }

      // Calculate forces
      const weight = currentMass * gravity;
      
      // Calculate velocity magnitude and direction
      const velocityMagnitude = Math.sqrt(velocity * velocity + horizontalVelocity * horizontalVelocity);
      
      // Calculate Reynolds number for drag coefficient adjustment
      const reynoldsNumber = velocityMagnitude * rocket.body.diameter / 1000 / kinematicViscosity;
      
      // Adjust drag coefficient based on Reynolds number and Mach number
      let adjustedDragCoeff = totalDragCoeff;
      
      // Reynolds number effects
      if (reynoldsNumber < 1000) {
        adjustedDragCoeff *= 1.2; // Laminar flow
      } else if (reynoldsNumber < 100000) {
        adjustedDragCoeff *= 1.05; // Transitional flow
      }
      
      // Mach number effects (compressibility)
      const speedOfSound = Math.sqrt(1.4 * gasConstant * temperature); // γ = 1.4 for air
      const machNumber = velocityMagnitude / speedOfSound;
      
      if (machNumber > 0.8) {
        // Compressibility effects
        adjustedDragCoeff *= (1 + 0.15 * Math.pow(machNumber - 0.8, 2));
      }
      
      // Calculate drag force
      const dragForce = 0.5 * airDensity * velocityMagnitude * velocityMagnitude * adjustedDragCoeff * crossSectionalArea;
      
      // Calculate drag components
      const dragVertical = dragForce * (velocity / Math.max(velocityMagnitude, 0.1));
      const dragHorizontal = dragForce * (horizontalVelocity / Math.max(velocityMagnitude, 0.1));
      
      // Calculate stability effects based on fin design
      const stabilityMargin = rocket.stability || 1.0;
      const stabilityFactor = Math.min(Math.max(stabilityMargin / 2.0, 0.5), 1.5);
      
      // Calculate net forces
      const netVerticalForce = thrust - weight - dragVertical;
      const netHorizontalForce = -dragHorizontal * stabilityFactor;
      
      // Calculate accelerations
      const verticalAcceleration = netVerticalForce / currentMass;
      const horizontalAcceleration = netHorizontalForce / currentMass;
      
      // Update velocities using improved Euler method
      const velocityNew = velocity + verticalAcceleration * dt;
      const horizontalVelocityNew = horizontalVelocity + horizontalAcceleration * dt;
      
      // Update positions using midpoint method for better accuracy
      const altitudeNew = altitude + (velocity + velocityNew) * 0.5 * dt;
      const horizontalPositionNew = horizontalPosition + (horizontalVelocity + horizontalVelocityNew) * 0.5 * dt;
      
      // Update variables
      velocity = velocityNew;
      horizontalVelocity = horizontalVelocityNew;
      altitude = altitudeNew;
      horizontalPosition = horizontalPositionNew;
      
      // Store data point
      data.push({
        time,
        altitude,
        velocity: Math.max(0, velocity),
        acceleration: verticalAcceleration,
        horizontalPosition,
        horizontalVelocity
      });
      
      // Update simulation data in real-time so 3D component can access it
      setSimulationData([...data]);
      setCurrentStep(data.length - 1);
      
      // Debug output every 100 steps (1 second)
      if (Math.floor(time * 100) % 100 === 0) {
        console.log(`Time: ${time.toFixed(2)}s, Altitude: ${altitude.toFixed(2)}m, Velocity: ${velocity.toFixed(2)}m/s, Thrust: ${thrust.toFixed(2)}N, Net Force: ${netVerticalForce.toFixed(2)}N, Mass: ${currentMass.toFixed(3)}kg`);
        console.log(`Data points: ${data.length}, Current step: ${data.length - 1}`);
      }
      
      time += dt;
      
      // Continue simulation conditions - stop at apogee or ground collision
      const hasReachedApogee = velocity < 0 && altitude > 0; // Negative velocity means falling
      const hasHitGround = altitude < 0;
      const timeLimit = time >= 10; // Reduced max time to 10s
      
      const shouldContinue = !hasReachedApogee && !hasHitGround && !timeLimit;
      
      if (shouldContinue) {
        requestAnimationFrame(simulate);
      } else {
        let endReason = '';
        if (hasReachedApogee) endReason = 'apogee reached';
        else if (hasHitGround) endReason = 'ground collision';
        else if (timeLimit) endReason = 'time limit';
        
        console.log(`Simulation ended: ${endReason}. Final altitude: ${altitude.toFixed(2)}m, Final time: ${time.toFixed(2)}s`);
        setIsSimulating(false);
      }
    };

    simulate();
  };

  // Update simulation results when simulation completes
  useEffect(() => {
    if (simulationData.length > 0 && !isSimulating) {
      const maxAltitude = Math.max(...simulationData.map(d => d.altitude));
      const maxVelocity = Math.max(...simulationData.map(d => d.velocity));
      const flightTime = simulationData[simulationData.length - 1].time;
      
      const getPerformanceRating = () => {
        // Realistic model rocket performance ratings
        const thrustToWeight = rocket.thrust / (rocket.totalMass / 1000 * 9.80665);
        
        if (maxAltitude > 200 && thrustToWeight > 5) return 'Outstanding';
        if (maxAltitude > 150 && thrustToWeight > 3) return 'Excellent';
        if (maxAltitude > 100 && thrustToWeight > 2) return 'Good';
        if (maxAltitude > 50 && thrustToWeight > 1.5) return 'Fair';
        if (maxAltitude > 20) return 'Poor';
        return 'Failed';
      };

      const results: SimulationResults = {
        maxAltitude,
        maxVelocity,
        flightTime,
        performanceRating: getPerformanceRating()
      };

      onSimulationUpdate(results);
    }
  }, [simulationData, isSimulating, onSimulationUpdate, rocket]);

  const maxAltitude = simulationData.length > 0 ? Math.max(...simulationData.map(d => d.altitude)) : 0;
  const maxVelocity = simulationData.length > 0 ? Math.max(...simulationData.map(d => d.velocity)) : 0;
  const flightTime = simulationData.length > 0 ? simulationData[simulationData.length - 1].time : 0;

  // Use actual simulation data if available, otherwise use fallback
  const currentData = simulationData.length > 0 && simulationData[currentStep] 
    ? simulationData[currentStep] 
    : { time: 0, altitude: 0, velocity: 0, acceleration: 0, horizontalPosition: 0, horizontalVelocity: 0 };

  // Debug logging
  React.useEffect(() => {
    console.log('Simulation state:', {
      simulationDataLength: simulationData.length,
      currentStep,
      isSimulating,
      currentData,
      hasCurrentData: simulationData.length > 0 && simulationData[currentStep]
    });
  }, [simulationData.length, currentStep, isSimulating, currentData]);

  const getPerformanceRating = () => {
    const thrustToWeight = rocket.thrust / (rocket.totalMass / 1000 * 9.80665);
    
    if (maxAltitude > 200 && thrustToWeight > 5) return { rating: 'Outstanding', color: 'text-green-600' };
    if (maxAltitude > 150 && thrustToWeight > 3) return { rating: 'Excellent', color: 'text-green-500' };
    if (maxAltitude > 100 && thrustToWeight > 2) return { rating: 'Good', color: 'text-blue-500' };
    if (maxAltitude > 50 && thrustToWeight > 1.5) return { rating: 'Fair', color: 'text-yellow-500' };
    if (maxAltitude > 20) return { rating: 'Poor', color: 'text-orange-500' };
    return { rating: 'Failed', color: 'text-red-500' };
  };

  const performanceRating = getPerformanceRating();

  // Prepare simulation results for AI coach
  const simulationResults = simulationData.length > 0 ? {
    maxAltitude,
    maxVelocity,
    flightTime,
    performanceRating: performanceRating.rating
  } : null;

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
          {/* 3D Rocket Visualization */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>3D Rocket Visualization</CardTitle>
              <CardDescription>Watch your rocket launch in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <Rocket3DVisualization 
                currentData={currentData} 
                isSimulating={isSimulating}
                rocketDesign={rocket}
              />
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

        {/* AI Coach Panel */}
        <div className="mt-6">
          <RocketAICoach 
            rocketDesign={rocket}
            simulationResults={simulationResults}
          />
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
