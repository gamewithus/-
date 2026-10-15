import React from 'react';
import { X, Mic, Check, Sparkles, Volume2 } from 'lucide-react';
import { AVAILABLE_VOICES } from '../data/bookInfo';
import { VoiceOption, ThemeType } from '../types';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoice: VoiceOption;
  onSelectVoice: (voice: VoiceOption) => void;
  theme: ThemeType;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  currentVoice,
  onSelectVoice,
  theme,
}) => {
  if (!isOpen) return null;

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
          ? 'bg-amber-100/90 border-amber-500 shadow-sm ring-1 ring-amber-500'
          : 'bg-[#f2ece0] hover:bg-[#eae1d0] border-[#dfd4c0]';
      case 'oled':
        return isSelected
          ? 'bg-emerald-950/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
          : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800';
      case 'dawn':
        return isSelected
          ? 'bg-rose-100/90 border-rose-500 shadow-sm ring-1 ring-rose-500'
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
        className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl z-10 overflow-hidden ${getModalBg()}`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-bengali font-bold text-lg text-amber-500">
                বাচিকশিল্পী ও কথক নির্বাচন
              </h2>
              <p className="text-xs opacity-70 font-sans-bengali">
                Gemini 3.8 Flash TTS ভয়েস ইঞ্জিন
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-2 text-xs font-sans-bengali">
            <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <span>
              আপনার পছন্দের বাচিকশিল্পী নির্বাচন করুন। প্রতিটি কণ্ঠস্বর বাংলা উচ্চারণ এবং সাহিত্যের ভাবাবেগের সাথে সামঞ্জস্যপূর্ণভাবে সুরারোপিত।
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {AVAILABLE_VOICES.map((voice) => {
              const isSelected = currentVoice === voice.id;
              return (
                <button
                  key={voice.id}
                  onClick={() => {
                    onSelectVoice(voice.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${getCardBg(
                    isSelected
                  )}`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-black/10 flex-shrink-0 mt-0.5">
                      <Volume2 className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif-bengali font-bold text-sm sm:text-base">
                          {voice.nameBangla}
                        </h4>
                        <span className="text-[10px] font-sans-bengali px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                          {voice.badge}
                        </span>
                      </div>
                      <p className="text-xs opacity-75 font-sans-bengali mt-0.5">
                        {voice.desc}
                      </p>
                      <div className="text-[11px] opacity-60 font-sans-bengali mt-1 italic">
                        টোন: {voice.tone}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-inherit/60" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
