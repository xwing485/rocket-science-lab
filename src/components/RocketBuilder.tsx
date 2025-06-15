
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { RocketPart, RocketDesign, RocketBuilderProps } from '@/types/rocket';
import { noseCones, finSets, engines } from '@/data/rocketParts';
import { useRocketDesigns } from '@/hooks/useRocketDesigns';
import { supabase } from '@/integrations/supabase/client';
import Auth from './Auth';
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
  const [user, setUser] = useState<any>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [designName, setDesignName] = useState('');
  const [designDescription, setDesignDescription] = useState('');

  const { saveDesign } = useRocketDesigns();

  // Check auth status
  useState(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN') {
        setShowAuthDialog(false);
      }
    });

    return () => subscription.unsubscribe();
  });

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

  const handleSaveDesign = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const designData = {
      name: designName,
      description: designDescription,
      nose_cone: selectedNose,
      body_tube: { diameter: bodyDiameter[0], length: bodyLength[0], mass: bodyMass },
      fins: selectedFins,
      engine: selectedEngine,
      performance_stats: {
        totalMass,
        totalDrag,
        thrust,
        stability
      }
    };

    const result = await saveDesign(designData);
    if (result) {
      setShowSaveDialog(false);
      setDesignName('');
      setDesignDescription('');
      onProgressUpdate('rocketBuilt', true);
      onRocketUpdate(rocketDesign);
    }
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
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Rocket Design
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Rocket Design</DialogTitle>
                    <DialogDescription>
                      Give your rocket design a name and optional description.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Design Name</Label>
                      <Input
                        id="name"
                        value={designName}
                        onChange={(e) => setDesignName(e.target.value)}
                        placeholder="Enter design name..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input
                        id="description"
                        value={designDescription}
                        onChange={(e) => setDesignDescription(e.target.value)}
                        placeholder="Enter description..."
                      />
                    </div>
                    <Button onClick={handleSaveDesign} disabled={!designName.trim()}>
                      Save Design
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

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

        {/* Auth Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign In Required</DialogTitle>
              <DialogDescription>
                Sign in to save your rocket designs and access them across devices!
              </DialogDescription>
            </DialogHeader>
            <Auth onSuccess={() => setShowAuthDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RocketBuilder;
