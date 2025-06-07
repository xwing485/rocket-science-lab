
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Rocket, Zap, Wind } from 'lucide-react';

interface LearningModuleProps {
  onSectionChange: (section: string) => void;
  progress: { [key: string]: boolean };
  onProgressUpdate: (key: string, value: boolean) => void;
}

const LearningModule = ({ onSectionChange, progress, onProgressUpdate }: LearningModuleProps) => {
  const [currentLesson, setCurrentLesson] = useState(0);

  const lessons = [
    {
      id: 'lesson1',
      title: 'What Makes Rockets Fly?',
      icon: Rocket,
      content: [
        {
          type: 'text',
          content: 'Welcome, future rocket scientist! Have you ever wondered how massive rockets can escape Earth\'s gravity and soar into space? The secret lies in Newton\'s Third Law of Motion.'
        },
        {
          type: 'highlight',
          content: 'Newton\'s Third Law: "For every action, there is an equal and opposite reaction."'
        },
        {
          type: 'text',
          content: 'When a rocket burns fuel, it creates hot gases that shoot out the bottom at incredible speeds. As these gases push down, they create an equal force that pushes the rocket up!'
        },
        {
          type: 'visual',
          content: 'Think of it like blowing up a balloon and letting it go. The air rushes out one way, and the balloon flies the other way!'
        }
      ]
    },
    {
      id: 'lesson2',
      title: 'Rocket Forces & Physics',
      icon: Zap,
      content: [
        {
          type: 'text',
          content: 'Four main forces affect every rocket in flight: Thrust, Weight (Gravity), Drag, and Lift. Understanding these forces is key to building successful rockets.'
        },
        {
          type: 'highlight',
          content: 'Thrust: The force that pushes the rocket forward, created by burning fuel.'
        },
        {
          type: 'highlight',
          content: 'Weight: Gravity pulling the rocket down toward Earth.'
        },
        {
          type: 'highlight',
          content: 'Drag: Air resistance that slows the rocket down.'
        },
        {
          type: 'text',
          content: 'For a rocket to fly successfully, thrust must be greater than weight, and the rocket must be designed to minimize drag while maintaining stability.'
        }
      ]
    },
    {
      id: 'lesson3',
      title: 'Rocket Parts & Design',
      icon: Wind,
      content: [
        {
          type: 'text',
          content: 'Every rocket has essential parts that work together to achieve flight. Let\'s explore the main components and their functions.'
        },
        {
          type: 'highlight',
          content: 'Nose Cone: The pointed tip that cuts through air and reduces drag.'
        },
        {
          type: 'highlight',
          content: 'Body Tube: The main structure that holds everything together.'
        },
        {
          type: 'highlight',
          content: 'Fins: Wing-like parts that provide stability and keep the rocket flying straight.'
        },
        {
          type: 'highlight',
          content: 'Engine: The powerhouse that creates thrust by burning fuel.'
        },
        {
          type: 'text',
          content: 'The shape, size, and arrangement of these parts determine how well your rocket will fly!'
        }
      ]
    }
  ];

  const currentLessonData = lessons[currentLesson];
  const isCompleted = progress[currentLessonData.id];

  const handleNext = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const handlePrevious = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const handleComplete = () => {
    onProgressUpdate(currentLessonData.id, true);
  };

  const progressPercentage = ((currentLesson + 1) / lessons.length) * 100;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Space Academy</h1>
            <Button variant="outline" onClick={() => onSectionChange('home')}>
              Back to Mission Control
            </Button>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Lesson {currentLesson + 1} of {lessons.length}
          </p>
        </div>

        {/* Lesson Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center">
              <currentLessonData.icon className="h-8 w-8 text-primary mr-3" />
              <div>
                <CardTitle className="text-2xl">{currentLessonData.title}</CardTitle>
                <CardDescription>
                  Interactive lesson on rocket science fundamentals
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentLessonData.content.map((section, index) => (
              <div key={index}>
                {section.type === 'text' && (
                  <p className="text-lg leading-relaxed">{section.content}</p>
                )}
                {section.type === 'highlight' && (
                  <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r">
                    <p className="font-semibold text-primary">{section.content}</p>
                  </div>
                )}
                {section.type === 'visual' && (
                  <div className="bg-accent/10 p-6 rounded-lg text-center">
                    <p className="text-lg italic">{section.content}</p>
                    <div className="mt-4">
                      <Rocket className="h-16 w-16 text-accent mx-auto animate-bounce" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentLesson === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!isCompleted && (
              <Button onClick={handleComplete} variant="secondary">
                Mark Complete
              </Button>
            )}
            {isCompleted && (
              <span className="flex items-center text-accent font-medium">
                ✓ Completed
              </span>
            )}
          </div>

          <Button 
            onClick={handleNext}
            disabled={currentLesson === lessons.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Completion Actions */}
        {currentLesson === lessons.length - 1 && isCompleted && (
          <Card className="mt-8 bg-accent/10 border-accent">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">🎉 Congratulations!</h3>
                <p className="mb-4">You've completed all the lessons! Ready to build your first rocket?</p>
                <Button onClick={() => onSectionChange('build')} className="bg-accent hover:bg-accent/90">
                  Go to Rocket Workshop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LearningModule;
