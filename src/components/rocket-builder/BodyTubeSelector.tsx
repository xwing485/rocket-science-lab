
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';

interface BodyTubeSelectorProps {
  bodyDiameter: number[];
  bodyLength: number[];
  onDiameterChange: (value: number[]) => void;
  onLengthChange: (value: number[]) => void;
}

const BodyTubeSelector = ({ 
  bodyDiameter, 
  bodyLength, 
  onDiameterChange, 
  onLengthChange 
}: BodyTubeSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Body Tube
        </CardTitle>
        <CardDescription>Adjust your rocket's body dimensions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Diameter: {bodyDiameter[0]}mm</label>
          <Slider
            value={bodyDiameter}
            onValueChange={onDiameterChange}
            min={18}
            max={38}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Length: {bodyLength[0]}mm</label>
          <Slider
            value={bodyLength}
            onValueChange={onLengthChange}
            min={150}
            max={400}
            step={10}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BodyTubeSelector;
