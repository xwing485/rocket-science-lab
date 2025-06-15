
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket, Play, Eye, Trash2, Save, LogIn } from 'lucide-react';
import { useRocketDesigns } from '@/hooks/useRocketDesigns';
import { supabase } from '@/integrations/supabase/client';
import Auth from './Auth';

interface BasicRocketDesign {
  nose: { name: string; mass: number; drag: number };
  body: { diameter: number; length: number; mass: number };
  fins: { name: string; mass: number; drag: number; stability?: number };
  engine: { name: string; mass: number; drag: number; thrust?: number };
  totalMass: number;
  totalDrag: number;
  thrust: number;
  stability: number;
}

interface SavedRocketDesign extends BasicRocketDesign {
  id: string;
  name: string;
  savedAt: string;
}

interface SavedDesignsProps {
  onSectionChange: (section: string) => void;
  onRocketUpdate: (rocket: BasicRocketDesign) => void;
  currentRocket?: BasicRocketDesign | null;
}

const SavedDesigns = ({ onSectionChange, onRocketUpdate, currentRocket }: SavedDesignsProps) => {
  const { designs, loading, saveDesign, deleteDesign } = useRocketDesigns();
  const [selectedDesign, setSelectedDesign] = useState<any | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [designName, setDesignName] = useState('');
  const [designDescription, setDesignDescription] = useState('');

  useEffect(() => {
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
  }, []);

  const handleSaveDesign = async () => {
    if (!currentRocket || !user) return;

    const designData = {
      name: designName,
      description: designDescription,
      nose_cone: currentRocket.nose,
      body_tube: currentRocket.body,
      fins: currentRocket.fins,
      engine: currentRocket.engine,
      performance_stats: {
        totalMass: currentRocket.totalMass,
        totalDrag: currentRocket.totalDrag,
        thrust: currentRocket.thrust,
        stability: currentRocket.stability
      }
    };

    const result = await saveDesign(designData);
    if (result) {
      setShowSaveDialog(false);
      setDesignName('');
      setDesignDescription('');
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (confirm('Are you sure you want to delete this design?')) {
      await deleteDesign(id);
      if (selectedDesign?.id === id) {
        setSelectedDesign(null);
      }
    }
  };

  const launchDesign = (design: any) => {
    const rocketDesign: BasicRocketDesign = {
      nose: design.nose_cone,
      body: design.body_tube,
      fins: design.fins,
      engine: design.engine,
      totalMass: design.performance_stats.totalMass,
      totalDrag: design.performance_stats.totalDrag,
      thrust: design.performance_stats.thrust,
      stability: design.performance_stats.stability
    };
    onRocketUpdate(rocketDesign);
    onSectionChange('simulate');
  };

  const getPerformanceRating = (design: any) => {
    const thrustToWeight = design.performance_stats.thrust / (design.performance_stats.totalMass / 1000 * 9.81);
    if (thrustToWeight > 5) return { rating: 'Excellent', color: 'text-green-500' };
    if (thrustToWeight > 3) return { rating: 'Good', color: 'text-blue-500' };
    if (thrustToWeight > 1.5) return { rating: 'Fair', color: 'text-yellow-500' };
    return { rating: 'Poor', color: 'text-red-500' };
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Saved Designs</h1>
            <Button variant="outline" onClick={() => onSectionChange('home')}>
              Back to Mission Control
            </Button>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LogIn className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
              <p className="text-muted-foreground text-center mb-4">
                Sign in to save and access your rocket designs across devices!
              </p>
              <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                <DialogTrigger asChild>
                  <Button>Sign In / Sign Up</Button>
                </DialogTrigger>
                <DialogContent>
                  <Auth onSuccess={() => setShowAuthDialog(false)} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Saved Designs</h1>
          <div className="flex gap-2">
            {currentRocket && (
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Current Design
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
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading your designs...</p>
                  </div>
                </CardContent>
              </Card>
            ) : designs.length === 0 ? (
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
                {designs.map((design) => {
                  const performance = getPerformanceRating(design);
                  return (
                    <Card key={design.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{design.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDesign(design.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Saved on {new Date(design.created_at).toLocaleDateString()}
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
                              <div className="font-medium">{design.performance_stats.totalMass.toFixed(1)}g</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Thrust:</span>
                              <div className="font-medium">{design.performance_stats.thrust}N</div>
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
                    {selectedDesign.description || 'Detailed specifications and performance metrics'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Components</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="font-medium">Nose Cone</div>
                          <div className="text-sm text-muted-foreground">{selectedDesign.nose_cone.name}</div>
                          <div className="text-sm">Mass: {selectedDesign.nose_cone.mass}g | Drag: {selectedDesign.nose_cone.drag}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="font-medium">Body Tube</div>
                          <div className="text-sm">
                            {selectedDesign.body_tube.diameter}mm × {selectedDesign.body_tube.length}mm
                          </div>
                          <div className="text-sm">Mass: {selectedDesign.body_tube.mass.toFixed(1)}g</div>
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
                          <span className="font-medium">{selectedDesign.performance_stats.totalMass.toFixed(1)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Drag:</span>
                          <span className="font-medium">{selectedDesign.performance_stats.totalDrag.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thrust:</span>
                          <span className="font-medium">{selectedDesign.performance_stats.thrust}N</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stability:</span>
                          <span className="font-medium">{selectedDesign.performance_stats.stability.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thrust-to-Weight:</span>
                          <span className="font-medium">
                            {(selectedDesign.performance_stats.thrust / (selectedDesign.performance_stats.totalMass / 1000 * 9.81)).toFixed(1)}
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
                            const rocketDesign: BasicRocketDesign = {
                              nose: selectedDesign.nose_cone,
                              body: selectedDesign.body_tube,
                              fins: selectedDesign.fins,
                              engine: selectedDesign.engine,
                              totalMass: selectedDesign.performance_stats.totalMass,
                              totalDrag: selectedDesign.performance_stats.totalDrag,
                              thrust: selectedDesign.performance_stats.thrust,
                              stability: selectedDesign.performance_stats.stability
                            };
                            onRocketUpdate(rocketDesign);
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
