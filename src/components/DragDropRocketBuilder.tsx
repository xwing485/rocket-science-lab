import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Save, Play, Eye, EyeOff } from 'lucide-react';
import { useRocketDesigns } from '@/hooks/useRocketDesigns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RocketAssembly3D from './rocket-builder/RocketAssembly3D';

interface RocketPart {
  id: string;
  type: 'nose' | 'body' | 'fins' | 'engine';
  name: string;
  mass: number;
  drag: number;
  thrust?: number;
  stability?: number;
  image?: string;
  diameter?: number;
  length?: number;
}

interface DroppedPart extends RocketPart {
  position: number;
}

interface DragDropRocketBuilderProps {
  onSectionChange: (section: string) => void;
  onProgressUpdate: (key: string, value: boolean) => void;
  onRocketUpdate: (rocket: any) => void;
}

const DragDropRocketBuilder = ({ onSectionChange, onProgressUpdate, onRocketUpdate }: DragDropRocketBuilderProps) => {
  const [activeTab, setActiveTab] = useState<'nose' | 'body' | 'fins' | 'engine'>('nose');
  const [draggedPart, setDraggedPart] = useState<RocketPart | null>(null);
  const [droppedParts, setDroppedParts] = useState<{ [key: number]: RocketPart }>({});
  const [show3DModel, setShow3DModel] = useState(false);
  const { saveDesign } = useRocketDesigns();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [designName, setDesignName] = useState('');
  const [designDescription, setDesignDescription] = useState('');

  const parts = {
    nose: [
      { id: 'pointed-cone', type: 'nose' as const, name: 'Pointed Cone', mass: 10, drag: 0.4, image: '/pointed-nose-cone.png' },
      { id: 'rounded-cone', type: 'nose' as const, name: 'Rounded Cone', mass: 12, drag: 0.5 },
      { id: 'blunt-cone', type: 'nose' as const, name: 'Blunt Cone', mass: 15, drag: 0.7 }
    ],
    body: [
      { id: 'standard-tube', type: 'body' as const, name: 'Standard Tube', mass: 50, drag: 0.3 },
      { id: 'wide-tube', type: 'body' as const, name: 'Wide Tube', mass: 70, drag: 0.4 },
      { id: 'narrow-tube', type: 'body' as const, name: 'Narrow Tube', mass: 35, drag: 0.25 }
    ],
    fins: [
      { id: 'standard-fins', type: 'fins' as const, name: 'Standard Fins', mass: 15, drag: 0.2, stability: 2.0 },
      { id: 'large-fins', type: 'fins' as const, name: 'Large Fins', mass: 25, drag: 0.3, stability: 3.0 },
      { id: 'swept-fins', type: 'fins' as const, name: 'Swept Fins', mass: 20, drag: 0.25, stability: 2.5 }
    ],
    engine: [
      { id: 'a8-engine', type: 'engine' as const, name: 'A8-3 Engine', mass: 24, drag: 0.1, thrust: 2.5 },
      { id: 'b6-engine', type: 'engine' as const, name: 'B6-4 Engine', mass: 28, drag: 0.1, thrust: 5.0 },
      { id: 'c6-engine', type: 'engine' as const, name: 'C6-5 Engine', mass: 32, drag: 0.1, thrust: 10.0 }
    ]
  };

  const handleDragStart = (e: React.DragEvent, part: RocketPart) => {
    setDraggedPart(part);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    if (draggedPart) {
      setDroppedParts(prev => ({
        ...prev,
        [position]: { ...draggedPart, position }
      }));
      setDraggedPart(null);
    }
  };

  const removePart = (position: number) => {
    setDroppedParts(prev => {
      const newParts = { ...prev };
      delete newParts[position];
      return newParts;
    });
  };

  const totalMass = Object.values(droppedParts).reduce((sum, part) => sum + part.mass, 0);
  const totalDrag = Object.values(droppedParts).reduce((sum, part) => sum + part.drag, 0);
  const thrust = droppedParts[3]?.thrust || 0;
  const stability = droppedParts[2]?.stability || 0;
  const thrustToWeight = totalMass > 0 ? thrust / (totalMass / 1000 * 9.81) : 0;

  const isComplete = Object.keys(droppedParts).length === 4;

  const handleSaveDesign = async () => {
    const bodyPart = droppedParts[1] || { mass: 0, diameter: 24, length: 200 };
    const diameter = bodyPart.diameter || 24;
    const length = bodyPart.length || 200;
    const mass = bodyPart.mass || 0;
    const rocketDesign = {
      nose: droppedParts[0] || null,
      body: { diameter, length, mass },
      fins: droppedParts[2] || null,
      engine: droppedParts[3] || null,
      totalMass,
      totalDrag,
      thrust,
      stability
    };

    setShowSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    if (!designName.trim()) return;

    const bodyPart = droppedParts[1] || { mass: 0, diameter: 24, length: 200 };
    const diameter = bodyPart.diameter || 24;
    const length = bodyPart.length || 200;
    const mass = bodyPart.mass || 0;

    const designData = {
      name: designName,
      description: designDescription,
      nose_cone: droppedParts[0] || null,
      body_tube: { diameter, length, mass },
      fins: droppedParts[2] || null,
      engine: droppedParts[3] || null,
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
      onRocketUpdate({
        nose: droppedParts[0] || null,
        body: { diameter, length, mass },
        fins: droppedParts[2] || null,
        engine: droppedParts[3] || null,
        totalMass,
        totalDrag,
        thrust,
        stability
      });
      onProgressUpdate('rocketBuilt', true);
    }
  };

  const handleSimulate = () => {
    handleSaveDesign();
    onSectionChange('simulate');
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Rocket Builder</h1>
            <p className="text-muted-foreground">Design your own rocket by dragging and dropping components.</p>
          </div>
          <Button variant="outline" onClick={() => onSectionChange('home')}>
            Back to Mission Control
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Parts Palette</CardTitle>
                <CardDescription>Drag parts to the assembly area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex border-b mb-4">
                  {(['nose', 'body', 'fins', 'engine'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-2 text-sm font-medium capitalize ${
                        activeTab === tab
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {parts[activeTab].map((part) => (
                    <div
                      key={part.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, part)}
                      className="p-3 border rounded-lg cursor-grab hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{part.name}</h4>
                          <div className="text-sm text-muted-foreground">
                            Drag: {part.drag} |
                            {part.thrust && ` Thrust: ${part.thrust}N |`}
                            {part.stability && ` Stability: ${part.stability}`}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4 text-right">
                          {part.image && (
                            <img
                              src={part.image}
                              alt={part.name}
                              className="w-24 h-24 object-contain rounded bg-muted mb-1"
                            />
                          )}
                          <Badge variant="secondary">{part.mass}g</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Rocket Assembly Area</CardTitle>
                <CardDescription>
                  Drop parts here to build your rocket
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                {show3DModel ? (
                  <RocketAssembly3D
                    droppedParts={droppedParts}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onRemovePart={removePart}
                  />
                ) : (
                  <div className="h-[400px] bg-gradient-to-b from-blue-900 to-blue-300 rounded-lg border-2 border-dashed border-muted-foreground/30 relative">
                    {/* Drop zones for original interface */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 0)}
                      className="absolute top-2 left-2 right-2 h-20 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center text-white text-sm hover:bg-white/10 transition-colors"
                    >
                      {droppedParts[0] ? (
                        <div className="w-full h-full flex items-center justify-center relative p-1">
                          {droppedParts[0].image ? (
                            <div className="flex items-center justify-center w-full">
                              <span className="font-medium text-white text-sm absolute left-2">{droppedParts[0].name}</span>
                              <img src={droppedParts[0].image} alt={droppedParts[0].name} className="h-16 object-contain" />
                            </div>
                          ) : (
                            <div className="font-medium">{droppedParts[0].name}</div>
                          )}
                          <button
                            onClick={() => removePart(0)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        'Drop Nose Cone Here'
                      )}
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 1)}
                      className="absolute top-24 left-2 right-2 h-32 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center text-white text-sm hover:bg-white/10 transition-colors"
                    >
                      {droppedParts[1] ? (
                        <div className="w-full h-full flex items-center justify-center relative p-1">
                          {droppedParts[1].image ? (
                             <div className="flex items-center justify-center w-full">
                              <span className="font-medium text-white text-sm absolute left-2">{droppedParts[1].name}</span>
                              <img src={droppedParts[1].image} alt={droppedParts[1].name} className="h-24 object-contain" />
                            </div>
                          ) : (
                            <div className="font-medium">{droppedParts[1].name}</div>
                          )}
                          <button
                            onClick={() => removePart(1)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        'Drop Body Tube Here'
                      )}
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 2)}
                      className="absolute top-60 left-2 right-2 h-20 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center text-white text-sm hover:bg-white/10 transition-colors"
                    >
                      {droppedParts[2] ? (
                         <div className="w-full h-full flex items-center justify-center relative p-1">
                          {droppedParts[2].image ? (
                             <div className="flex items-center justify-center w-full">
                              <span className="font-medium text-white text-sm absolute left-2">{droppedParts[2].name}</span>
                              <img src={droppedParts[2].image} alt={droppedParts[2].name} className="h-16 object-contain" />
                            </div>
                          ) : (
                            <div className="font-medium">{droppedParts[2].name}</div>
                          )}
                           <button
                            onClick={() => removePart(2)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        'Drop Fins Here'
                      )}
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 3)}
                      className="absolute bottom-2 left-2 right-2 h-20 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center text-white text-sm hover:bg-white/10 transition-colors"
                    >
                      {droppedParts[3] ? (
                         <div className="w-full h-full flex items-center justify-center relative p-1">
                          {droppedParts[3].image ? (
                             <div className="flex items-center justify-center w-full">
                              <span className="font-medium text-white text-sm absolute left-2">{droppedParts[3].name}</span>
                              <img src={droppedParts[3].image} alt={droppedParts[3].name} className="h-16 object-contain" />
                            </div>
                          ) : (
                            <div className="font-medium">{droppedParts[3].name}</div>
                          )}
                          <button
                            onClick={() => removePart(3)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        'Drop Engine Here'
                      )}
                    </div>
                  </div>
                )}

                {!isComplete && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm font-medium">Incomplete Rocket</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add all required parts to complete your rocket design.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Rocket className="h-5 w-5 mr-2" />
                  Rocket Statistics
                </CardTitle>
                <CardDescription>Performance metrics for your rocket design</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Weight</div>
                      <div className="text-lg font-semibold">{totalMass} units</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Thrust</div>
                      <div className="text-lg font-semibold">{thrust} units</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Thrust-to-Weight</div>
                      <div className="text-lg font-semibold">{thrustToWeight.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Drag Coefficient</div>
                      <div className="text-lg font-semibold">{totalDrag.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShow3DModel(!show3DModel)}
                      disabled={Object.keys(droppedParts).length === 0}
                    >
                      {show3DModel ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {show3DModel ? 'Hide 3D Model' : 'View 3D Model'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleSaveDesign}
                      disabled={!isComplete}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Design
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={handleSimulate}
                      disabled={!isComplete}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Simulate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
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
            <Button onClick={handleSaveConfirm} disabled={!designName.trim()}>
              Save Design
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DragDropRocketBuilder;
