import express from 'express';
import cors from 'cors';
import { VoiceAgentService } from './services/voiceAgent.service';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Instance du service VoiceAgent
const voiceAgent = new VoiceAgentService();

// Routes
app.post('/api/chat/text', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const response = await voiceAgent.processTextInput(text);
    res.json(response);
  } catch (error) {
    console.error('Error processing text chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/audio', async (req, res) => {
  try {
    const { audioData, format } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const response = await voiceAgent.processAudioInput(audioData, format);
    res.json(response);
  } catch (error) {
    console.error('Error processing audio chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/reset', (req, res) => {
  try {
    voiceAgent.clearConversation();
    res.json({ message: 'Conversation reset successfully' });
  } catch (error) {
    console.error('Error resetting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Gestion des erreurs
const startServer = async () => {
  try {
    // Vérifier si le port est disponible
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Gestion gracieuse de l'arrêt
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Trying another port...`);
        server.close();
        // Essayer le port suivant
        app.listen(Number(port) + 1);
      } else {
        console.error('Server error:', error);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 