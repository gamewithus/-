export type VoiceOption = 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck' | 'Charon';

export interface VoiceMeta {
  id: VoiceOption;
  nameBangla: string;
  englishName: string;
  desc: string;
  badge: string;
  tone: string;
}

export type AmbientSoundType = 'flute' | 'wind' | 'river' | 'tanpura' | 'drums' | 'none';

export interface AmbientTrackMeta {
  id: AmbientSoundType;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
}

export type PlaybackSpeed = 0.8 | 1.0 | 1.25;

export type ThemeType = 'nocturne' | 'parchment' | 'oled' | 'dawn';

export interface ChapterParagraph {
  id: string;
  sectionMarker?: string; // e.g. "[ক]", "[খ]"
  type: 'paragraph' | 'quran' | 'hadith' | 'dialogue' | 'stage_cue' | 'quote';
  arabic?: string;
  bengali: string;
  reference?: string;
  ambientCue?: AmbientSoundType;
  ambientCueLabel?: string;
}

export interface Chapter {
  id: number;
  slug: string;
  chapterNumberBengali: string;
  title: string;
  subtitle?: string;
  englishTitle: string;
  pageRange: string;
  summary: string;
  keyQuote: {
    text: string;
    source: string;
  };
  suggestedAmbient: AmbientSoundType;
  paragraphs: ChapterParagraph[];
  footnotes: Array<{ id: number; text: string }>;
}

export interface BookmarkState {
  chapterId: number;
  paragraphIndex: number;
  currentTimeSeconds: number;
  updatedAt: number;
}
