
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket } from 'lucide-react';
import { RocketPart } from '@/types/rocket';
import { noseCones } from '@/data/rocketParts';

interface NoseConeSelectorProps {
  selectedNose: RocketPart;
  onNoseChange: (nose: RocketPart) => void;
}

const NoseConeSelector = ({ selectedNose, onNoseChange }: NoseConeSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Rocket className="h-5 w-5 mr-2" />
          Nose Cone
        </CardTitle>
        <CardDescription>Choose your rocket's nose cone design</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {noseCones.map((nose) => (
            <Button
              key={nose.name}
              variant={selectedNose.name === nose.name ? "default" : "outline"}
              className="h-auto p-3 flex flex-col space-y-2"
              onClick={() => onNoseChange(nose)}
            >
              <img 
                src={nose.image} 
                alt={nose.name}
                className="w-full h-20 object-cover rounded bg-muted"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="font-medium text-center">{nose.name}</div>
              <div className="text-xs text-muted-foreground text-center">
                {nose.mass}g, {nose.drag} drag
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoseConeSelector;
