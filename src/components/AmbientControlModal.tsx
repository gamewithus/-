import React from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Music, 
  Wind, 
  Waves, 
  Radio, 
  Flame, 
  Sliders, 
  Sparkles,
  Check
} from 'lucide-react';
import { AMBIENT_TRACKS } from '../data/bookInfo';
import { AmbientSoundType, ThemeType } from '../types';

interface AmbientControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: AmbientSoundType;
  onSelectTrack: (track: AmbientSoundType) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isNarratorPlaying: boolean;
  theme: ThemeType;
}

export const AmbientControlModal: React.FC<AmbientControlModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  onSelectTrack,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  isNarratorPlaying,
  theme,
}) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Music':
        return <Music className="w-5 h-5 text-amber-500" />;
      case 'Wind':
        return <Wind className="w-5 h-5 text-sky-400" />;
      case 'Waves':
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-amber-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'VolumeX':
      default:
        return <VolumeX className="w-5 h-5 opacity-50" />;
    }
  };

  const getModalBg = () => {
    switch (theme) {
      case 'parchment':
        return 'bg-[#fbf7ee] text-[#2b251e] border-[#e2d5c3]';
      case 'oled':
        return 'bg-black text-neutral-200 border-neutral-800';
      case 'dawn':
        return 'bg-[#faf5f0] text-[#302222] border-[#ecd8cc]';
      case 'nocturne':
      default:
        return 'bg-[#181512] text-[#ede4d8] border-[#2f2720]';
    }
  };

  const getCardBg = (isSelected: boolean) => {
    switch (theme) {
      case 'parchment':
        return isSelected
          ? 'bg-amber-100/90 border-amber-500/50 shadow-sm ring-1 ring-amber-500'
          : 'bg-[#f2ece0] hover:bg-[#eae1d0] border-[#dfd4c0]';
      case 'oled':
        return isSelected
          ? 'bg-emerald-950/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
          : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800';
      case 'dawn':
        return isSelected
          ? 'bg-rose-100/90 border-rose-500/50 shadow-sm ring-1 ring-rose-500'
          : 'bg-[#f4ebe3] hover:bg-[#ede0d4] border-[#e2d0c2]';
      case 'nocturne':
      default:
        return isSelected
          ? 'bg-amber-950/60 border-amber-500 shadow-sm ring-1 ring-amber-500'
          : 'bg-[#231d18] hover:bg-[#2c241e] border-[#382e25]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl z-10 overflow-hidden ${getModalBg()}`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-bengali font-bold text-lg text-emerald-500">
                লাইভ আবহসুর ও সাউন্ডস্কেপ
              </h2>
              <p className="text-xs opacity-70 font-sans-bengali">
                ব্রাউজার নেটিভ Web Audio API সিন্থেসাইজার
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/10 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5 opacity-70" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Auto-Ducking Info Alert */}
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="text-xs font-sans-bengali leading-relaxed">
              <span className="font-semibold text-emerald-400">
                অটো-ডাকিং (Auto-Ducking) সুর সক্রিয়:
              </span>{' '}
              {isNarratorPlaying ? (
                <span className="text-amber-400 font-medium">
                  কথক কথা বলছেন—আবহসুর এখন মৃদু ব্যাকগ্রাউন্ডে নামিয়ে দেওয়া হয়েছে।
                </span>
              ) : (
                <span>
                  কথকের কণ্ঠ শুরু হলে আবহসংগীত মৃদু হয়ে যাবে এবং শেষ হলে স্বয়ংক্রিয়ভাবে পূর্ণ সুরে বাজবে।
                </span>
              )}
            </div>
          </div>

          {/* Master Volume Slider */}
          <div className="p-3.5 rounded-xl border border-inherit bg-black/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-sans-bengali">
              <span className="flex items-center gap-1.5 font-medium">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                আবহসংগীতের ভলিউম
              </span>
              <span className="font-mono text-[11px] opacity-75">
                {isMuted ? 'মিউট' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  if (isMuted) onToggleMute();
                  onVolumeChange(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-black/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <button
                onClick={onToggleMute}
                className="p-1.5 rounded-lg border border-inherit hover:bg-black/10 transition-colors cursor-pointer text-xs"
                title={isMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Soundscapes List */}
          <div className="space-y-2">
            <h4 className="text-xs font-serif-bengali font-bold text-amber-500 uppercase tracking-wider">
              আবহসুরের ধরন নির্বাচন করুন
            </h4>

            <div className="grid grid-cols-1 gap-2">
              {AMBIENT_TRACKS.map((track) => {
                const isSelected = currentTrack === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => onSelectTrack(track.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${getCardBg(
                      isSelected
                    )}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-black/10 flex-shrink-0">
                        {getIcon(track.iconName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-serif-bengali font-bold text-sm truncate">
                            {track.title}
                          </h5>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-sans-bengali font-semibold">
                              সক্রিয়
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] opacity-75 font-sans-bengali truncate mt-0.5">
                          {track.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-inherit/60" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
