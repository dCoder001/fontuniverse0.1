
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found!');
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    console.log('Fetching models from:', url.replace(apiKey, 'HIDDEN'));
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to list models:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }
    
    const data = await response.json();
    console.log('Available models:');
    if (data.models) {
      data.models.forEach((m: any) => {
        if (m.name.includes('gemini')) {
          console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
        }
      });
    } else {
      console.log('No models found in response:', data);
    }
  } catch (error: any) {
    console.error('Error listing models:', error.message);
  }
}

listModels();
