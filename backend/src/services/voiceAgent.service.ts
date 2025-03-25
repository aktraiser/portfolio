import OpenAI from 'openai';
import { openaiConfig } from '../config/openai.config';
import { SYSTEM_PROMPT, FALLBACK_RESPONSE } from '../prompts/agent.prompt';
import { Readable } from 'stream';
import { File } from '@web-std/file';

export class VoiceAgentService {
  private openai: OpenAI;
  private conversationHistory: Array<{ role: 'user' | 'assistant' | 'system', content: string }>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: openaiConfig.apiKey
    });
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
  }

  async processAudioInput(audioData: string, format: string = 'wav'): Promise<{
    text: string;
    audioResponse: Buffer;
  }> {
    try {
      // Convertir la base64 en buffer puis en File
      const audioBuffer = Buffer.from(audioData, 'base64');
      const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

      // Transcrire l'audio en texte
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'text'
      });

      // Ajouter la transcription à l'historique
      this.conversationHistory.push({
        role: 'user',
        content: transcription
      });

      // Obtenir une réponse du modèle
      const completion = await this.openai.chat.completions.create({
        model: openaiConfig.model,
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 500
      });

      const textResponse = completion.choices[0].message.content || FALLBACK_RESPONSE;

      // Générer l'audio de la réponse
      const speechResponse = await this.openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: openaiConfig.voice,
        input: textResponse,
        speed: 1.0
      });

      // Convertir la réponse audio en buffer
      const audioResponseBuffer = Buffer.from(await speechResponse.arrayBuffer());

      // Ajouter la réponse à l'historique
      this.conversationHistory.push({
        role: 'assistant',
        content: textResponse
      });

      return {
        text: textResponse,
        audioResponse: audioResponseBuffer
      };
    } catch (error) {
      console.error('Erreur lors du traitement de l\'audio:', error);
      return {
        text: FALLBACK_RESPONSE,
        audioResponse: Buffer.from('')
      };
    }
  }

  async processTextInput(text: string): Promise<{
    text: string;
    audioResponse: Buffer;
  }> {
    try {
      // Ajouter l'entrée texte à l'historique
      this.conversationHistory.push({
        role: 'user',
        content: text
      });

      // Obtenir une réponse du modèle
      const completion = await this.openai.chat.completions.create({
        model: openaiConfig.model,
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 500
      });

      const textResponse = completion.choices[0].message.content || FALLBACK_RESPONSE;

      // Générer l'audio de la réponse
      const speechResponse = await this.openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: openaiConfig.voice,
        input: textResponse,
        speed: 1.0
      });

      // Convertir la réponse audio en buffer
      const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());

      // Ajouter la réponse à l'historique
      this.conversationHistory.push({
        role: 'assistant',
        content: textResponse
      });

      return {
        text: textResponse,
        audioResponse: audioBuffer
      };
    } catch (error) {
      console.error('Erreur lors du traitement du texte:', error);
      return {
        text: FALLBACK_RESPONSE,
        audioResponse: Buffer.from('')
      };
    }
  }

  clearConversation() {
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
  }
} 