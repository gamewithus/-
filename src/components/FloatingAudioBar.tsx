import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Download, 
  Gauge, 
  Repeat, 
  Loader2, 
  Mic, 
  Volume2, 
  VolumeX, 
  Check, 
  Music 
} from 'lucide-react';
import { Chapter, VoiceOption, ThemeType, PlaybackSpeed } from '../types';

interface FloatingAudioBarProps {
  currentChapter: Chapter;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  speed: number;
  onChangeSpeed: (speed: PlaybackSpeed) => void;
  continuous: boolean;
  onToggleContinuous: () => void;
  currentVoice: VoiceOption;
  onOpenVoiceSelector: () => void;
  onDownloadWav: () => Promise<boolean | null>;
  onOpenAmbientModal: () => void;
  theme: ThemeType;
}

export const FloatingAudioBar: React.FC<FloatingAudioBarProps> = ({
  currentChapter,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onPrevChapter,
  onNextChapter,
  hasPrev,
  hasNext,
  speed,
  onChangeSpeed,
  continuous,
  onToggleContinuous,
  currentVoice,
  onOpenVoiceSelector,
  onDownloadWav,
  onOpenAmbientModal,
  theme,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const res = await onDownloadWav();
    setIsDownloading(false);
    if (res) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }
  };

  const getPlayerBg = () => {
    switch (theme) {
      case 'parchment':
        return 'bg-[#f4ede0]/95 text-[#2b251e] border-[#dbcdb8] shadow-2xl';
      case 'oled':
        return 'bg-black/95 text-neutral-100 border-neutral-800 shadow-2xl';
      case 'dawn':
        return 'bg-[#f7ece5]/95 text-[#302222] border-[#e4d1c3] shadow-2xl';
      case 'nocturne':
      default:
        return 'bg-[#181410]/95 text-[#ede4d8] border-[#342921] shadow-2xl';
    }
  };

  const speeds: PlaybackSpeed[] = [0.8, 1.0, 1.25];

  const cycleSpeed = () => {
    const currentIndex = speeds.indexOf(speed as PlaybackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onChangeSpeed(speeds[nextIndex]);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-2 sm:px-4 pb-2 sm:pb-3 pointer-events-none">
      <div
        className={`max-w-4xl mx-auto rounded-2xl border backdrop-blur-lg p-2.5 sm:p-4 pointer-events-auto transition-all ${getPlayerBg()}`}
      >
        {/* Top Scrubber & Time */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[10px] sm:text-xs opacity-75 min-w-[34px] text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center group py-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              disabled={isLoading || duration === 0}
              className="w-full h-1.5 bg-black/20 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-hidden"
            />
          </div>

          <span className="font-mono text-[10px] sm:text-xs opacity-75 min-w-[34px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Bottom Controls Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Chapter Title & Number */}
          <div className="flex items-center gap-2 min-w-0 max-w-[190px] sm:max-w-[280px]">
            <div className="min-w-0">
              <div className="text-[10px] font-sans-bengali text-amber-500 font-semibold truncate">
                {currentChapter.chapterNumberBengali}
              </div>
              <div className="text-xs sm:text-sm font-serif-bengali font-bold truncate">
                {currentChapter.title}
              </div>
            </div>
          </div>

          {/* Main Playback Center Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Prev Chapter */}
            <button
              onClick={onPrevChapter}
              disabled={!hasPrev || isLoading}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-black/10 disabled:opacity-30 transition-colors cursor-pointer"
              title="পূর্ববর্তী অধ্যায়"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </button>

            {/* Play / Pause / Loading */}
            <button
              onClick={onPlayPause}
              disabled={isLoading}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-75"
              title={isPlaying ? 'বিরতি (Pause)' : 'শুনুন (Play)'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Chapter */}
            <button
              onClick={onNextChapter}
              disabled={!hasNext || isLoading}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-black/10 disabled:opacity-30 transition-colors cursor-pointer"
              title="পরবর্তী অধ্যায়"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </button>
          </div>

          {/* Right Action Icons: Speed, Continuous, Voice, Download, Ambient */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Speed Controller */}
            <button
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-xl border border-inherit hover:bg-black/10 text-[11px] font-mono transition-colors cursor-pointer"
              title="প্লেব্যাক স্পিড (0.8x / 1.0x / 1.25x)"
            >
              {speed}x
            </button>

            {/* Continuous Playback Toggle */}
            <button
              onClick={onToggleContinuous}
              className={`p-1.5 rounded-xl border border-inherit transition-colors cursor-pointer ${
                continuous ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 'opacity-50 hover:opacity-100'
              }`}
              title={continuous ? 'একটানা পাঠ সক্রিয় (পরের অধ্যায় স্বয়ংক্রিয়)' : 'একটানা পাঠ নিষ্ক্রিয়'}
            >
              <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Voice Option Selector Trigger */}
            <button
              onClick={onOpenVoiceSelector}
              className="px-2 py-1 rounded-xl border border-inherit hover:bg-black/10 flex items-center gap-1 text-[11px] font-sans-bengali transition-colors cursor-pointer"
              title="কথক / বাচিকশিল্পী পরিবর্তন"
            >
              <Mic className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">{currentVoice}</span>
            </button>

            {/* Ambient Modal Trigger */}
            <button
              onClick={onOpenAmbientModal}
              className="p-1.5 rounded-xl border border-inherit hover:bg-black/10 transition-colors cursor-pointer text-emerald-400"
              title="আবহসংগীত কন্ট্রোল"
            >
              <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Download .wav File */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-1.5 rounded-xl border border-inherit hover:bg-black/10 transition-colors cursor-pointer"
              title="সম্পূর্ণ অধ্যায়ের অডিও (.wav) ডাউনলোড করুন"
            >
              {downloadSuccess ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              ) : isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-amber-500" />
              ) : (
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-75 hover:opacity-100 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
