import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { allChapters, getChapterById } from './data/chapters';
import { Chapter, ThemeType, VoiceOption, AmbientSoundType, BookmarkState, PlaybackSpeed } from './types';
import { Navbar } from './components/Navbar';
import { DrawerTableOfContents } from './components/DrawerTableOfContents';
import { BookInfoModal } from './components/BookInfoModal';
import { AmbientControlModal } from './components/AmbientControlModal';
import { VoiceSelectorModal } from './components/VoiceSelectorModal';
import { ChapterReader } from './components/ChapterReader';
import { FloatingAudioBar } from './components/FloatingAudioBar';
import { ttsPlayer, TTSState } from './utils/ttsPlayer';
import { ambientSynth } from './utils/ambientSynthesizer';
import { Bookmark, Sparkles, X } from 'lucide-react';

const BOOKMARK_STORAGE_KEY = 'bela_furabar_bookmark_v1';
const THEME_STORAGE_KEY = 'bela_furabar_theme_v1';
const FONT_SIZE_STORAGE_KEY = 'bela_furabar_fontsize_v1';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['nocturne', 'parchment', 'oled', 'dawn'].includes(saved)) {
        return saved as ThemeType;
      }
    }
    return 'nocturne';
  });

  // Font size state
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 14 && parsed <= 26) return parsed;
      }
    }
    return 18;
  });

  // Chapter state
  const [currentChapter, setCurrentChapter] = useState<Chapter>(() => allChapters[0]);

  // Bookmarking state
  const [bookmark, setBookmark] = useState<BookmarkState | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(() => {
    return bookmark !== null && bookmark.chapterId !== allChapters[0].id;
  });

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBookInfoOpen, setIsBookInfoOpen] = useState(false);
  const [isAmbientModalOpen, setIsAmbientModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Audio / TTS state
  const [ttsState, setTtsState] = useState<TTSState>(ttsPlayer.getState());
  const [ambientTrack, setAmbientTrack] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);
  const [isAmbientMuted, setIsAmbientMuted] = useState<boolean>(false);

  // Active paragraph tracking for read-along highlight
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(0);

  // Sync TTS state from player
  useEffect(() => {
    const unsubscribe = ttsPlayer.subscribe((state) => {
      setTtsState(state);

      // Estimate active paragraph based on playback progress
      if (state.isPlaying && state.duration > 0 && currentChapter) {
        const totalParagraphs = currentChapter.paragraphs.length;
        const progress = state.currentTime / state.duration;
        const estimatedIndex = Math.min(
          totalParagraphs - 1,
          Math.floor(progress * totalParagraphs)
        );
        setActiveParagraphIndex(estimatedIndex);
      }
    });

    return unsubscribe;
  }, [currentChapter]);

  // Sync theme to localStorage
  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // Sync font size
  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size.toString());
  };

  // Compile clean narrator speech text for current chapter
  const getChapterSpeechText = useCallback((ch: Chapter) => {
    const textPieces = ch.paragraphs
      .filter((p) => p.type !== 'stage_cue')
      .map((p) => {
        if (p.type === 'quran' || p.type === 'hadith') {
          return p.bengali;
        }
        return p.bengali;
      });
    return `${ch.title}। ${ch.subtitle || ''}। ${textPieces.join(' ')}`;
  }, []);

  // Play chapter audio
  const handlePlayChapter = useCallback(
    async (chapterToPlay: Chapter = currentChapter) => {
      const speechText = getChapterSpeechText(chapterToPlay);
      await ttsPlayer.playChapter(chapterToPlay.id, speechText, ttsState.voice);
    },
    [currentChapter, getChapterSpeechText, ttsState.voice]
  );

  // Handle Play / Pause Toggle
  const handlePlayPause = useCallback(async () => {
    if (ttsState.isPlaying) {
      await ttsPlayer.pause();
    } else {
      await handlePlayChapter(currentChapter);
    }
  }, [ttsState.isPlaying, handlePlayChapter, currentChapter]);

  // Navigation handlers
  const currentIndex = useMemo(
    () => allChapters.findIndex((c) => c.id === currentChapter.id),
    [currentChapter]
  );

  const hasNext = currentIndex < allChapters.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNextChapter = useCallback(() => {
    if (hasNext) {
      const nextChapter = allChapters[currentIndex + 1];
      setCurrentChapter(nextChapter);
      setActiveParagraphIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Save bookmark
      const newBm: BookmarkState = {
        chapterId: nextChapter.id,
        paragraphIndex: 0,
        currentTimeSeconds: 0,
        updatedAt: Date.now(),
      };
      setBookmark(newBm);
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(newBm));

      // If continuous playback was running, play next chapter audio immediately
      if (ttsState.isPlaying || ttsState.continuous) {
        const text = getChapterSpeechText(nextChapter);
        ttsPlayer.playChapter(nextChapter.id, text, ttsState.voice);
      }
    }
  }, [currentIndex, hasNext, ttsState.isPlaying, ttsState.continuous, ttsState.voice, getChapterSpeechText]);

  const handlePrevChapter = useCallback(() => {
    if (hasPrev) {
      const prevChapter = allChapters[currentIndex - 1];
      setCurrentChapter(prevChapter);
      setActiveParagraphIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const newBm: BookmarkState = {
        chapterId: prevChapter.id,
        paragraphIndex: 0,
        currentTimeSeconds: 0,
        updatedAt: Date.now(),
      };
      setBookmark(newBm);
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(newBm));

      if (ttsState.isPlaying) {
        const text = getChapterSpeechText(prevChapter);
        ttsPlayer.playChapter(prevChapter.id, text, ttsState.voice);
      }
    }
  }, [currentIndex, hasPrev, ttsState.isPlaying, ttsState.voice, getChapterSpeechText]);

  // Hook up continuous playback callback
  useEffect(() => {
    ttsPlayer.setOnChapterFinished(() => {
      handleNextChapter();
    });
  }, [handleNextChapter]);

  // Chapter Selection from Drawer
  const handleSelectChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setActiveParagraphIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Save bookmark
    const newBm: BookmarkState = {
      chapterId: chapter.id,
      paragraphIndex: 0,
      currentTimeSeconds: 0,
      updatedAt: Date.now(),
    };
    setBookmark(newBm);
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(newBm));
  };

  // Bookmark toggle
  const handleToggleBookmark = () => {
    if (bookmark && bookmark.chapterId === currentChapter.id) {
      setBookmark(null);
      localStorage.removeItem(BOOKMARK_STORAGE_KEY);
    } else {
      const newBm: BookmarkState = {
        chapterId: currentChapter.id,
        paragraphIndex: activeParagraphIndex,
        currentTimeSeconds: ttsState.currentTime,
        updatedAt: Date.now(),
      };
      setBookmark(newBm);
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(newBm));
    }
  };

  // Resume from bookmark
  const handleResumeBookmark = () => {
    if (bookmark) {
      const found = getChapterById(bookmark.chapterId);
      if (found) {
        setCurrentChapter(found);
        setActiveParagraphIndex(bookmark.paragraphIndex);
        setShowResumeBanner(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Ambient soundscape handling
  const handleSelectAmbientTrack = (track: AmbientSoundType) => {
    setAmbientTrack(track);
    ambientSynth.playTrack(track);
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    ambientSynth.setVolume(vol);
  };

  const handleToggleAmbientMute = () => {
    const isMuted = ambientSynth.toggleMute();
    setIsAmbientMuted(isMuted);
  };

  const handleTriggerAmbientCue = (cue: AmbientSoundType) => {
    handleSelectAmbientTrack(cue);
  };

  // Voice selector handling
  const handleSelectVoice = (voice: VoiceOption) => {
    ttsPlayer.setVoice(voice);
    // If currently playing, restart playback with new voice
    if (ttsState.isPlaying) {
      const text = getChapterSpeechText(currentChapter);
      ttsPlayer.playChapter(currentChapter.id, text, voice);
    }
  };

  // Download .wav file
  const handleDownloadWav = async () => {
    const success = await ttsPlayer.downloadCurrentChapterWav(
      currentChapter.id,
      currentChapter.title,
      ttsState.voice
    );
    if (!success) {
      // If not cached yet, generate it first then download
      const speechText = getChapterSpeechText(currentChapter);
      await ttsPlayer.playChapter(currentChapter.id, speechText, ttsState.voice);
      return await ttsPlayer.downloadCurrentChapterWav(
        currentChapter.id,
        currentChapter.title,
        ttsState.voice
      );
    }
    return success;
  };

  const isCurrentChapterBookmarked = bookmark?.chapterId === currentChapter.id;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 selection:bg-amber-500/30 selection:text-amber-200`}>
      {/* Navbar */}
      <Navbar
        currentChapterTitle={currentChapter.title}
        currentChapterNumber={currentChapter.chapterNumberBengali}
        theme={theme}
        onThemeChange={handleThemeChange}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenBookInfo={() => setIsBookInfoOpen(true)}
        onOpenAmbientModal={() => setIsAmbientModalOpen(true)}
        currentAmbient={ambientTrack}
        isAmbientMuted={isAmbientMuted}
        onToggleAmbientMute={handleToggleAmbientMute}
        hasBookmark={bookmark !== null}
        onJumpToBookmark={handleResumeBookmark}
      />

      {/* Resume Bookmark Banner */}
      {showResumeBanner && bookmark && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs font-sans-bengali flex items-center justify-between gap-3 text-amber-300 backdrop-blur-xs">
          <div className="flex items-center gap-2 truncate">
            <Bookmark className="w-4 h-4 text-amber-400 fill-current flex-shrink-0" />
            <span className="truncate">
              আপনি পূর্বে{' '}
              <strong className="text-amber-400 font-serif-bengali">
                {getChapterById(bookmark.chapterId)?.title || `অধ্যায় ${bookmark.chapterId}`}
              </strong>{' '}
              পড়ছিলেন।
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleResumeBookmark}
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors cursor-pointer"
            >
              সেখান থেকে শুরু করুন
            </button>
            <button
              onClick={() => setShowResumeBanner(false)}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
              title="বিজ্ঞপ্তি বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      )}

      {/* Main Chapter Reader */}
      <main className="flex-1">
        <ChapterReader
          chapter={currentChapter}
          activeParagraphIndex={activeParagraphIndex}
          fontSize={fontSize}
          theme={theme}
          onNextChapter={handleNextChapter}
          onPrevChapter={handlePrevChapter}
          hasNext={hasNext}
          hasPrev={hasPrev}
          isAudioPlaying={ttsState.isPlaying}
          onPlayChapter={handlePlayPause}
          onTriggerAmbientCue={handleTriggerAmbientCue}
          isBookmarked={isCurrentChapterBookmarked}
          onToggleBookmark={handleToggleBookmark}
        />
      </main>

      {/* Floating Sticky Audio Player Bar */}
      <FloatingAudioBar
        currentChapter={currentChapter}
        isPlaying={ttsState.isPlaying}
        isLoading={ttsState.isLoading}
        currentTime={ttsState.currentTime}
        duration={ttsState.duration}
        onPlayPause={handlePlayPause}
        onSeek={(sec) => ttsPlayer.seek(sec)}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        hasPrev={hasPrev}
        hasNext={hasNext}
        speed={ttsState.speed}
        onChangeSpeed={(spd) => ttsPlayer.setSpeed(spd)}
        continuous={ttsState.continuous}
        onToggleContinuous={() => ttsPlayer.setContinuous(!ttsState.continuous)}
        currentVoice={ttsState.voice}
        onOpenVoiceSelector={() => setIsVoiceModalOpen(true)}
        onDownloadWav={handleDownloadWav}
        onOpenAmbientModal={() => setIsAmbientModalOpen(true)}
        theme={theme}
      />

      {/* Slide-out Table of Contents Drawer */}
      <DrawerTableOfContents
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        chapters={allChapters}
        currentChapterId={currentChapter.id}
        onSelectChapter={handleSelectChapter}
        onPlayChapter={(ch) => {
          handleSelectChapter(ch);
          handlePlayChapter(ch);
        }}
        isPlaying={ttsState.isPlaying}
        playingChapterId={ttsState.chapterId}
        bookmarkedChapterId={bookmark?.chapterId || null}
        theme={theme}
      />

      {/* Context & Characters Info Modal */}
      <BookInfoModal
        isOpen={isBookInfoOpen}
        onClose={() => setIsBookInfoOpen(false)}
        theme={theme}
      />

      {/* Ambient Soundscapes Synthesizer Modal */}
      <AmbientControlModal
        isOpen={isAmbientModalOpen}
        onClose={() => setIsAmbientModalOpen(false)}
        currentTrack={ambientTrack}
        onSelectTrack={handleSelectAmbientTrack}
        volume={ambientVolume}
        onVolumeChange={handleAmbientVolumeChange}
        isMuted={isAmbientMuted}
        onToggleMute={handleToggleAmbientMute}
        isNarratorPlaying={ttsState.isPlaying}
        theme={theme}
      />

      {/* Voice Selection Modal */}
      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentVoice={ttsState.voice}
        onSelectVoice={handleSelectVoice}
        theme={theme}
      />
    </div>
  );
}
