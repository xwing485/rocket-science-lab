import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind } from 'lucide-react';
import { RocketPart } from '@/types/rocket';
import { finSets } from '@/data/rocketParts';

interface FinsSelectorProps {
  selectedFins: RocketPart;
  onFinsChange: (fins: RocketPart) => void;
  finCount: number;
  onFinCountChange: (count: number) => void;
}

const FinsSelector = ({ selectedFins, onFinsChange, finCount, onFinCountChange }: FinsSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wind className="h-5 w-5 mr-2" />
          Fins
        </CardTitle>
        <CardDescription>Select fins for stability</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Number of Fins</label>
          <select
            className="border rounded px-2 py-1"
            value={finCount}
            onChange={e => onFinCountChange(Number(e.target.value))}
          >
            {[3, 4, 5].map(n => (
              <option key={n} value={n}>{n} fins</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {finSets.map((fins) => (
            <Button
              key={fins.name}
              variant={selectedFins.name === fins.name ? "default" : "outline"}
              className="h-auto p-3 flex flex-col space-y-2"
              onClick={() => onFinsChange(fins)}
            >
              <img 
                src={fins.image} 
                alt={fins.name}
                className="w-full h-20 object-cover rounded bg-muted"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="font-medium text-center">{fins.name}</div>
              <div className="text-xs text-muted-foreground text-center">
                {fins.mass}g, {fins.stability} stability
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinsSelector;
