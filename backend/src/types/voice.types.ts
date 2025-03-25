export interface AudioResponse {
  text: string;
  audioResponse: Buffer;
}

export interface VoiceAgentConfig {
  apiKey: string;
  model: string;
  voice: string;
  format: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}

export interface MessageContent {
  type: 'text' | 'input_audio';
  text?: string;
  input_audio?: {
    data: string;
    format: string;
  };
}

export interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
      audio?: {
        data: string;
      };
    };
  }>;
} 