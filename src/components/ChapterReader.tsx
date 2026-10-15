import React, { useState } from 'react';
import { 
  Volume2, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  BookMarked, 
  Bookmark, 
  Music, 
  Sparkles,
  Share2
} from 'lucide-react';
import { Chapter, ThemeType, AmbientSoundType } from '../types';

interface ChapterReaderProps {
  chapter: Chapter;
  activeParagraphIndex: number;
  fontSize: number;
  theme: ThemeType;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isAudioPlaying: boolean;
  onPlayChapter: () => void;
  onTriggerAmbientCue: (cue: AmbientSoundType) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  chapter,
  activeParagraphIndex,
  fontSize,
  theme,
  onNextChapter,
  onPrevChapter,
  hasNext,
  hasPrev,
  isAudioPlaying,
  onPlayChapter,
  onTriggerAmbientCue,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [copiedQuote, setCopiedQuote] = useState(false);

  const handleCopyQuote = () => {
    const quoteText = `"${chapter.keyQuote.text}" — ${chapter.keyQuote.source} (বেলা ফুরাবার আগে, আরিফ আজাদ)`;
    navigator.clipboard.writeText(quoteText).then(() => {
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2200);
    });
  };

  const getContainerBg = () => {
    switch (theme) {
      case 'parchment':
        return 'bg-[#fbf7ee] text-[#2b251e]';
      case 'oled':
        return 'bg-black text-[#e5e7eb]';
      case 'dawn':
        return 'bg-[#faf5f0] text-[#2d2424]';
      case 'nocturne':
      default:
        return 'bg-[#13110e] text-[#e8ded1]';
    }
  };

  const getQuoteCardBg = () => {
    switch (theme) {
      case 'parchment':
        return 'bg-[#f3ede1] border-[#dfd2be] text-[#3d3328] shadow-sm';
      case 'oled':
        return 'bg-neutral-900 border-neutral-800 text-neutral-200 shadow-sm';
      case 'dawn':
        return 'bg-[#f5ece4] border-[#e4d2c4] text-[#3d2c2c] shadow-sm';
      case 'nocturne':
      default:
        return 'bg-[#1e1914] border-[#362b21] text-[#ebdccb] shadow-sm';
    }
  };

  const getActiveParagraphStyle = (idx: number) => {
    if (!isAudioPlaying || idx !== activeParagraphIndex) return '';
    switch (theme) {
      case 'parchment':
        return 'bg-amber-100/50 rounded-xl px-3 py-2 -mx-3 border-l-4 border-amber-600 transition-all shadow-xs';
      case 'oled':
        return 'bg-emerald-950/30 rounded-xl px-3 py-2 -mx-3 border-l-4 border-emerald-500 transition-all shadow-xs';
      case 'dawn':
        return 'bg-rose-100/50 rounded-xl px-3 py-2 -mx-3 border-l-4 border-rose-500 transition-all shadow-xs';
      case 'nocturne':
      default:
        return 'bg-amber-950/30 rounded-xl px-3 py-2 -mx-3 border-l-4 border-amber-500 transition-all shadow-xs';
    }
  };

  return (
    <article className={`min-h-screen py-8 sm:py-12 px-4 sm:px-8 transition-colors duration-200 ${getContainerBg()}`}>
      <div className="max-w-3xl mx-auto space-y-8 sm:space-y-10 pb-32">
        {/* Chapter Header */}
        <header className="space-y-4 border-b border-inherit/30 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-sans-bengali text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                {chapter.chapterNumberBengali}
              </span>
              <span className="font-sans-bengali text-xs opacity-60">
                {chapter.pageRange}
              </span>
            </div>

            {/* Bookmark & Ambient Cue Quick Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleBookmark}
                className={`p-2 rounded-xl border border-inherit/50 flex items-center gap-1.5 text-xs font-sans-bengali transition-colors cursor-pointer hover:bg-black/10 ${
                  isBookmarked ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 'opacity-70'
                }`}
                title={isBookmarked ? 'বুকমার্ক সরানো হয়েছে' : 'এই অধ্যায় বুকমার্ক করুন'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">
                  {isBookmarked ? 'বুকমার্ক করা' : 'বুকমার্ক'}
                </span>
              </button>

              {chapter.suggestedAmbient !== 'none' && (
                <button
                  onClick={() => onTriggerAmbientCue(chapter.suggestedAmbient)}
                  className="px-2.5 py-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-sans-bengali flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  title="অধ্যায়ের আবহসুর শুনুন"
                >
                  <Music className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden sm:inline">আবহসুর</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <h1 className="font-serif-bengali font-bold text-2xl sm:text-4xl text-amber-500 leading-tight">
              {chapter.title}
            </h1>
            {chapter.subtitle && (
              <p className="font-serif-bengali text-sm sm:text-base opacity-80 mt-1.5 italic">
                {chapter.subtitle}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-black/5 border border-inherit/30 text-xs font-sans-bengali opacity-85 leading-relaxed">
            <span className="font-semibold text-amber-500">সারসংক্ষেপ: </span>
            {chapter.summary}
          </div>
        </header>

        {/* Key Quote / মার্বেল কার্ড */}
        {chapter.keyQuote && (
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${getQuoteCardBg()}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-500">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-serif-bengali font-semibold tracking-wide">
                  অধ্যায়ের মূল মর্মবাণী
                </span>
              </div>

              <button
                onClick={handleCopyQuote}
                className="px-2.5 py-1 rounded-lg border border-inherit hover:bg-black/10 transition-colors text-[11px] font-sans-bengali flex items-center gap-1 cursor-pointer"
                title="উদ্ধৃতি কপি করুন"
              >
                {copiedQuote ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 opacity-70" />
                    <span>উদ্ধৃতি কপি</span>
                  </>
                )}
              </button>
            </div>

            <p className="font-serif-bengali text-sm sm:text-base mt-2.5 leading-relaxed italic border-l-2 border-amber-500/60 pl-3">
              {chapter.keyQuote.text}
            </p>
            <div className="text-right text-[11px] font-sans-bengali opacity-70 mt-1.5">
              — {chapter.keyQuote.source}
            </div>
          </div>
        )}

        {/* Chapter Paragraphs */}
        <div className="space-y-6">
          {chapter.paragraphs.map((p, idx) => {
            const activeClass = getActiveParagraphStyle(idx);

            // 1. Quranic Card
            if (p.type === 'quran') {
              return (
                <div
                  key={p.id}
                  className={`my-6 p-4 sm:p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3 ${activeClass}`}
                >
                  {p.arabic && (
                    <p
                      dir="rtl"
                      className="font-arabic text-lg sm:text-2xl text-right text-amber-400 leading-loose"
                    >
                      {p.arabic}
                    </p>
                  )}
                  <p
                    className="font-serif-bengali leading-relaxed text-amber-200/90"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {p.bengali}
                  </p>
                  {p.reference && (
                    <div className="text-right text-[11px] font-sans-bengali text-amber-400/80 font-medium">
                      — {p.reference}
                    </div>
                  )}
                </div>
              );
            }

            // 2. Hadith Card
            if (p.type === 'hadith') {
              return (
                <div
                  key={p.id}
                  className={`my-6 p-4 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2.5 ${activeClass}`}
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-serif-bengali font-semibold">
                    <span>হাদিস শরিফ</span>
                  </div>
                  {p.arabic && (
                    <p
                      dir="rtl"
                      className="font-arabic text-base sm:text-xl text-right text-emerald-300 leading-relaxed"
                    >
                      {p.arabic}
                    </p>
                  )}
                  <p
                    className="font-serif-bengali leading-relaxed text-emerald-100/90"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {p.bengali}
                  </p>
                  {p.reference && (
                    <div className="text-right text-[11px] font-sans-bengali text-emerald-400/80">
                      — {p.reference}
                    </div>
                  )}
                </div>
              );
            }

            // 3. Stage Cue / নাট্যনির্দেশনা Card
            if (p.type === 'stage_cue') {
              return (
                <div
                  key={p.id}
                  className={`my-4 p-3 rounded-xl border border-sky-500/30 bg-sky-500/5 flex items-center justify-between gap-3 text-xs font-sans-bengali text-sky-300 ${activeClass}`}
                >
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 flex-shrink-0 text-sky-400 animate-pulse" />
                    <span className="italic">{p.bengali}</span>
                  </div>
                  {p.ambientCue && (
                    <button
                      onClick={() => onTriggerAmbientCue(p.ambientCue!)}
                      className="px-2.5 py-1 rounded-lg border border-sky-500/50 bg-sky-500/10 hover:bg-sky-500/20 text-[11px] text-sky-200 flex-shrink-0 transition-colors cursor-pointer"
                    >
                      সুর শুনুন
                    </button>
                  )}
                </div>
              );
            }

            // 4. Quote Callout
            if (p.type === 'quote') {
              return (
                <div
                  key={p.id}
                  className={`my-5 p-4 rounded-xl border-l-4 border-amber-500 bg-black/5 font-serif-bengali italic opacity-95 ${activeClass}`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                >
                  {p.bengali}
                </div>
              );
            }

            // 5. Standard Narrative Paragraph
            return (
              <p
                key={p.id}
                className={`font-serif-bengali transition-colors text-justify leading-relaxed ${activeClass}`}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.85' }}
              >
                {p.bengali}
              </p>
            );
          })}
        </div>

        {/* Footnotes / তথ্যসূত্র */}
        {chapter.footnotes.length > 0 && (
          <footer className="mt-12 pt-6 border-t border-inherit/30 space-y-2">
            <h4 className="text-xs font-serif-bengali font-bold text-amber-500 uppercase tracking-wider">
              তথ্যসূত্র ও টীকা :
            </h4>
            <div className="space-y-1.5">
              {chapter.footnotes.map((fn) => (
                <div
                  key={fn.id}
                  className="text-xs opacity-75 font-sans-bengali flex items-start gap-2"
                >
                  <span className="font-mono text-amber-400">[{fn.id}]</span>
                  <span>{fn.text}</span>
                </div>
              ))}
            </div>
          </footer>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-8 border-t border-inherit/30">
          {hasPrev ? (
            <button
              onClick={onPrevChapter}
              className="px-4 py-2.5 rounded-xl border border-inherit hover:bg-black/10 transition-colors flex items-center gap-2 text-xs sm:text-sm font-sans-bengali cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-amber-500" />
              <span>পূর্ববর্তী অধ্যায়</span>
            </button>
          ) : (
            <div />
          )}

          {hasNext && (
            <button
              onClick={onNextChapter}
              className="px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors flex items-center gap-2 text-xs sm:text-sm font-sans-bengali font-semibold cursor-pointer"
            >
              <span>পরবর্তী অধ্যায়</span>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
