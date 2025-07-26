
export interface RocketPart {
  type: 'nose' | 'body' | 'fins' | 'engine';
  name: string;
  mass: number;
  drag: number;
  thrust?: number;
  burnTime?: number;
  stability?: number;
  image?: string;
}

export interface RocketDesign {
  nose: RocketPart;
  body: { diameter: number; length: number; mass: number };
  fins: RocketPart;
  engine: RocketPart;
  totalMass: number;
  totalDrag: number;
  thrust: number;
  stability: number;
}

export interface RocketBuilderProps {
  onSectionChange: (section: string) => void;
  onProgressUpdate: (key: string, value: boolean) => void;
  onRocketUpdate: (rocket: RocketDesign) => void;
}
