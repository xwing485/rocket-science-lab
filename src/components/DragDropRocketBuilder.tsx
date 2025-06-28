import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Save, Play, Eye, EyeOff } from 'lucide-react';
import { useRocketDesigns } from '@/hooks/useRocketDesigns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface DragDropRocketBuilderProps {
  onSectionChange: (section: string) => void;
  onProgressUpdate: (key: string, value: boolean) => void;
  onRocketUpdate: (rocket: any) => void;
}

const DragDropRocketBuilder = ({ onSectionChange, onProgressUpdate, onRocketUpdate }: DragDropRocketBuilderProps) => {
  const [activeTab, setActiveTab] = useState<'nose' | 'body' | 'fins' | 'engine'>('nose');
  const [selectedParts, setSelectedParts] = useState({ nose: null, body: null, fins: null, engine: null });
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

  const handleSelectPart = (type, part) => {
    setSelectedParts(prev => ({ ...prev, [type]: part }));
  };

  const handleRemovePart = (type) => {
    setSelectedParts(prev => ({ ...prev, [type]: null }));
  };

  const totalMass = Object.values(selectedParts).reduce((sum, part) => sum + part.mass, 0);
  const totalDrag = Object.values(selectedParts).reduce((sum, part) => sum + part.drag, 0);
  const thrust = selectedParts.engine?.thrust || 0;
  const stability = selectedParts.fins?.stability || 0;
  const thrustToWeight = totalMass > 0 ? thrust / (totalMass / 1000 * 9.81) : 0;

  const isComplete = Object.keys(selectedParts).length === 4;

  const handleSaveDesign = async () => {
    const bodyPart = selectedParts.body || { mass: 0, diameter: 24, length: 200 };
    const diameter = bodyPart.diameter || 24;
    const length = bodyPart.length || 200;
    const mass = bodyPart.mass || 0;
    const rocketDesign = {
      nose: selectedParts.nose || null,
      body: { diameter, length, mass },
      fins: selectedParts.fins || null,
      engine: selectedParts.engine || null,
      totalMass,
      totalDrag,
      thrust,
      stability
    };

    setShowSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    if (!designName.trim()) return;

    const bodyPart = selectedParts.body || { mass: 0, diameter: 24, length: 200 };
    const diameter = bodyPart.diameter || 24;
    const length = bodyPart.length || 200;
    const mass = bodyPart.mass || 0;

    const designData = {
      name: designName,
      description: designDescription,
      nose_cone: selectedParts.nose || null,
      body_tube: { diameter, length, mass },
      fins: selectedParts.fins || null,
      engine: selectedParts.engine || null,
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
        nose: selectedParts.nose || null,
        body: { diameter, length, mass },
        fins: selectedParts.fins || null,
        engine: selectedParts.engine || null,
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

  // SVG part styles for preview
  const getPartStyles = (part, type) => {
    if (!part) return {};
    if (type === 'nose') {
      if (part.name.toLowerCase().includes('rounded')) return { color: '#888', shape: 'rounded' };
      if (part.name.toLowerCase().includes('blunt')) return { color: '#c02626', shape: 'blunt' };
      return { color: '#222', shape: 'pointed' };
    }
    if (type === 'body') {
      if (part.diameter >= 30) return { color: '#bae6fd', width: 22 };
      if (part.diameter <= 20) return { color: '#d1d5db', width: 10 };
      return { color: '#e5e7eb', width: 16 };
    }
    if (type === 'fins') {
      if (part.name.toLowerCase().includes('large')) return { color: '#3b82f6', shape: 'large' };
      if (part.name.toLowerCase().includes('swept')) return { color: '#f59e42', shape: 'swept' };
      return { color: '#10b981', shape: 'standard' };
    }
    if (type === 'engine') {
      if (part.name.toLowerCase().includes('b6')) return { color: '#dc2626' };
      if (part.name.toLowerCase().includes('c6')) return { color: '#7c3aed' };
      return { color: '#f97316' };
    }
    return {};
  };

  // Live SVG preview of the current rocket
  const renderRocketPreview = () => {
    const nose = selectedParts.nose;
    const body = selectedParts.body;
    const fins = selectedParts.fins;
    const engine = selectedParts.engine;
    const noseStyle = getPartStyles(nose, 'nose');
    const bodyStyle = getPartStyles(body, 'body');
    const finsStyle = getPartStyles(fins, 'fins');
    const engineStyle = getPartStyles(engine, 'engine');
    const rocketHeight = 120;
    const noseHeight = 24;
    const engineHeight = 18;
    const bodyHeight = 60;
    const bodyWidth = bodyStyle.width || 16;
    let y = 0;
    return (
      <svg width={60} height={rocketHeight + 20} style={{ background: 'none', display: 'block', margin: '0 auto' }}>
        {/* Nose */}
        {nose && noseStyle.shape === 'pointed' && (
          <polygon points={`${bodyWidth/2},${y} 0,${y+noseHeight} ${bodyWidth},${y+noseHeight}`} fill={noseStyle.color} stroke="#111" strokeWidth={2} />
        )}
        {nose && noseStyle.shape === 'rounded' && (
          <ellipse cx={bodyWidth/2} cy={y+noseHeight/2} rx={bodyWidth/2} ry={noseHeight/2} fill={noseStyle.color} stroke="#111" strokeWidth={2} />
        )}
        {nose && noseStyle.shape === 'blunt' && (
          <rect x={0} y={y} width={bodyWidth} height={noseHeight} fill={noseStyle.color} stroke="#111" strokeWidth={2} rx={bodyWidth/3} />
        )}
        {/* Body */}
        {body && (
          <rect x={0} y={y+noseHeight} width={bodyWidth} height={bodyHeight} fill={bodyStyle.color} stroke="#888" strokeWidth={2} />
        )}
        {/* Fins */}
        {fins && finsStyle.shape === 'standard' && (
          <>
            <polygon points={`0,${y+noseHeight+bodyHeight-8} -12,${y+noseHeight+bodyHeight+16} 0,${y+noseHeight+bodyHeight+8}`} fill={finsStyle.color} stroke="#444" strokeWidth={2} />
            <polygon points={`${bodyWidth},${y+noseHeight+bodyHeight-8} ${bodyWidth+12},${y+noseHeight+bodyHeight+16} ${bodyWidth},${y+noseHeight+bodyHeight+8}`} fill={finsStyle.color} stroke="#444" strokeWidth={2} />
          </>
        )}
        {fins && finsStyle.shape === 'large' && (
          <>
            <polygon points={`0,${y+noseHeight+bodyHeight-8} -18,${y+noseHeight+bodyHeight+28} 0,${y+noseHeight+bodyHeight+8}`} fill={finsStyle.color} stroke="#444" strokeWidth={2} />
            <polygon points={`${bodyWidth},${y+noseHeight+bodyHeight-8} ${bodyWidth+18},${y+noseHeight+bodyHeight+28} ${bodyWidth},${y+noseHeight+bodyHeight+8}`} fill={finsStyle.color} stroke="#444" strokeWidth={2} />
          </>
        )}
        {fins && finsStyle.shape === 'swept' && (
          <>
            <polygon points={`0,${y+noseHeight+bodyHeight-8} -10,${y+noseHeight+bodyHeight+24} 8,${y+noseHeight+bodyHeight+8}`} fill={finsStyle.color} stroke="#444" strokeWidth={2} />
            <polygon points={`${bodyWidth},${y+noseHeight+bodyHeight-8} ${bodyWidth+10},${y+noseHeight+bodyHeight+24} ${bodyWidth-8},${y+noseHeight+bodyHeight+8}`} fill={finsStyle.color} stroke="#444" strokeWidth={2} />
          </>
        )}
        {/* Engine */}
        {engine && (
          <rect x={bodyWidth/2 - 6} y={y+noseHeight+bodyHeight} width={12} height={engineHeight} fill={engineStyle.color} stroke="#444" strokeWidth={2} rx={2} />
        )}
      </svg>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Rocket Builder</h1>
            <p className="text-muted-foreground">Design your own rocket by clicking parts in the palette below.</p>
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
                <CardDescription>Click a part to add it to your rocket</CardDescription>
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
                <div className="space-y-2">
                  {parts[activeTab].map((part) => (
                    <div
                      key={part.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer border ${selectedParts[activeTab]?.id === part.id ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-accent/20'}`}
                      onClick={() => handleSelectPart(activeTab, part)}
                    >
                      <div>
                        <div className="font-semibold text-sm">{part.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Drag: {part.drag} | {part.thrust ? `Thrust: ${part.thrust}N | ` : ''}{part.mass}g
                        </div>
                      </div>
                      {selectedParts[activeTab]?.id === part.id && <span className="text-primary font-bold">✓</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="w-full max-w-xs mx-auto flex flex-col items-center">
              <div className="py-4">{renderRocketPreview()}</div>
              <div className="w-full flex flex-col gap-3">
                {['nose', 'body', 'fins', 'engine'].map((type) => (
                  <div key={type} className="flex items-center justify-between bg-blue-800 bg-opacity-60 rounded-lg border-2 border-dashed border-blue-300 px-4 py-2 min-h-[40px]">
                    <span className="text-white font-medium">
                      {selectedParts[type] ? selectedParts[type].name : <span className="opacity-40">Select {type}</span>}
                    </span>
                    {selectedParts[type] && (
                      <button
                        className="ml-2 text-red-400 hover:text-red-600 text-lg font-bold"
                        onClick={() => handleRemovePart(type)}
                        aria-label={`Remove ${selectedParts[type].name}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
