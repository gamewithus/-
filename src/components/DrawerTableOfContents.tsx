import React, { useState } from 'react';
import { X, Search, Play, Volume2, Bookmark, CheckCircle2, BookOpen } from 'lucide-react';
import { Chapter, ThemeType } from '../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  currentChapterId: number;
  onSelectChapter: (chapter: Chapter) => void;
  onPlayChapter: (chapter: Chapter) => void;
  isPlaying: boolean;
  playingChapterId: number | null;
  bookmarkedChapterId: number | null;
  theme: ThemeType;
}

export const DrawerTableOfContents: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  chapters,
  currentChapterId,
  onSelectChapter,
  onPlayChapter,
  isPlaying,
  playingChapterId,
  bookmarkedChapterId,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredChapters = chapters.filter(
    (ch) =>
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.chapterNumberBengali.includes(searchQuery)
  );

  const getDrawerBg = () => {
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

  const getItemBg = (chId: number) => {
    const isCurrent = chId === currentChapterId;
    switch (theme) {
      case 'parchment':
        return isCurrent
          ? 'bg-amber-100/70 border-amber-400/50 shadow-sm'
          : 'bg-[#f2ece0]/60 hover:bg-[#ede5d6] border-[#dfd4c0]';
      case 'oled':
        return isCurrent
          ? 'bg-emerald-950/40 border-emerald-600/50 shadow-sm'
          : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800';
      case 'dawn':
        return isCurrent
          ? 'bg-rose-100/70 border-rose-400/50 shadow-sm'
          : 'bg-[#f4ebe3]/60 hover:bg-[#eee2d8] border-[#e2d0c2]';
      case 'nocturne':
      default:
        return isCurrent
          ? 'bg-amber-950/40 border-amber-500/40 shadow-sm'
          : 'bg-[#231d18]/60 hover:bg-[#2c241e] border-[#382e25]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`relative w-full max-w-md h-full flex flex-col shadow-2xl border-r z-10 transition-transform ${getDrawerBg()}`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-bengali font-bold text-lg text-amber-500">
                সূচিপত্র
              </h2>
              <p className="text-xs opacity-75 font-sans-bengali">
                মোট ২০টি অধ্যায় • ১৮২ পৃষ্ঠা
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

        {/* Search Input */}
        <div className="p-3 border-b border-inherit">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              placeholder="অধ্যায়ের নাম বা বিষয়বস্তু খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-inherit bg-black/5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-sans-bengali"
            />
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredChapters.map((chapter) => {
            const isCurrent = chapter.id === currentChapterId;
            const isThisPlaying = isPlaying && playingChapterId === chapter.id;
            const isBookmarked = bookmarkedChapterId === chapter.id;

            return (
              <div
                key={chapter.id}
                className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${getItemBg(
                  chapter.id
                )}`}
                onClick={() => {
                  onSelectChapter(chapter);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-sans-bengali font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                        {chapter.chapterNumberBengali}
                      </span>
                      <span className="text-[10px] opacity-60 font-sans-bengali">
                        {chapter.pageRange}
                      </span>
                      {isBookmarked && (
                        <span className="text-[10px] font-sans-bengali px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
                          <Bookmark className="w-2.5 h-2.5 fill-current" />
                          বুকমার্ক
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif-bengali font-bold text-sm sm:text-base mt-1 group-hover:text-amber-500 transition-colors">
                      {chapter.title}
                    </h3>
                  </div>

                  {/* Play / Listen Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayChapter(chapter);
                    }}
                    className={`p-2 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
                      isThisPlaying
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-black/10 hover:bg-amber-500/20 text-amber-500'
                    }`}
                    title={isThisPlaying ? 'সাউন্ড বাজছে' : 'অধ্যায়টি শুনুন'}
                  >
                    {isThisPlaying ? (
                      <Volume2 className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                <p className="text-xs opacity-75 font-sans-bengali line-clamp-2">
                  {chapter.summary}
                </p>
              </div>
            );
          })}

          {filteredChapters.length === 0 && (
            <div className="text-center py-8 opacity-60 font-sans-bengali text-xs">
              কোনো অধ্যায় খুঁজে পাওয়া যায়নি।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
