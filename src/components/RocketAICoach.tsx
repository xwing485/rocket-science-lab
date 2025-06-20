
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRocketDesigns } from '@/hooks/useRocketDesigns';
import { noseCones, finSets, engines } from '@/data/rocketParts';

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

interface SimulationResults {
  maxAltitude: number;
  maxVelocity: number;
  flightTime: number;
  performanceRating: string;
}

interface RocketAICoachProps {
  rocketDesign: RocketDesign | null;
  simulationResults: SimulationResults | null;
}

const RocketAICoach = ({ rocketDesign, simulationResults }: RocketAICoachProps) => {
  const [feedback, setFeedback] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { designs } = useRocketDesigns();

  const analyzeFeedback = async () => {
    if (!rocketDesign || !simulationResults) {
      toast({
        title: "Missing Data",
        description: "Please build a rocket and run a simulation first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setFeedback('');

    try {
      console.log('Calling AI coach with comprehensive data:', { 
        rocketDesign, 
        simulationResults, 
        savedDesigns: designs,
        availableParts: { noseCones, finSets, engines }
      });
      
      const { data, error } = await supabase.functions.invoke('rocket-ai-coach', {
        body: { 
          rocketDesign, 
          simulationResults,
          savedDesigns: designs,
          availableParts: { noseCones, finSets, engines }
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('AI coach response:', data);
      setFeedback(data.feedback);
      
      toast({
        title: "Analysis Complete!",
        description: "Your AI coach has analyzed your rocket design with historical data.",
      });
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze your rocket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = rocketDesign && simulationResults;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Rocket Coach
        </CardTitle>
        <CardDescription>
          Get personalized feedback based on your rocket design, flight performance, saved designs, and available parts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={analyzeFeedback} 
          disabled={!canAnalyze || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Your Rocket Collection...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-2" />
              Get Comprehensive AI Analysis
            </>
          )}
        </Button>

        {!canAnalyze && (
          <p className="text-sm text-muted-foreground text-center">
            Build a rocket and run a simulation to get AI feedback
          </p>
        )}

        {designs.length > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            Will analyze {designs.length} saved design{designs.length !== 1 ? 's' : ''} and {noseCones.length + finSets.length + engines.length} available parts
          </div>
        )}

        {feedback && (
          <div className="space-y-3">
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Coach Feedback
              </h4>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">
                  {feedback}
                </pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RocketAICoach;
