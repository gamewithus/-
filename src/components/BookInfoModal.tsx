import React from 'react';
import { X, Book, Feather, Users, Sparkles, Quote } from 'lucide-react';
import { BOOK_METADATA } from '../data/bookInfo';
import { ThemeType } from '../types';

interface BookInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
}

export const BookInfoModal: React.FC<BookInfoModalProps> = ({
  isOpen,
  onClose,
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

  const getCardBg = () => {
    switch (theme) {
      case 'parchment':
        return 'bg-[#f2ece0] border-[#dfd4c0]';
      case 'oled':
        return 'bg-neutral-900 border-neutral-800';
      case 'dawn':
        return 'bg-[#f4ebe3] border-[#e2d0c2]';
      case 'nocturne':
      default:
        return 'bg-[#231d18] border-[#382e25]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border shadow-2xl z-10 overflow-hidden ${getModalBg()}`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-bengali font-bold text-lg text-amber-500">
                গল্পের প্রেক্ষাপট ও চরিত্র পরিচিতি
              </h2>
              <p className="text-xs opacity-70 font-sans-bengali">
                {BOOK_METADATA.title} • {BOOK_METADATA.author}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Book Banner Card */}
          <div className={`p-4 rounded-xl border flex flex-col gap-2 ${getCardBg()}`}>
            <span className="text-[11px] font-sans-bengali px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 w-fit">
              {BOOK_METADATA.category}
            </span>
            <h3 className="font-serif-bengali font-bold text-base sm:text-lg text-amber-500">
              {BOOK_METADATA.tagline}
            </h3>
            <p className="text-xs sm:text-sm font-sans-bengali leading-relaxed opacity-85">
              {BOOK_METADATA.description}
            </p>
            <div className="flex items-center gap-4 text-[11px] opacity-70 font-sans-bengali pt-2 border-t border-inherit/40">
              <span>প্রকাশক: {BOOK_METADATA.publisher}</span>
              <span>মোট পৃষ্ঠা: {BOOK_METADATA.totalPages}</span>
              <span>অধ্যায়: ২০টি</span>
            </div>
          </div>

          {/* Historical Context & Thematic Pillars */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-500">
              <Feather className="w-4 h-4" />
              <h4 className="font-serif-bengali font-bold text-sm sm:text-base">
                গ্রন্থটির দার্শনিক পটভূমি ও মূল্যায়ন
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {BOOK_METADATA.historicalContext.map((item, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border ${getCardBg()}`}>
                  <h5 className="font-serif-bengali font-semibold text-xs sm:text-sm text-amber-400 mb-1">
                    {item.title}
                  </h5>
                  <p className="text-xs font-sans-bengali leading-relaxed opacity-80">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Characters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-500">
              <Users className="w-4 h-4" />
              <h4 className="font-serif-bengali font-bold text-sm sm:text-base">
                উল্লেখযোগ্য ঐতিহাসিক ব্যক্তিত্ব ও রূপক চরিত্র
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOOK_METADATA.keyCharacters.map((char, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex flex-col justify-between ${getCardBg()}`}>
                  <div>
                    <span className="text-[10px] font-sans-bengali px-1.5 py-0.5 rounded bg-black/10 opacity-70">
                      {char.role}
                    </span>
                    <h5 className="font-serif-bengali font-bold text-sm mt-1 text-amber-400">
                      {char.name}
                    </h5>
                    <p className="text-xs font-sans-bengali mt-1 opacity-80 leading-relaxed">
                      {char.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Author Note */}
          <div className={`p-4 rounded-xl border border-amber-500/20 bg-amber-500/5`}>
            <div className="flex items-center gap-2 text-amber-500 mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span className="font-serif-bengali font-bold text-xs sm:text-sm">
                লেখক পরিচিতি : আরিফ আজাদ
              </span>
            </div>
            <p className="text-xs font-sans-bengali leading-relaxed opacity-85">
              {BOOK_METADATA.authorBio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
