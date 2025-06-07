
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Save, Play } from 'lucide-react';

interface RocketPart {
  id: string;
  type: 'nose' | 'body' | 'fins' | 'engine';
  name: string;
  mass: number;
  drag: number;
  thrust?: number;
  stability?: number;
  image?: string;
}

interface DroppedPart extends RocketPart {
  position: number; // 0 = nose, 1 = body, 2 = fins, 3 = engine
}

interface DragDropRocketBuilderProps {
  onSectionChange: (section: string) => void;
  onProgressUpdate: (key: string, value: boolean) => void;
  onRocketUpdate: (rocket: any) => void;
}

const DragDropRocketBuilder = ({ onSectionChange, onProgressUpdate, onRocketUpdate }: DragDropRocketBuilderProps) => {
  const [activeTab, setActiveTab] = useState<'nose' | 'body' | 'fins' | 'engine'>('nose');
  const [draggedPart, setDraggedPart] = useState<RocketPart | null>(null);
  const [droppedParts, setDroppedParts] = useState<{[key: number]: DroppedPart}>({});

  const parts = {
    nose: [
      { id: 'pointed-cone', type: 'nose' as const, name: 'Pointed Cone', mass: 10, drag: 0.4 },
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

  const handleSaveDesign = () => {
    const rocketDesign = {
      nose: droppedParts[0] || null,
      body: droppedParts[1] || null,
      fins: droppedParts[2] || null,
      engine: droppedParts[3] || null,
      totalMass,
      totalDrag,
      thrust,
      stability
    };
    onRocketUpdate(rocketDesign);
    onProgressUpdate('rocketBuilt', true);
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
          {/* Parts Palette */}
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
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{part.name}</h4>
                        <Badge variant="secondary">{part.mass}g</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Drag: {part.drag} | 
                        {part.thrust && ` Thrust: ${part.thrust}N |`}
                        {part.stability && ` Stability: ${part.stability}`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rocket Assembly Area */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Rocket Assembly Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Nose Cone */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 0)}
                    className="h-20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center relative hover:border-primary/50 transition-colors"
                  >
                    {droppedParts[0] ? (
                      <div className="text-center">
                        <div className="font-medium">{droppedParts[0].name}</div>
                        <div className="text-sm text-muted-foreground">Nose Cone</div>
                        <button
                          onClick={() => removePart(0)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="font-medium">Nose Cone</div>
                        <div className="text-sm">Drop part here</div>
                      </div>
                    )}
                  </div>

                  {/* Body Tube */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 1)}
                    className="h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center relative hover:border-primary/50 transition-colors"
                  >
                    {droppedParts[1] ? (
                      <div className="text-center">
                        <div className="font-medium">{droppedParts[1].name}</div>
                        <div className="text-sm text-muted-foreground">Body Tube</div>
                        <button
                          onClick={() => removePart(1)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="font-medium">Body Tube</div>
                        <div className="text-sm">Drop part here</div>
                      </div>
                    )}
                  </div>

                  {/* Fins */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 2)}
                    className="h-20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center relative hover:border-primary/50 transition-colors"
                  >
                    {droppedParts[2] ? (
                      <div className="text-center">
                        <div className="font-medium">{droppedParts[2].name}</div>
                        <div className="text-sm text-muted-foreground">Fins</div>
                        <button
                          onClick={() => removePart(2)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="font-medium">Fins</div>
                        <div className="text-sm">Drop part here</div>
                      </div>
                    )}
                  </div>

                  {/* Engine */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 3)}
                    className="h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center relative hover:border-primary/50 transition-colors"
                  >
                    {droppedParts[3] ? (
                      <div className="text-center">
                        <div className="font-medium">{droppedParts[3].name}</div>
                        <div className="text-sm text-muted-foreground">Engine</div>
                        <button
                          onClick={() => removePart(3)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="font-medium">Engine</div>
                        <div className="text-sm">Drop part here</div>
                      </div>
                    )}
                  </div>
                </div>

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

          {/* Rocket Statistics */}
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
    </div>
  );
};

export default DragDropRocketBuilder;
