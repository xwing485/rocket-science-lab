import { RocketPart } from '@/types/rocket';

export const noseCones: RocketPart[] = [
  { 
    type: 'nose', 
    name: 'Cone Nose', 
    mass: 10, 
    drag: 0.5,
    image: '/pointed-nose-cone.png'
  },
  { 
    type: 'nose', 
    name: 'Ogive Nose', 
    mass: 12, 
    drag: 0.4,
    image: 'https://picsum.photos/200/150?random=4'
  },
  { 
    type: 'nose', 
    name: 'Parabolic Nose', 
    mass: 11, 
    drag: 0.45,
    image: 'https://picsum.photos/200/150?random=5'
  }
];

export const finSets: RocketPart[] = [
  { 
    type: 'fins', 
    name: 'Standard Fins', 
    mass: 15, 
    drag: 0.8, 
    stability: 2.0,
    image: 'https://picsum.photos/200/150?random=2'
  },
  { 
    type: 'fins', 
    name: 'Large Fins', 
    mass: 22, 
    drag: 1.2, 
    stability: 3.0,
    image: 'https://picsum.photos/200/150?random=6'
  },
  { 
    type: 'fins', 
    name: 'Swept Fins', 
    mass: 18, 
    drag: 0.9, 
    stability: 2.5,
    image: 'https://picsum.photos/200/150?random=7'
  }
];

export const engines: RocketPart[] = [
  { 
    type: 'engine', 
    name: 'A8-3 Engine', 
    mass: 24, 
    drag: 0.1, 
    thrust: 2.5,
    image: 'https://picsum.photos/200/150?random=3'
  },
  { 
    type: 'engine', 
    name: 'B6-4 Engine', 
    mass: 28, 
    drag: 0.1, 
    thrust: 5.0,
    image: 'https://picsum.photos/200/150?random=8'
  },
  { 
    type: 'engine', 
    name: 'C6-5 Engine', 
    mass: 32, 
    drag: 0.1, 
    thrust: 10.0,
    image: 'https://picsum.photos/200/150?random=9'
  }
];
