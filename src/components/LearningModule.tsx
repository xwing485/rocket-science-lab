import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Rocket, Zap, Wind, BookOpen } from 'lucide-react';
import Quiz from '@/components/Quiz';
import { preQuizQuestions, postQuizQuestions } from '@/data/quizData';

interface LearningModuleProps {
  onSectionChange: (section: string) => void;
  progress: { [key: string]: boolean };
  onProgressUpdate: (key: string, value: boolean) => void;
}

const LearningModule = ({ onSectionChange, progress, onProgressUpdate }: LearningModuleProps) => {
  const [currentStep, setCurrentStep] = useState('pre-quiz');
  const [currentLesson, setCurrentLesson] = useState(0);
  const [quizScores, setQuizScores] = useState<{
    preQuiz?: { score: number; total: number };
    postQuiz?: { score: number; total: number };
  }>({});

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

  const handlePreQuizComplete = (score: number, total: number) => {
    setQuizScores(prev => ({ ...prev, preQuiz: { score, total } }));
    setCurrentStep('lessons');
  };

  const handlePostQuizComplete = (score: number, total: number) => {
    setQuizScores(prev => ({ ...prev, postQuiz: { score, total } }));
    onProgressUpdate('lesson1', true);
    onProgressUpdate('lesson2', true);
    onProgressUpdate('lesson3', true);
    setCurrentStep('complete');
  };

  const handleLessonComplete = () => {
    const currentLessonData = lessons[currentLesson];
    onProgressUpdate(currentLessonData.id, true);
    
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else {
      setCurrentStep('post-quiz');
    }
  };

  const renderPreQuiz = () => (
    <div>
      <div className="mb-8 text-center">
        <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Pre-Learning Assessment</h2>
        <p className="text-muted-foreground">
          Let's see what you already know about rockets! Don't worry - this helps us understand your starting point.
        </p>
      </div>
      <Quiz
        title="Pre-Learning Quiz"
        description="Test your current knowledge about rockets"
        questions={preQuizQuestions}
        onComplete={handlePreQuizComplete}
      />
    </div>
  );

  const renderPostQuiz = () => (
    <div>
      <div className="mb-8 text-center">
        <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Post-Learning Assessment</h2>
        <p className="text-muted-foreground">
          Time to show what you've learned! Let's see how much your knowledge has improved.
        </p>
      </div>
      <Quiz
        title="Post-Learning Quiz"
        description="Test your knowledge after completing the lessons"
        questions={postQuizQuestions}
        onComplete={handlePostQuizComplete}
      />
    </div>
  );

  const renderComplete = () => {
    const preScore = quizScores.preQuiz;
    const postScore = quizScores.postQuiz;
    const improvement = preScore && postScore ? 
      ((postScore.score / postScore.total) - (preScore.score / preScore.total)) * 100 : 0;

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">🎉 Congratulations!</CardTitle>
          <CardDescription>You've completed the Space Academy curriculum!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {preScore && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pre-Learning Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-muted-foreground">
                    {Math.round((preScore.score / preScore.total) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {preScore.score}/{preScore.total} correct
                  </p>
                </CardContent>
              </Card>
            )}
            
            {postScore && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Post-Learning Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {Math.round((postScore.score / postScore.total) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {postScore.score}/{postScore.total} correct
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {improvement > 0 && (
            <Card className="bg-accent/10 border-accent">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-accent mb-2">
                  +{Math.round(improvement)}% Improvement!
                </div>
                <p className="text-sm">You've significantly increased your rocket knowledge!</p>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <p className="mb-4">Ready to put your knowledge into action?</p>
            <Button onClick={() => onSectionChange('build')} className="bg-accent hover:bg-accent/90">
              Go to Rocket Workshop
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLessons = () => {
    const currentLessonData = lessons[currentLesson];
    const isCompleted = progress[currentLessonData.id];
    const progressPercentage = ((currentLesson + 1) / lessons.length) * 100;

    return (
      <div>
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Space Academy Lessons</h1>
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
            onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
            disabled={currentLesson === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button onClick={handleLessonComplete} variant="secondary">
              {currentLesson === lessons.length - 1 ? 'Complete Lessons' : 'Next Lesson'}
            </Button>
          </div>

          <Button 
            onClick={() => setCurrentLesson(Math.min(lessons.length - 1, currentLesson + 1))}
            disabled={currentLesson === lessons.length - 1}
          >
            Skip
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {currentStep === 'pre-quiz' && renderPreQuiz()}
        {currentStep === 'lessons' && renderLessons()}
        {currentStep === 'post-quiz' && renderPostQuiz()}
        {currentStep === 'complete' && renderComplete()}
      </div>
    </div>
  );
};

export default LearningModule;
