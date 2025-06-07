import { useState } from 'react';
import Navigation from '@/components/Navigation';
import MissionControl from '@/components/MissionControl';
import LearningModule from '@/components/LearningModule';
import DragDropRocketBuilder from '@/components/DragDropRocketBuilder';
import RocketSimulation from '@/components/RocketSimulation';

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

const Index = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [progress, setProgress] = useState({
    lesson1: false,
    lesson2: false,
    lesson3: false,
    rocketBuilt: false,
    simulationRun: false,
  });
  const [rocketDesign, setRocketDesign] = useState<RocketDesign | null>(null);

  const handleProgressUpdate = (key: string, value: boolean) => {
    setProgress(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRocketUpdate = (rocket: RocketDesign) => {
    setRocketDesign(rocket);
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'learn':
        return (
          <LearningModule 
            onSectionChange={setCurrentSection}
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
          />
        );
      case 'build':
        return (
          <DragDropRocketBuilder 
            onSectionChange={setCurrentSection}
            onProgressUpdate={handleProgressUpdate}
            onRocketUpdate={handleRocketUpdate}
          />
        );
      case 'simulate':
        return (
          <RocketSimulation 
            onSectionChange={setCurrentSection}
            onProgressUpdate={handleProgressUpdate}
            rocketDesign={rocketDesign}
          />
        );
      case 'progress':
        return (
          <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Your Progress</h1>
              <div className="grid gap-4">
                {Object.entries(progress).map(([key, completed]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-card rounded-lg">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={completed ? 'text-accent' : 'text-muted-foreground'}>
                      {completed ? '✓ Complete' : 'Not Started'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <MissionControl 
            onSectionChange={setCurrentSection}
            progress={progress}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      {renderCurrentSection()}
    </div>
  );
};

export default Index;
