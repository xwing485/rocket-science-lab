import { RocketPart } from '@/types/rocket';

export const noseCones: RocketPart[] = [
  { 
    type: 'nose', 
    name: 'Cone Nose', 
    mass: 4, // grams
    drag: 0.5,
    image: '/pointed-nose-cone.png'
  },
  { 
    type: 'nose', 
    name: 'Ogive Nose', 
    mass: 5, // grams
    drag: 0.4,
    image: 'https://picsum.photos/200/150?random=4'
  },
  { 
    type: 'nose', 
    name: 'Parabolic Nose', 
    mass: 5, // grams
    drag: 0.45,
    image: 'https://picsum.photos/200/150?random=5'
  }
];

export const finSets: RocketPart[] = [
  { 
    type: 'fins', 
    name: 'Standard Fins', 
    mass: 3, // grams
    drag: 0.8, 
    stability: 2.0,
    image: 'https://picsum.photos/200/150?random=2'
  },
  { 
    type: 'fins', 
    name: 'Large Fins', 
    mass: 5, // grams
    drag: 1.2, 
    stability: 3.0,
    image: 'https://picsum.photos/200/150?random=6'
  },
  { 
    type: 'fins', 
    name: 'Swept Fins', 
    mass: 4, // grams
    drag: 0.9, 
    stability: 2.5,
    image: 'https://picsum.photos/200/150?random=7'
  }
];

export const engines: RocketPart[] = [
  { 
    type: 'engine', 
    name: 'A8-3 Engine', 
    mass: 7, // grams
    drag: 0.1, 
    thrust: 3.0, // avg thrust in Newtons
    burnTime: 0.5, // seconds
    image: 'https://picsum.photos/200/150?random=3'
  },
  { 
    type: 'engine', 
    name: 'B6-4 Engine', 
    mass: 7, // grams
    drag: 0.1, 
    thrust: 4.3, // avg thrust in Newtons
    burnTime: 0.8, // seconds
    image: 'https://picsum.photos/200/150?random=8'
  },
  { 
    type: 'engine', 
    name: 'C6-5 Engine', 
    mass: 7, // grams
    drag: 0.1, 
    thrust: 5.3, // avg thrust in Newtons
    burnTime: 1.6, // seconds
    image: 'https://picsum.photos/200/150?random=9'
  }
];
