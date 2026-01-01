import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Font Universe API is running');
});

// AI Text Generation Endpoint
app.post('/api/generate-text', async (req, res) => {
  const { prompt, type } = req.body;
  try {
    // Use gemini-2.5-flash as it is the current available model (gemini-pro/1.5-flash might be deprecated/renamed in v1beta)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
    const result = await model.generateContent(`Generate ${type} based on: ${prompt}. Return only the text content.`);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Prompt Optimizer Endpoint
app.post('/api/optimize-prompt', async (req, res) => {
  const { prompt, focus, intensity } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
    const systemPrompt = `Act as an expert prompt engineer. Optimize the following prompt for ${focus} with an intensity of ${intensity}%.
Return the response in valid JSON with keys "optimized" and "changes" (array of 3-4 strings).

Original Prompt: "${prompt}"`;

    // Timeout wrapper to avoid long waits
    const withTimeout = <T>(p: Promise<T>, ms = 8000) =>
      new Promise<T>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('AI timeout')), ms);
        p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
      });

    const result = await withTimeout(model.generateContent(systemPrompt));
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from the response (handling potential markdown code blocks)
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    let data: any;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      // Fall back to deterministic optimization if JSON parsing fails
      const fallback = deterministicOptimize(prompt, focus, intensity);
      return res.json(fallback);
    }
    
    // Validate structure
    if (!data.optimized || typeof data.optimized !== 'string') {
      data.optimized = deterministicOptimize(prompt, focus, intensity).optimized;
    }
    if (!Array.isArray(data.changes)) {
      data.changes = deterministicOptimize(prompt, focus, intensity).changes;
    }
    
    res.json({ 
      original: prompt,
      optimized: data.optimized,
      changes: data.changes
    });
  } catch (error) {
    console.error('Gemini Optimization Error:', error);
    // Deterministic fallback on AI errors
    const fallback = deterministicOptimize(prompt, focus, intensity);
    res.json(fallback);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Simple deterministic optimizer to guarantee availability
function deterministicOptimize(prompt: string, focus: string, intensity: number) {
  const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
  const level = clamp(intensity);
  const emphasis = level > 66 ? 'strong' : level > 33 ? 'moderate' : 'light';

  const baseImprovements = [
    'Clarified objectives and outcomes',
    'Added constraints and success criteria',
    'Specified format and structure of output',
    'Removed ambiguous or subjective phrasing'
  ];

  const byFocus: Record<string, string[]> = {
    clarity: [
      'Use precise terminology and avoid ambiguity',
      'Break tasks into explicit steps',
      'Provide examples to illustrate expectations'
    ],
    creativity: [
      'Encourage novel variations and multiple perspectives',
      'Add stylistic constraints for uniqueness',
      'Incorporate metaphor or storytelling elements'
    ],
    technicality: [
      'Include definitions, assumptions, and standards',
      'Require detailed rationale with references',
      'Specify algorithms, complexity, and edge cases'
    ],
    brevity: [
      'Limit word count and remove redundancy',
      'Focus on key points only',
      'Prefer lists over prose where applicable'
    ]
  };

  const improvements = [...baseImprovements.slice(0, 2), ...(byFocus[focus] || byFocus['clarity']).slice(0, 2)];

  const optimized = [
    `[Focus: ${focus}, intensity: ${level}% (${emphasis})]`,
    '',
    'Instructions:',
    ...((byFocus[focus] || byFocus['clarity']).map((s, i) => `${i + 1}. ${s}`)),
    '',
    'Constraints:',
    '- Be explicit, structured, and verifiable',
    '- Avoid ambiguity; define terms when needed',
    '',
    'Original:',
    prompt,
    '',
    'Output format:',
    '- Provide a clear, concise, and actionable response',
    '- Include bullet points and numbered steps if appropriate'
  ].join('\n');

  return {
    original: prompt,
    optimized,
    changes: improvements
  };
}
