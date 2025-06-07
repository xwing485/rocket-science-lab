
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, BookOpen, Wrench, Play, Trophy, Star } from 'lucide-react';

interface MissionControlProps {
  onSectionChange: (section: string) => void;
  progress: { [key: string]: boolean };
}

const MissionControl = ({ onSectionChange, progress }: MissionControlProps) => {
  const missions = [
    {
      id: 'learn',
      title: 'Space Academy',
      description: 'Master the science of rockets through interactive lessons',
      icon: BookOpen,
      color: 'bg-cosmic',
      completed: progress.lesson1 && progress.lesson2 && progress.lesson3,
    },
    {
      id: 'build',
      title: 'Rocket Workshop',
      description: 'Design your own rockets with our drag-and-drop builder',
      icon: Wrench,
      color: 'bg-accent',
      completed: progress.rocketBuilt,
    },
    {
      id: 'simulate',
      title: 'Launch Pad',
      description: 'Test your rocket designs with realistic physics',
      icon: Play,
      color: 'bg-rocket',
      completed: progress.simulationRun,
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Rocket className="h-24 w-24 text-primary mx-auto animate-float" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to Rocket Academy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Blast off into the amazing world of rocket science! Learn how rockets work, 
            build your own designs, and watch them soar through realistic simulations.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {missions.map((mission) => {
            const Icon = mission.icon;
            return (
              <Card key={mission.id} className="relative overflow-hidden group hover:scale-105 transition-transform duration-200">
                <div className={`absolute inset-0 opacity-10 ${mission.color}`} />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-primary" />
                    {mission.completed && (
                      <div className="flex items-center text-accent">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="ml-1 text-sm font-medium">Complete</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl">{mission.title}</CardTitle>
                  <CardDescription className="text-base">
                    {mission.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button 
                    className="w-full" 
                    onClick={() => onSectionChange(mission.id)}
                  >
                    {mission.completed ? 'Continue Mission' : 'Start Mission'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Overview */}
        <Card className="bg-space">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-6 w-6 text-primary mr-2" />
              Mission Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {Object.values(progress).filter(Boolean).length}
                </div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">
                  {progress.lesson1 && progress.lesson2 && progress.lesson3 ? '100%' : 
                   Object.values(progress).filter(Boolean).length > 0 ? '33%' : '0%'}
                </div>
                <div className="text-sm text-muted-foreground">Course Complete</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">
                  {progress.rocketBuilt ? '1+' : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Rockets Built</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-rocket">
                  {progress.simulationRun ? '1+' : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Launches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionControl;
