
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
    const { rocketDesign, simulationResults } = await req.json();

    console.log('Analyzing rocket design:', rocketDesign);
    console.log('Simulation results:', simulationResults);

    const prompt = `As an expert rocket engineer and coach, analyze this model rocket design and simulation results. Provide specific, actionable feedback to help improve performance.

ROCKET DESIGN:
- Nose Cone: ${rocketDesign.nose.name} (${rocketDesign.nose.mass}g, drag: ${rocketDesign.nose.drag})
- Body: ${rocketDesign.body.diameter}mm diameter × ${rocketDesign.body.length}mm length (${rocketDesign.body.mass.toFixed(1)}g)
- Fins: ${rocketDesign.fins.name} (${rocketDesign.fins.mass}g, drag: ${rocketDesign.fins.drag})
- Engine: ${rocketDesign.engine.name} (${rocketDesign.engine.mass}g, thrust: ${rocketDesign.thrust}N)
- Total Mass: ${rocketDesign.totalMass.toFixed(1)}g
- Stability: ${rocketDesign.stability.toFixed(1)}
- Thrust-to-Weight Ratio: ${(rocketDesign.thrust / (rocketDesign.totalMass / 1000 * 9.81)).toFixed(1)}

SIMULATION RESULTS:
- Max Altitude: ${simulationResults.maxAltitude.toFixed(1)}m
- Max Velocity: ${simulationResults.maxVelocity.toFixed(1)}m/s
- Flight Time: ${simulationResults.flightTime.toFixed(1)}s
- Performance Rating: ${simulationResults.performanceRating}

Please provide:
1. **Overall Assessment** (2-3 sentences)
2. **Specific Improvements** (3-4 bullet points with concrete suggestions)
3. **Design Trade-offs** (explain key compromises and alternatives)
4. **Next Steps** (prioritized recommendations)

Keep responses practical for model rocket enthusiasts. Focus on achievable improvements using common rocket parts.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert model rocket engineer and coach. Provide specific, actionable feedback to help users improve their rocket designs and performance. Be encouraging but honest about areas for improvement.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;

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
