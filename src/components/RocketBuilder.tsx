import { useState } from 'react';
import { noseCones, finSets, engines } from '@/data/rocketParts';

// Simple 2D Rocket Builder (SVG side view, click-to-select)
const bodyOptions = [
  { name: 'Standard Tube', diameter: 24, length: 200, mass: 50 },
  { name: 'Wide Tube', diameter: 30, length: 200, mass: 70 },
  { name: 'Narrow Tube', diameter: 18, length: 200, mass: 35 },
];

export default function RocketBuilder2D() {
  const [selectedNose, setSelectedNose] = useState(noseCones[0]);
  const [selectedBody, setSelectedBody] = useState(bodyOptions[0]);
  const [selectedFins, setSelectedFins] = useState(finSets[0]);
  const [selectedEngine, setSelectedEngine] = useState(engines[0]);

  // SVG dimensions
  const svgWidth = 200;
  const svgHeight = 400;
  // Rocket scaling
  const bodyLengthPx = 200;
  const bodyWidthPx = 24;
  const noseHeightPx = 50;
  const finHeightPx = 30;
  const finWidthPx = 18;
  const engineHeightPx = 30;
  const engineWidthPx = 12;

  // Y positions
  const bodyY = svgHeight / 2 - bodyLengthPx / 2;
  const noseY = bodyY - noseHeightPx;
  const engineY = bodyY + bodyLengthPx;
  const finY = bodyY + bodyLengthPx - 5;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">2D Rocket Builder</h1>
      <div className="flex gap-8">
        {/* Part selectors */}
        <div className="space-y-4">
          <div>
            <div className="font-semibold mb-1">Nose Cone</div>
            {noseCones.map((nose) => (
              <button
                key={nose.name}
                className={`px-2 py-1 rounded border ${selectedNose.name === nose.name ? 'bg-blue-200' : 'bg-white'}`}
                onClick={() => setSelectedNose(nose)}
              >
                {nose.name}
              </button>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-1">Body Tube</div>
            {bodyOptions.map((body) => (
              <button
                key={body.name}
                className={`px-2 py-1 rounded border ${selectedBody.name === body.name ? 'bg-blue-200' : 'bg-white'}`}
                onClick={() => setSelectedBody(body)}
              >
                {body.name}
              </button>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-1">Fins</div>
            {finSets.map((fin) => (
              <button
                key={fin.name}
                className={`px-2 py-1 rounded border ${selectedFins.name === fin.name ? 'bg-blue-200' : 'bg-white'}`}
                onClick={() => setSelectedFins(fin)}
              >
                {fin.name}
              </button>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-1">Engine</div>
            {engines.map((engine) => (
              <button
                key={engine.name}
                className={`px-2 py-1 rounded border ${selectedEngine.name === engine.name ? 'bg-blue-200' : 'bg-white'}`}
                onClick={() => setSelectedEngine(engine)}
              >
                {engine.name}
              </button>
            ))}
          </div>
        </div>
        {/* SVG Rocket Side View */}
        <svg width={svgWidth} height={svgHeight} className="border bg-gray-50 rounded">
          {/* Body */}
          <rect
            x={svgWidth / 2 - bodyWidthPx / 2}
            y={bodyY}
            width={bodyWidthPx}
            height={bodyLengthPx}
            fill="#bbb"
            stroke="#888"
            strokeWidth={2}
            rx={bodyWidthPx / 4}
          />
          {/* Nose Cone (triangle) */}
          <polygon
            points={`
              ${svgWidth / 2 - bodyWidthPx / 2},${bodyY}
              ${svgWidth / 2 + bodyWidthPx / 2},${bodyY}
              ${svgWidth / 2},${noseY}
            `}
            fill="#6b21a8"
            stroke="#4c1d95"
            strokeWidth={2}
          />
          {/* Engine (rectangle) */}
          <rect
            x={svgWidth / 2 - engineWidthPx / 2}
            y={engineY}
            width={engineWidthPx}
            height={engineHeightPx}
            fill="#f97316"
            stroke="#ea580c"
            strokeWidth={2}
            rx={engineWidthPx / 4}
          />
          {/* Fins (trapezoids) */}
          <polygon
            points={`
              ${svgWidth / 2 - bodyWidthPx / 2},${finY}
              ${svgWidth / 2 - bodyWidthPx / 2 - finWidthPx},${finY + finHeightPx}
              ${svgWidth / 2 - bodyWidthPx / 2},${finY + finHeightPx}
            `}
            fill="#10b981"
            stroke="#047857"
            strokeWidth={2}
          />
          <polygon
            points={`
              ${svgWidth / 2 + bodyWidthPx / 2},${finY}
              ${svgWidth / 2 + bodyWidthPx / 2 + finWidthPx},${finY + finHeightPx}
              ${svgWidth / 2 + bodyWidthPx / 2},${finY + finHeightPx}
            `}
            fill="#10b981"
            stroke="#047857"
            strokeWidth={2}
          />
        </svg>
      </div>
    </div>
  );
}
