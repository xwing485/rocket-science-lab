import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Rocket, Settings, Zap, Weight, Wind } from 'lucide-react';

interface RocketPart {
  type: 'nose' | 'body' | 'fins' | 'engine';
  name: string;
  mass: number;
  drag: number;
  thrust?: number;
  stability?: number;
  image?: string;
}

interface RocketBuilderProps {
  onSectionChange: (section: string) => void;
  onProgressUpdate: (key: string, value: boolean) => void;
  onRocketUpdate: (rocket: RocketDesign) => void;
}

interface RocketDesign {
  nose: RocketPart;
  body: { diameter: number; length: number; mass: number };
  fins: RocketPart;
  engine: RocketPart;
  totalMass: number;
  totalDrag: number;
  thrust: number;
  stability: number;
}

const RocketBuilder = ({ onSectionChange, onProgressUpdate, onRocketUpdate }: RocketBuilderProps) => {
  const [selectedNose, setSelectedNose] = useState<RocketPart>({
    type: 'nose',
    name: 'Cone Nose',
    mass: 10,
    drag: 0.5,
    image: 'https://picsum.photos/200/150?random=1'
  });

  const [selectedFins, setSelectedFins] = useState<RocketPart>({
    type: 'fins',
    name: 'Standard Fins',
    mass: 15,
    drag: 0.8,
    stability: 2.0,
    image: 'https://picsum.photos/200/150?random=2'
  });

  const [selectedEngine, setSelectedEngine] = useState<RocketPart>({
    type: 'engine',
    name: 'A8-3 Engine',
    mass: 24,
    drag: 0.1,
    thrust: 2.5,
    image: 'https://picsum.photos/200/150?random=3'
  });

  const [bodyDiameter, setBodyDiameter] = useState([24]);
  const [bodyLength, setBodyLength] = useState([200]);

  const noseCones = [
    { 
      type: 'nose' as const, 
      name: 'Cone Nose', 
      mass: 10, 
      drag: 0.5,
      image: 'https://picsum.photos/200/150?random=1'
    },
    { 
      type: 'nose' as const, 
      name: 'Ogive Nose', 
      mass: 12, 
      drag: 0.4,
      image: 'https://picsum.photos/200/150?random=4'
    },
    { 
      type: 'nose' as const, 
      name: 'Parabolic Nose', 
      mass: 11, 
      drag: 0.45,
      image: 'https://picsum.photos/200/150?random=5'
    }
  ];

  const finSets = [
    { 
      type: 'fins' as const, 
      name: 'Standard Fins', 
      mass: 15, 
      drag: 0.8, 
      stability: 2.0,
      image: 'https://picsum.photos/200/150?random=2'
    },
    { 
      type: 'fins' as const, 
      name: 'Large Fins', 
      mass: 22, 
      drag: 1.2, 
      stability: 3.0,
      image: 'https://picsum.photos/200/150?random=6'
    },
    { 
      type: 'fins' as const, 
      name: 'Swept Fins', 
      mass: 18, 
      drag: 0.9, 
      stability: 2.5,
      image: 'https://picsum.photos/200/150?random=7'
    }
  ];

  const engines = [
    { 
      type: 'engine' as const, 
      name: 'A8-3 Engine', 
      mass: 24, 
      drag: 0.1, 
      thrust: 2.5,
      image: 'https://picsum.photos/200/150?random=3'
    },
    { 
      type: 'engine' as const, 
      name: 'B6-4 Engine', 
      mass: 28, 
      drag: 0.1, 
      thrust: 5.0,
      image: 'https://picsum.photos/200/150?random=8'
    },
    { 
      type: 'engine' as const, 
      name: 'C6-5 Engine', 
      mass: 32, 
      drag: 0.1, 
      thrust: 10.0,
      image: 'https://picsum.photos/200/150?random=9'
    }
  ];

  const bodyMass = (bodyDiameter[0] * bodyLength[0]) / 1000; // Simplified mass calculation
  const totalMass = selectedNose.mass + bodyMass + selectedFins.mass + selectedEngine.mass;
  const totalDrag = selectedNose.drag + (bodyDiameter[0] / 50) + selectedFins.drag + selectedEngine.drag;
  const thrust = selectedEngine.thrust || 0;
  const stability = (selectedFins.stability || 0) * (bodyLength[0] / 200);

  const rocketDesign: RocketDesign = {
    nose: selectedNose,
    body: { diameter: bodyDiameter[0], length: bodyLength[0], mass: bodyMass },
    fins: selectedFins,
    engine: selectedEngine,
    totalMass,
    totalDrag,
    thrust,
    stability
  };

  const handleBuildComplete = () => {
    onProgressUpdate('rocketBuilt', true);
    onRocketUpdate(rocketDesign);
  };

  const thrustToWeightRatio = thrust / (totalMass / 1000 * 9.81);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Rocket Workshop</h1>
          <Button variant="outline" onClick={() => onSectionChange('home')}>
            Back to Mission Control
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Design Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nose Cone Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Rocket className="h-5 w-5 mr-2" />
                  Nose Cone
                </CardTitle>
                <CardDescription>Choose your rocket's nose cone design</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {noseCones.map((nose) => (
                    <Button
                      key={nose.name}
                      variant={selectedNose.name === nose.name ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col space-y-2"
                      onClick={() => setSelectedNose(nose)}
                    >
                      <img 
                        src={nose.image} 
                        alt={nose.name}
                        className="w-full h-20 object-cover rounded bg-muted"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="font-medium text-center">{nose.name}</div>
                      <div className="text-xs text-muted-foreground text-center">
                        {nose.mass}g, {nose.drag} drag
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Body Tube */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Body Tube
                </CardTitle>
                <CardDescription>Adjust your rocket's body dimensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Diameter: {bodyDiameter[0]}mm</label>
                  <Slider
                    value={bodyDiameter}
                    onValueChange={setBodyDiameter}
                    min={18}
                    max={38}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Length: {bodyLength[0]}mm</label>
                  <Slider
                    value={bodyLength}
                    onValueChange={setBodyLength}
                    min={150}
                    max={400}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wind className="h-5 w-5 mr-2" />
                  Fins
                </CardTitle>
                <CardDescription>Select fins for stability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {finSets.map((fins) => (
                    <Button
                      key={fins.name}
                      variant={selectedFins.name === fins.name ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col space-y-2"
                      onClick={() => setSelectedFins(fins)}
                    >
                      <img 
                        src={fins.image} 
                        alt={fins.name}
                        className="w-full h-20 object-cover rounded bg-muted"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="font-medium text-center">{fins.name}</div>
                      <div className="text-xs text-muted-foreground text-center">
                        {fins.mass}g, {fins.stability} stability
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Engine */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Engine
                </CardTitle>
                <CardDescription>Choose your rocket's power source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {engines.map((engine) => (
                    <Button
                      key={engine.name}
                      variant={selectedEngine.name === engine.name ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col space-y-2"
                      onClick={() => setSelectedEngine(engine)}
                    >
                      <img 
                        src={engine.image} 
                        alt={engine.name}
                        className="w-full h-20 object-cover rounded bg-muted"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="font-medium text-center">{engine.name}</div>
                      <div className="text-xs text-muted-foreground text-center">
                        {engine.thrust}N thrust
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Stats Panel */}
          <div className="space-y-6">
            {/* Rocket Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Rocket Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Rocket Visualization */}
                    <div className="w-16 bg-gradient-to-b from-primary to-primary/70 rounded-t-full h-8 mx-auto"></div>
                    <div 
                      className="w-12 bg-muted mx-auto" 
                      style={{ height: `${bodyLength[0] / 5}px` }}
                    ></div>
                    <div className="w-20 h-6 bg-accent mx-auto flex items-end justify-center">
                      <div className="w-8 h-4 bg-secondary rounded-b"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Weight className="h-4 w-4 mr-2" />
                    Total Mass
                  </span>
                  <Badge variant="secondary">{totalMass.toFixed(1)}g</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Thrust
                  </span>
                  <Badge variant="secondary">{thrust}N</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Wind className="h-4 w-4 mr-2" />
                    Stability
                  </span>
                  <Badge 
                    variant={stability > 1.5 ? "default" : "destructive"}
                  >
                    {stability.toFixed(1)}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>T/W Ratio</span>
                  <Badge 
                    variant={thrustToWeightRatio > 5 ? "default" : "secondary"}
                  >
                    {thrustToWeightRatio.toFixed(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" onClick={handleBuildComplete}>
                Save Rocket Design
              </Button>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  handleBuildComplete();
                  onSectionChange('simulate');
                }}
              >
                Build & Launch!
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RocketBuilder;
