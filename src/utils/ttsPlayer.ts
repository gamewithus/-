import { VoiceOption } from '../types';
import { audioCache } from './audioCache';
import { ambientSynth } from './ambientSynthesizer';

export interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  chapterId: number | null;
  voice: VoiceOption;
  speed: number;
  continuous: boolean;
  isFallback: boolean;
  activeParagraphIndex: number;
}

type StateListener = (state: TTSState) => void;

class TTSPlayer {
  private audio: HTMLAudioElement | null = null;
  private playPromise: Promise<void> | null = null;
  private currentAbortController: AbortController | null = null;
  private listeners: Set<StateListener> = new Set();

  private state: TTSState = {
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    chapterId: null,
    voice: 'Fenrir',
    speed: 1.0,
    continuous: true,
    isFallback: false,
    activeParagraphIndex: 0,
  };

  private currentBlobUrl: string | null = null;
  private fallbackUtterance: SpeechSynthesisUtterance | null = null;
  private onChapterFinishedCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    this.audio = new Audio();
    this.audio.preload = 'auto';

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      this.state.currentTime = this.audio.currentTime;
      this.state.duration = isNaN(this.audio.duration) ? 0 : this.audio.duration;
      this.notify();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (!this.audio) return;
      this.state.duration = isNaN(this.audio.duration) ? 0 : this.audio.duration;
      this.notify();
    });

    this.audio.addEventListener('ended', () => {
      this.state.isPlaying = false;
      this.state.currentTime = 0;
      ambientSynth.setDucking(false);
      this.notify();

      if (this.state.continuous && this.onChapterFinishedCallback) {
        this.onChapterFinishedCallback();
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio element error:', e);
      this.state.isPlaying = false;
      this.state.isLoading = false;
      ambientSynth.setDucking(false);
      this.notify();
    });
  }

  public setOnChapterFinished(cb: () => void) {
    this.onChapterFinishedCallback = cb;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
    this.notify();
  }

  public setContinuous(continuous: boolean) {
    this.state.continuous = continuous;
    this.notify();
  }

  public setVoice(voice: VoiceOption) {
    this.state.voice = voice;
    this.notify();
  }

  public setActiveParagraphIndex(index: number) {
    this.state.activeParagraphIndex = index;
    this.notify();
  }

  public seek(seconds: number) {
    if (this.audio && !isNaN(this.audio.duration)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration));
      this.state.currentTime = this.audio.currentTime;
      this.notify();
    }
  }

  public async pause() {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    if (this.state.isFallback && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.state.isPlaying = false;
      ambientSynth.setDucking(false);
      this.notify();
      return;
    }

    if (this.audio) {
      if (this.playPromise) {
        try {
          await this.playPromise;
        } catch {
          // Play request was cancelled or aborted, ignore
        }
      }
      this.audio.pause();
      this.state.isPlaying = false;
      ambientSynth.setDucking(false);
      this.notify();
    }
  }

  public async playChapter(
    chapterId: number,
    textToSpeak: string,
    voice: VoiceOption = this.state.voice
  ) {
    // If already playing the same chapter and paused, simply resume
    if (this.state.chapterId === chapterId && this.audio && this.audio.src && !this.state.isLoading) {
      if (this.audio.paused) {
        try {
          ambientSynth.setDucking(true);
          this.playPromise = this.audio.play();
          await this.playPromise;
          this.state.isPlaying = true;
          this.notify();
          return;
        } catch (e) {
          console.warn('Resume error:', e);
        }
      } else {
        return;
      }
    }

    // Cancel any previous pending request
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    this.currentAbortController = new AbortController();

    await this.pause();

    this.state.isLoading = true;
    this.state.chapterId = chapterId;
    this.state.voice = voice;
    this.state.isFallback = false;
    this.notify();

    // 1. Check local IndexedDB cache first
    try {
      const cachedBlob = await audioCache.getAudio(chapterId, voice);
      if (cachedBlob) {
        await this.playAudioBlob(cachedBlob);
        return;
      }
    } catch (e) {
      console.warn('Cache lookup failed, proceeding to API:', e);
    }

    // 2. Fetch from server API with Gemini 3.8 Flash TTS
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToSpeak,
          voiceName: voice,
          chapterId,
        }),
        signal: this.currentAbortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.audioBase64) {
        throw new Error('No audio returned in response');
      }

      // Decode base64 to Blob
      const binary = atob(data.audioBase64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });

      // Save to IndexedDB
      await audioCache.saveAudio(chapterId, voice, blob);

      // Play audio
      await this.playAudioBlob(blob);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      console.warn('Gemini 3.8 Flash TTS error, falling back to Web Speech API:', err);
      this.startWebSpeechFallback(textToSpeak);
    }
  }

  private async playAudioBlob(blob: Blob) {
    if (!this.audio) return;

    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }
    this.currentBlobUrl = URL.createObjectURL(blob);

    this.audio.src = this.currentBlobUrl;
    this.audio.playbackRate = this.state.speed;

    try {
      ambientSynth.setDucking(true);
      this.playPromise = this.audio.play();
      await this.playPromise;
      this.state.isPlaying = true;
      this.state.isLoading = false;
      this.state.isFallback = false;
      this.notify();
    } catch (err) {
      console.error('Audio play error:', err);
      this.state.isPlaying = false;
      this.state.isLoading = false;
      ambientSynth.setDucking(false);
      this.notify();
    }
  }

  private startWebSpeechFallback(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.state.isLoading = false;
      this.state.isPlaying = false;
      ambientSynth.setDucking(false);
      this.notify();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text
    const clean = text
      .replace(/\[\d+\]/g, '')
      .replace(/\[আবহসুর:[^\]]*\]/g, '')
      .replace(/www\.QuranerAlo\.net/gi, '')
      .slice(0, 3000); // browser limit safety

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'bn-BD';
    utterance.rate = this.state.speed;

    // Pick Bengali voice if available
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.includes('bn'));
    if (bnVoice) utterance.voice = bnVoice;

    utterance.onstart = () => {
      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.state.isFallback = true;
      ambientSynth.setDucking(true);
      this.notify();
    };

    utterance.onend = () => {
      this.state.isPlaying = false;
      ambientSynth.setDucking(false);
      this.notify();
      if (this.state.continuous && this.onChapterFinishedCallback) {
        this.onChapterFinishedCallback();
      }
    };

    utterance.onerror = () => {
      this.state.isPlaying = false;
      this.state.isLoading = false;
      ambientSynth.setDucking(false);
      this.notify();
    };

    this.fallbackUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public async downloadCurrentChapterWav(chapterId: number, chapterTitle: string, voice: VoiceOption) {
    let blob = await audioCache.getAudio(chapterId, voice);
    if (!blob) {
      return null;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bela-furabar-aage-ch${chapterId}-${voice}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  }

  public getState(): TTSState {
    return { ...this.state };
  }
}

export const ttsPlayer = new TTSPlayer();
