
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Weight, Zap, Wind } from 'lucide-react';

interface PerformanceStatsProps {
  totalMass: number;
  thrust: number;
  stability: number;
  thrustToWeightRatio: number;
}

const PerformanceStats = ({ 
  totalMass, 
  thrust, 
  stability, 
  thrustToWeightRatio 
}: PerformanceStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Weight className="h-4 w-4 mr-2" />
            Total Mass
          </span>
          <Badge variant="secondary">{totalMass.toFixed(1)}g</Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Thrust
          </span>
          <Badge variant="secondary">{thrust}N</Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Wind className="h-4 w-4 mr-2" />
            Stability
          </span>
          <Badge 
            variant={stability > 1.5 ? "default" : "destructive"}
          >
            {stability.toFixed(1)}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span>T/W Ratio</span>
          <Badge 
            variant={thrustToWeightRatio > 5 ? "default" : "secondary"}
          >
            {thrustToWeightRatio.toFixed(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceStats;
