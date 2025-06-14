
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Play, Eye, Trash2, Save } from 'lucide-react';

interface RocketDesign {
  id: string;
  name: string;
  nose: { name: string; mass: number; drag: number };
  body: { diameter: number; length: number; mass: number };
  fins: { name: string; mass: number; drag: number; stability?: number };
  engine: { name: string; mass: number; drag: number; thrust?: number };
  totalMass: number;
  totalDrag: number;
  thrust: number;
  stability: number;
  savedAt: string;
}

interface SavedDesignsProps {
  onSectionChange: (section: string) => void;
  onRocketUpdate: (rocket: RocketDesign) => void;
  currentRocket?: RocketDesign | null;
}

const SavedDesigns = ({ onSectionChange, onRocketUpdate, currentRocket }: SavedDesignsProps) => {
  const [savedDesigns, setSavedDesigns] = useState<RocketDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<RocketDesign | null>(null);

  // Load saved designs from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedRocketDesigns');
    if (saved) {
      setSavedDesigns(JSON.parse(saved));
    }
  }, []);

  // Save designs to localStorage whenever savedDesigns changes
  useEffect(() => {
    localStorage.setItem('savedRocketDesigns', JSON.stringify(savedDesigns));
  }, [savedDesigns]);

  const saveCurrentDesign = () => {
    if (!currentRocket) return;

    const designName = prompt('Enter a name for this design:');
    if (!designName) return;

    const newDesign: RocketDesign = {
      ...currentRocket,
      id: Date.now().toString(),
      name: designName,
      savedAt: new Date().toISOString()
    };

    setSavedDesigns(prev => [...prev, newDesign]);
  };

  const deleteDesign = (id: string) => {
    if (confirm('Are you sure you want to delete this design?')) {
      setSavedDesigns(prev => prev.filter(design => design.id !== id));
      if (selectedDesign?.id === id) {
        setSelectedDesign(null);
      }
    }
  };

  const launchDesign = (design: RocketDesign) => {
    onRocketUpdate(design);
    onSectionChange('simulate');
  };

  const getPerformanceRating = (design: RocketDesign) => {
    const thrustToWeight = design.thrust / (design.totalMass / 1000 * 9.81);
    if (thrustToWeight > 5) return { rating: 'Excellent', color: 'text-green-500' };
    if (thrustToWeight > 3) return { rating: 'Good', color: 'text-blue-500' };
    if (thrustToWeight > 1.5) return { rating: 'Fair', color: 'text-yellow-500' };
    return { rating: 'Poor', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Saved Designs</h1>
          <div className="flex gap-2">
            {currentRocket && (
              <Button onClick={saveCurrentDesign}>
                <Save className="h-4 w-4 mr-2" />
                Save Current Design
              </Button>
            )}
            <Button variant="outline" onClick={() => onSectionChange('home')}>
              Back to Mission Control
            </Button>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Design Gallery</TabsTrigger>
            <TabsTrigger value="details">Design Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="space-y-4">
            {savedDesigns.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Saved Designs</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start building rockets and save your designs to see them here!
                  </p>
                  <Button onClick={() => onSectionChange('build')}>
                    Build Your First Rocket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedDesigns.map((design) => {
                  const performance = getPerformanceRating(design);
                  return (
                    <Card key={design.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{design.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDesign(design.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Saved on {new Date(design.savedAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Engine:</span>
                              <div className="font-medium">{design.engine.name}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fins:</span>
                              <div className="font-medium">{design.fins.name}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Mass:</span>
                              <div className="font-medium">{design.totalMass.toFixed(1)}g</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Thrust:</span>
                              <div className="font-medium">{design.thrust}N</div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <span className="text-sm text-muted-foreground">Performance: </span>
                            <span className={`font-semibold ${performance.color}`}>
                              {performance.rating}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => launchDesign(design)}
                              className="flex-1"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Launch
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDesign(design)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            {selectedDesign ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedDesign.name}</CardTitle>
                  <CardDescription>
                    Detailed specifications and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Components</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="font-medium">Nose Cone</div>
                          <div className="text-sm text-muted-foreground">{selectedDesign.nose.name}</div>
                          <div className="text-sm">Mass: {selectedDesign.nose.mass}g | Drag: {selectedDesign.nose.drag}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="font-medium">Body Tube</div>
                          <div className="text-sm">
                            {selectedDesign.body.diameter}mm × {selectedDesign.body.length}mm
                          </div>
                          <div className="text-sm">Mass: {selectedDesign.body.mass.toFixed(1)}g</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="font-medium">Fins</div>
                          <div className="text-sm text-muted-foreground">{selectedDesign.fins.name}</div>
                          <div className="text-sm">
                            Mass: {selectedDesign.fins.mass}g | Stability: {selectedDesign.fins.stability}
                          </div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="font-medium">Engine</div>
                          <div className="text-sm text-muted-foreground">{selectedDesign.engine.name}</div>
                          <div className="text-sm">
                            Thrust: {selectedDesign.engine.thrust}N | Mass: {selectedDesign.engine.mass}g
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Performance Metrics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Mass:</span>
                          <span className="font-medium">{selectedDesign.totalMass.toFixed(1)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Drag:</span>
                          <span className="font-medium">{selectedDesign.totalDrag.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thrust:</span>
                          <span className="font-medium">{selectedDesign.thrust}N</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stability:</span>
                          <span className="font-medium">{selectedDesign.stability.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thrust-to-Weight:</span>
                          <span className="font-medium">
                            {(selectedDesign.thrust / (selectedDesign.totalMass / 1000 * 9.81)).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-6">
                        <Button onClick={() => launchDesign(selectedDesign)} className="flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          Launch This Design
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            onRocketUpdate(selectedDesign);
                            onSectionChange('build');
                          }}
                        >
                          Edit Design
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Design Selected</h3>
                  <p className="text-muted-foreground text-center">
                    Click the view button on any saved design to see detailed specifications
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SavedDesigns;
