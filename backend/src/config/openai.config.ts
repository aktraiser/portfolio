import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo-preview", // Modèle compatible avec l'API actuelle
  voice: "alloy" as const, // Voix par défaut
  format: "wav" as const // Format audio par défaut
}; 