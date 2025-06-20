
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRocketDesigns } from '@/hooks/useRocketDesigns';
import { noseCones, finSets, engines } from '@/data/rocketParts';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FloatingChatWidgetProps {
  rocketDesign: any;
  simulationResults: any;
}

const FloatingChatWidget = ({ rocketDesign, simulationResults }: FloatingChatWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI rocket coach. I can analyze your current design, compare it with your saved rockets, and suggest improvements using available parts. Ask me anything!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { designs } = useRocketDesigns();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const prompt = `User question: ${inputText}
      
${rocketDesign ? `Current rocket design:
- Nose: ${rocketDesign.nose.name} (${rocketDesign.nose.mass}g, drag: ${rocketDesign.nose.drag})
- Body: ${rocketDesign.body.diameter}mm × ${rocketDesign.body.length}mm (${rocketDesign.body.mass.toFixed(1)}g)
- Fins: ${rocketDesign.fins.name} (${rocketDesign.fins.mass}g, stability: ${rocketDesign.fins.stability || 'N/A'})
- Engine: ${rocketDesign.engine.name} (${rocketDesign.engine.mass}g, thrust: ${rocketDesign.thrust}N)
- Total Mass: ${rocketDesign.totalMass.toFixed(1)}g
- Stability: ${rocketDesign.stability.toFixed(1)}` : 'No current rocket design'}

${simulationResults ? `Latest simulation results:
- Max Altitude: ${simulationResults.maxAltitude.toFixed(1)}m
- Max Velocity: ${simulationResults.maxVelocity.toFixed(1)}m/s
- Flight Time: ${simulationResults.flightTime.toFixed(1)}s
- Performance: ${simulationResults.performanceRating}` : 'No simulation results available'}

${designs.length > 0 ? `User has ${designs.length} saved designs for comparison and analysis.` : 'No saved designs available'}

Available parts inventory: ${noseCones.length} nose cones, ${finSets.length} fin sets, ${engines.length} engines.

Please provide a helpful answer about model rockets, this specific design, and suggestions for improvement using available parts and comparing with saved designs when relevant.`;

      const { data, error } = await supabase.functions.invoke('rocket-ai-coach', {
        body: { 
          rocketDesign: rocketDesign || {}, 
          simulationResults: simulationResults || {},
          customPrompt: prompt,
          savedDesigns: designs,
          availableParts: { noseCones, finSets, engines }
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.feedback || "I'm sorry, I couldn't generate a response right now.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 h-96 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">AI Rocket Coach</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {designs.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Analyzing {designs.length} saved design{designs.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>
          <CardContent className="flex flex-col h-full p-3">
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-xs ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-2 rounded-lg text-xs flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing your rockets...
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your rockets..."
                className="flex-1 min-h-[60px] text-xs"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                size="icon"
                className="h-[60px] w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FloatingChatWidget;
