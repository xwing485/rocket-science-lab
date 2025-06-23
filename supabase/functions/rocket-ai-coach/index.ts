
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rocketDesign, simulationResults, customPrompt, savedDesigns, availableParts } = await req.json();

    console.log('Analyzing rocket design:', rocketDesign);
    console.log('Simulation results:', simulationResults);
    console.log('Custom prompt:', customPrompt);
    console.log('Saved designs count:', savedDesigns?.length || 0);
    console.log('Available parts:', availableParts ? Object.keys(availableParts) : 'none');

    let prompt;
    
    if (customPrompt) {
      // Handle chat widget questions
      prompt = customPrompt;
    } else {
      // Handle comprehensive analysis requests with saved designs and available parts
      const savedDesignsAnalysis = savedDesigns && savedDesigns.length > 0 ? `

SAVED DESIGNS ANALYSIS (${savedDesigns.length} designs):
${savedDesigns.map((design: any, index: number) => `
Design ${index + 1}: "${design.name}"
- Nose: ${design.nose_cone.name} (${design.nose_cone.mass}g, drag: ${design.nose_cone.drag})
- Body: ${design.body_tube.diameter}mm × ${design.body_tube.length}mm (${design.body_tube.mass.toFixed(1)}g)
- Fins: ${design.fins.name} (${design.fins.mass}g, stability: ${design.fins.stability})
- Engine: ${design.engine.name} (${design.engine.mass}g, thrust: ${design.engine.thrust}N)
- Total Mass: ${design.performance_stats.totalMass.toFixed(1)}g
- Stability: ${design.performance_stats.stability.toFixed(1)}
- Thrust-to-Weight: ${(design.performance_stats.thrust / (design.performance_stats.totalMass / 1000 * 9.81)).toFixed(1)}
`).join('')}` : 'No saved designs available for comparison.';

      const availablePartsAnalysis = availableParts ? `

AVAILABLE PARTS INVENTORY:
Nose Cones (${availableParts.noseCones?.length || 0}):
${availableParts.noseCones?.map((part: any) => `- ${part.name}: ${part.mass}g, drag: ${part.drag}`).join('\n') || 'None'}

Fin Sets (${availableParts.finSets?.length || 0}):
${availableParts.finSets?.map((part: any) => `- ${part.name}: ${part.mass}g, drag: ${part.drag}, stability: ${part.stability}`).join('\n') || 'None'}

Engines (${availableParts.engines?.length || 0}):
${availableParts.engines?.map((part: any) => `- ${part.name}: ${part.mass}g, thrust: ${part.thrust}N`).join('\n') || 'None'}` : 'No parts inventory available.';

      prompt = `As an expert rocket engineer and coach, analyze this model rocket design comprehensively using simulation results, historical saved designs, and available parts inventory to provide specific, actionable improvement recommendations.

CURRENT ROCKET DESIGN:
- Nose Cone: ${rocketDesign.nose.name} (${rocketDesign.nose.mass}g, drag: ${rocketDesign.nose.drag})
- Body: ${rocketDesign.body.diameter}mm diameter × ${rocketDesign.body.length}mm length (${rocketDesign.body.mass.toFixed(1)}g)
- Fins: ${rocketDesign.fins.name} (${rocketDesign.fins.mass}g, drag: ${rocketDesign.fins.drag})
- Engine: ${rocketDesign.engine.name} (${rocketDesign.engine.mass}g, thrust: ${rocketDesign.thrust}N)
- Total Mass: ${rocketDesign.totalMass.toFixed(1)}g
- Stability: ${rocketDesign.stability.toFixed(1)}
- Thrust-to-Weight Ratio: ${(rocketDesign.thrust / (rocketDesign.totalMass / 1000 * 9.81)).toFixed(1)}

CURRENT SIMULATION RESULTS:
- Max Altitude: ${simulationResults.maxAltitude.toFixed(1)}m
- Max Velocity: ${simulationResults.maxVelocity.toFixed(1)}m/s
- Flight Time: ${simulationResults.flightTime.toFixed(1)}s
- Performance Rating: ${simulationResults.performanceRating}

${savedDesignsAnalysis}

${availablePartsAnalysis}

Please provide a comprehensive analysis including:

1. **Performance Comparison** (compare current design with your saved designs - which performed better and why?)

2. **Specific Part Recommendations** (suggest exact parts from available inventory that would improve performance)

3. **Design Pattern Analysis** (identify trends in your successful vs unsuccessful designs)

4. **Optimization Strategy** (prioritized steps for improvement using available parts)

5. **Expected Performance Gains** (estimate altitude/performance improvements from suggested changes)

Focus on actionable recommendations using the specific parts available in the inventory. Reference your saved designs to show proven combinations that work well.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert rocket engineer and coach specializing in model rockets. Provide detailed, practical advice for improving rocket designs and performance using available parts and historical design data.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: customPrompt ? 400 : 1200,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API response:', response.status, await response.text());
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);
    
    const feedback = data.choices[0]?.message?.content || 'Unable to generate feedback at this time.';

    console.log('Generated feedback:', feedback);

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in rocket-ai-coach function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
