import { useState } from 'react';

const partTypes = [
  {
    type: 'nose',
    name: 'Nose Cone',
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <polygon points="20,4 36,36 4,36" fill="#6b21a8" stroke="#4c1d95" strokeWidth="2" />
      </svg>
    ),
  },
  {
    type: 'body',
    name: 'Body Tube',
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect x="12" y="4" width="16" height="32" fill="#bbb" stroke="#888" strokeWidth="2" rx="6" />
      </svg>
    ),
  },
  {
    type: 'fins',
    name: 'Fins',
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <polygon points="12,36 4,36 12,28" fill="#10b981" stroke="#047857" strokeWidth="2" />
        <polygon points="28,36 36,36 28,28" fill="#10b981" stroke="#047857" strokeWidth="2" />
      </svg>
    ),
  },
  {
    type: 'engine',
    name: 'Engine',
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect x="16" y="4" width="8" height="24" fill="#f97316" stroke="#ea580c" strokeWidth="2" rx="3" />
        <polygon points="12,28 28,28 20,36" fill="#ea580c" stroke="#f97316" strokeWidth="2" />
      </svg>
    ),
  },
];

const partOrder = ['nose', 'body', 'fins', 'engine'];

export default function RocketBuilder() {
  const [rocketParts, setRocketParts] = useState([]); // e.g. [{type: 'nose'}, ...]
  const [draggedPart, setDraggedPart] = useState(null);

  // Drag handlers
  const handleDragStart = (type) => setDraggedPart(type);
  const handleDragEnd = () => setDraggedPart(null);

  const handleDrop = () => {
    if (!draggedPart) return;
    // Only allow one of each part type, and in correct order
    const currentTypes = rocketParts.map((p) => p.type);
    const nextIndex = rocketParts.length;
    if (
      !currentTypes.includes(draggedPart) &&
      draggedPart === partOrder[nextIndex]
    ) {
      setRocketParts([...rocketParts, { type: draggedPart }]);
    }
    setDraggedPart(null);
  };

  // SVG for the assembled rocket
  const renderRocketSVG = () => {
    let y = 0;
    const svgParts = rocketParts.map((part, i) => {
      let svg, height;
      if (part.type === 'nose') {
        svg = (
          <polygon key="nose" points="40,0 80,80 0,80" fill="#6b21a8" stroke="#4c1d95" strokeWidth="4" />
        );
        height = 40;
      } else if (part.type === 'body') {
        svg = (
          <rect key="body" x="20" y={y} width="40" height="80" fill="#bbb" stroke="#888" strokeWidth="4" rx="12" />
        );
        height = 80;
      } else if (part.type === 'fins') {
        svg = (
          <>
            <polygon key="finL" points={`20,${y+80} 0,${y+120} 20,${y+120}`} fill="#10b981" stroke="#047857" strokeWidth="4" />
            <polygon key="finR" points={`60,${y+80} 80,${y+120} 60,${y+120}`} fill="#10b981" stroke="#047857" strokeWidth="4" />
          </>
        );
        height = 40;
      } else if (part.type === 'engine') {
        svg = (
          <>
            <rect key="engine" x="30" y={y} width="20" height="32" fill="#f97316" stroke="#ea580c" strokeWidth="4" rx="5" />
            <polygon key="flame" points={`20,${y+32} 60,${y+32} 40,${y+60}`} fill="#ea580c" stroke="#f97316" strokeWidth="2" />
          </>
        );
        height = 28;
      }
      const partSVG = <g key={part.type} transform={`translate(0,${y})`}>{svg}</g>;
      y += height;
      return partSVG;
    });
    return (
      <svg width="80" height="220" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'0\' y=\'0\' width=\'20\' height=\'20\' fill=\'%233b82f6\'/%3E%3Cpath d=\'M0 20H20V0\' stroke=\'%239ca3af\' stroke-width=\'1\'/%3E%3C/svg%3E")', borderRadius: 8 }}>
        {svgParts}
      </svg>
    );
  };

  return (
    <div className="flex h-[400px] max-w-2xl mx-auto p-6">
      {/* Left palette */}
      <div className="flex flex-col gap-4 items-center justify-center bg-slate-800 p-4 rounded-l-lg">
        {partTypes.map((part) => (
          <div
            key={part.type}
            draggable
            onDragStart={() => handleDragStart(part.type)}
            onDragEnd={handleDragEnd}
            className={`cursor-grab bg-slate-700 rounded p-2 mb-2 border-2 ${draggedPart === part.type ? 'border-blue-400' : 'border-transparent'}`}
            title={part.name}
          >
            {part.svg}
            <div className="text-xs text-white text-center mt-1">{part.name}</div>
          </div>
        ))}
      </div>
      {/* Center build area */}
      <div
        className="flex-1 flex items-center justify-center bg-blue-900 relative"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #3b82f6 0, #3b82f6 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 1px, transparent 1px, transparent 20px)' }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {rocketParts.length === 0 ? (
          <div className="text-white opacity-60">Drag parts here to build your rocket</div>
        ) : (
          renderRocketSVG()
        )}
      </div>
    </div>
  );
}
