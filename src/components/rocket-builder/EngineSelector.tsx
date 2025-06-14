
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { RocketPart } from '@/types/rocket';
import { engines } from '@/data/rocketParts';

interface EngineSelectorProps {
  selectedEngine: RocketPart;
  onEngineChange: (engine: RocketPart) => void;
}

const EngineSelector = ({ selectedEngine, onEngineChange }: EngineSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Engine
        </CardTitle>
        <CardDescription>Choose your rocket's power source</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {engines.map((engine) => (
            <Button
              key={engine.name}
              variant={selectedEngine.name === engine.name ? "default" : "outline"}
              className="h-auto p-3 flex flex-col space-y-2"
              onClick={() => onEngineChange(engine)}
            >
              <img 
                src={engine.image} 
                alt={engine.name}
                className="w-full h-20 object-cover rounded bg-muted"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="font-medium text-center">{engine.name}</div>
              <div className="text-xs text-muted-foreground text-center">
                {engine.thrust}N thrust
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EngineSelector;
