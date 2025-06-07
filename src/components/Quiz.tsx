
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizProps {
  title: string;
  description: string;
  questions: QuizQuestion[];
  onComplete: (score: number, totalQuestions: number) => void;
  onRetake?: () => void;
}

const Quiz = ({ title, description, questions, onComplete, onRetake }: QuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    setQuizCompleted(true);
    
    const correctAnswers = questions.reduce((count, question, index) => {
      return selectedAnswers[index] === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    onComplete(correctAnswers, questions.length);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
    onRetake?.();
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== undefined;

  if (showResults) {
    const score = questions.reduce((count, question, index) => {
      return selectedAnswers[index] === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Results</CardTitle>
          <CardDescription>Here's how you did!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-xl text-muted-foreground">
              {percentage}% Correct
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((question, questionIndex) => {
              const userAnswer = selectedAnswers[questionIndex];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <Card key={question.id} className={isCorrect ? 'border-accent' : 'border-destructive'}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">{question.question}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Your answer: {question.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-accent mb-2">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm bg-muted p-2 rounded">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button onClick={handleRetake} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">
            {currentQuestionData.question}
          </h3>
          
          <RadioGroup
            value={selectedAnswers[currentQuestion]?.toString()}
            onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
          >
            {currentQuestionData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!isAnswered}
          >
            {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Quiz;
