
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RocketPart, RocketDesign, RocketBuilderProps } from '@/types/rocket';
import { noseCones, finSets, engines } from '@/data/rocketParts';
import NoseConeSelector from './rocket-builder/NoseConeSelector';
import BodyTubeSelector from './rocket-builder/BodyTubeSelector';
import FinsSelector from './rocket-builder/FinsSelector';
import EngineSelector from './rocket-builder/EngineSelector';
import RocketPreview from './rocket-builder/RocketPreview';
import PerformanceStats from './rocket-builder/PerformanceStats';

const RocketBuilder = ({ onSectionChange, onProgressUpdate, onRocketUpdate }: RocketBuilderProps) => {
  const [selectedNose, setSelectedNose] = useState<RocketPart>(noseCones[0]);
  const [selectedFins, setSelectedFins] = useState<RocketPart>(finSets[0]);
  const [selectedEngine, setSelectedEngine] = useState<RocketPart>(engines[0]);
  const [bodyDiameter, setBodyDiameter] = useState([24]);
  const [bodyLength, setBodyLength] = useState([200]);

  const bodyMass = (bodyDiameter[0] * bodyLength[0]) / 1000;
  const totalMass = selectedNose.mass + bodyMass + selectedFins.mass + selectedEngine.mass;
  const totalDrag = selectedNose.drag + (bodyDiameter[0] / 50) + selectedFins.drag + selectedEngine.drag;
  const thrust = selectedEngine.thrust || 0;
  const stability = (selectedFins.stability || 0) * (bodyLength[0] / 200);
  const thrustToWeightRatio = thrust / (totalMass / 1000 * 9.81);

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
            <NoseConeSelector 
              selectedNose={selectedNose} 
              onNoseChange={setSelectedNose} 
            />
            
            <BodyTubeSelector
              bodyDiameter={bodyDiameter}
              bodyLength={bodyLength}
              onDiameterChange={setBodyDiameter}
              onLengthChange={setBodyLength}
            />
            
            <FinsSelector 
              selectedFins={selectedFins} 
              onFinsChange={setSelectedFins} 
            />
            
            <EngineSelector 
              selectedEngine={selectedEngine} 
              onEngineChange={setSelectedEngine} 
            />
          </div>

          {/* Preview & Stats Panel */}
          <div className="space-y-6">
            <RocketPreview bodyLength={bodyLength[0]} />
            
            <PerformanceStats
              totalMass={totalMass}
              thrust={thrust}
              stability={stability}
              thrustToWeightRatio={thrustToWeightRatio}
            />

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
