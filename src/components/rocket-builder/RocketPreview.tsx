
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RocketPreviewProps {
  bodyLength: number;
}

const RocketPreview = ({ bodyLength }: RocketPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rocket Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="relative">
            {/* Rocket Visualization */}
            <div className="w-16 bg-gradient-to-b from-primary to-primary/70 rounded-t-full h-8 mx-auto"></div>
            <div 
              className="w-12 bg-muted mx-auto" 
              style={{ height: `${bodyLength / 5}px` }}
            ></div>
            <div className="w-20 h-6 bg-accent mx-auto flex items-end justify-center">
              <div className="w-8 h-4 bg-secondary rounded-b"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RocketPreview;
