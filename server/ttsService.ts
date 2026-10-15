import { GoogleGenAI } from '@google/genai';

// In-memory cache for generated TTS audio to save API quota and latency
const audioCache = new Map<string, { audioBase64: string; mimeType: string }>();

function getCacheKey(text: string, voiceName: string): string {
  // Hash or simple key
  const cleaned = text.trim().slice(0, 150) + `_${text.length}_${voiceName}`;
  return cleaned;
}

export async function generateGeminiSpeech(
  text: string,
  voiceName: string = 'Fenrir'
): Promise<{ audioBase64: string; mimeType: string }> {
  const cacheKey = getCacheKey(text, voiceName);
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Clean prompt text for narrator: exclude markdown, bracketed instructions, footnotes
  const cleanNarrationText = text
    .replace(/\[\d+\]/g, '') // remove footnote markers [1], [2]
    .replace(/\[আবহসুর:[^\]]*\]/g, '') // remove stage cues
    .replace(/www\.QuranerAlo\.net/gi, '')
    .trim();

  // Voice personas description mapping
  const voiceStyleMap: Record<string, string> = {
    Fenrir: 'Deep, resonant, poetic, solemn storyteller voice with gravitas in authentic Bengali.',
    Kore: 'Melodic, heartfelt, emotional and expressive voice with spiritual depth in Bengali.',
    Zephyr: 'Calm, serene, meditative and peaceful voice in gentle Bengali.',
    Puck: 'Clear, crisp, upright and articulate orator voice in modern Bengali.',
    Charon: 'Slow, heavy, thoughtful and contemplative tone in rich Bengali.',
  };

  const selectedVoice = ['Fenrir', 'Kore', 'Zephyr', 'Puck', 'Charon'].includes(voiceName)
    ? voiceName
    : 'Fenrir';

  const stylePrompt = voiceStyleMap[selectedVoice] || voiceStyleMap.Fenrir;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanNarrationText,
              speechMetadata: {
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav';

    if (!base64Audio) {
      throw new Error('No audio data received from Gemini 3.8 Flash TTS');
    }

    const result = { audioBase64: base64Audio, mimeType };
    // Cache result
    audioCache.set(cacheKey, result);
    return result;
  } catch (error: unknown) {
    console.error('Error generating Gemini TTS:', error);
    throw error;
  }
}
