import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { generateGeminiSpeech } from './server/ttsService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: 'gemini-3.8-flash-tts' });
});

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS generation' });
      return;
    }

    const result = await generateGeminiSpeech(text, voiceName || 'Fenrir');
    res.json({
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      cached: false,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Server TTS error:', error);
    res.status(500).json({
      error: error.message || 'TTS generation failed',
      fallback: true,
    });
  }
});

// Serve static frontend in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
