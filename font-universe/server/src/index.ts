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
    Return the response in valid JSON format with the following structure:
    {
      "optimized": "the optimized prompt text",
      "changes": ["list of 3-4 specific improvements made"]
    }
    
    Original Prompt: "${prompt}"`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from the response (handling potential markdown code blocks)
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(jsonStr);
    
    res.json({ 
      original: prompt,
      optimized: data.optimized,
      changes: data.changes
    });
  } catch (error) {
    console.error('Gemini Optimization Error:', error);
    res.status(500).json({ error: 'Failed to optimize prompt' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
