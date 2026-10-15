import type { IncomingMessage, ServerResponse } from 'http';
import { generateGeminiSpeech } from './ttsService';

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url?.split('?')[0];

  if (url === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', model: 'gemini-3.8-flash-tts' }));
    return true;
  }

  if (url === '/api/tts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const text = parsed.text;
        const voiceName = parsed.voiceName || 'Fenrir';

        if (!text || typeof text !== 'string') {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Text is required for TTS generation' }));
          return;
        }

        const result = await generateGeminiSpeech(text, voiceName);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          audioBase64: result.audioBase64,
          mimeType: result.mimeType,
          cached: false
        }));
      } catch (err: unknown) {
        const error = err as Error;
        console.error('API /api/tts error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: error.message || 'Failed to synthesize speech',
          fallback: true
        }));
      }
    });

    return true;
  }

  return false;
}
