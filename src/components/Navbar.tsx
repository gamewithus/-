import React from 'react';
import { 
  BookOpen, 
  Menu, 
  Info, 
  Music, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Bookmark,
  Share2
} from 'lucide-react';
import { ThemeType, AmbientSoundType } from '../types';

interface NavbarProps {
  currentChapterTitle: string;
  currentChapterNumber: string;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onOpenDrawer: () => void;
  onOpenBookInfo: () => void;
  onOpenAmbientModal: () => void;
  currentAmbient: AmbientSoundType;
  isAmbientMuted: boolean;
  onToggleAmbientMute: () => void;
  hasBookmark: boolean;
  onJumpToBookmark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentChapterTitle,
  currentChapterNumber,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  onOpenDrawer,
  onOpenBookInfo,
  onOpenAmbientModal,
  currentAmbient,
  isAmbientMuted,
  onToggleAmbientMute,
  hasBookmark,
  onJumpToBookmark,
}) => {
  const themeLabels: Record<ThemeType, { name: string; icon: React.ReactNode }> = {
    nocturne: { name: 'রাত্রির মায়া', icon: <Moon className="w-3.5 h-3.5 text-amber-400" /> },
    parchment: { name: 'পাণ্ডুলিপি', icon: <Sun className="w-3.5 h-3.5 text-amber-700" /> },
    oled: { name: 'কালিমা', icon: <Moon className="w-3.5 h-3.5 text-emerald-400" /> },
    dawn: { name: 'ভোরবেলা', icon: <Sun className="w-3.5 h-3.5 text-rose-500" /> },
  };

  const getThemeClass = () => {
    switch (theme) {
      case 'parchment':
        return 'bg-[#f4eee1]/95 text-[#2b251e] border-[#e2d5c3] shadow-sm';
      case 'oled':
        return 'bg-black/95 text-neutral-200 border-neutral-800 shadow-md';
      case 'dawn':
        return 'bg-[#f7efe8]/95 text-[#302222] border-[#ecd8cc] shadow-sm';
      case 'nocturne':
      default:
        return 'bg-[#181512]/95 text-[#ede4d8] border-[#2f2720] shadow-md';
    }
  };

  const getButtonBg = () => {
    switch (theme) {
      case 'parchment':
        return 'hover:bg-[#e8decb] text-[#3d3328] border-[#dbcfb9]';
      case 'oled':
        return 'hover:bg-neutral-800 text-neutral-300 border-neutral-700';
      case 'dawn':
        return 'hover:bg-[#eedad0] text-[#422e2e] border-[#e2c7ba]';
      case 'nocturne':
      default:
        return 'hover:bg-[#28211b] text-[#dfd4c5] border-[#3b3127]';
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 ${getThemeClass()}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Drawer Toggle & Book Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenDrawer}
            className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${getButtonBg()}`}
            title="সূচিপত্র খুলুন"
          >
            <Menu className="w-5 h-5 text-amber-500" />
            <span className="hidden sm:inline font-sans-bengali text-xs font-semibold">
              সূচিপত্র
            </span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif-bengali font-bold text-sm sm:text-base text-amber-500 truncate">
                বেলা ফুরাবার আগে
              </span>
              <span className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-sans-bengali">
                আরিফ আজাদ
              </span>
            </div>
            <span className="text-[11px] opacity-75 font-sans-bengali truncate">
              {currentChapterNumber}: {currentChapterTitle}
            </span>
          </div>
        </div>

        {/* Right Actions: Font Size, Theme, Ambient Soundscape, Info */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Bookmark Quick Jump */}
          {hasBookmark && (
            <button
              onClick={onJumpToBookmark}
              className={`p-2 rounded-xl border hidden sm:flex items-center gap-1 transition-all text-xs font-sans-bengali cursor-pointer ${getButtonBg()}`}
              title="সর্বশেষ পাঠের স্থানে যান"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span className="text-[11px]">বুকমার্ক</span>
            </button>
          )}

          {/* Font Size Adjuster (অ- / অ+) */}
          <div className="flex items-center rounded-xl border border-inherit overflow-hidden bg-black/10">
            <button
              onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
              disabled={fontSize <= 14}
              className={`px-2 py-1 text-xs font-serif-bengali transition-colors cursor-pointer disabled:opacity-40 hover:bg-black/10`}
              title="লেখার আকার ছোট করুন"
            >
              অ-
            </button>
            <span className="px-1 text-[11px] font-sans-bengali opacity-70">
              {fontSize}
            </span>
            <button
              onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))}
              disabled={fontSize >= 26}
              className={`px-2 py-1 text-xs font-serif-bengali transition-colors cursor-pointer disabled:opacity-40 hover:bg-black/10`}
              title="লেখার আকার বড় করুন"
            >
              অ+
            </button>
          </div>

          {/* Ambient Soundscape Control */}
          <div className="flex items-center">
            <button
              onClick={onOpenAmbientModal}
              className={`p-2 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${getButtonBg()}`}
              title="আবহসংগীত প্যানেল"
            >
              <Music className="w-4 h-4 text-emerald-500" />
              {currentAmbient !== 'none' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
              )}
            </button>

            {currentAmbient !== 'none' && (
              <button
                onClick={onToggleAmbientMute}
                className="p-1.5 text-xs opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                title={isAmbientMuted ? "আবহসুর আনমিউট করুন" : "আবহসুর মিউট করুন"}
              >
                {isAmbientMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            )}
          </div>

          {/* Theme Dropdown / Cycle */}
          <div className="relative group">
            <button
              className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all text-xs cursor-pointer ${getButtonBg()}`}
              title="পাঠের থিম পরিবর্তন করুন"
            >
              {themeLabels[theme].icon}
              <span className="hidden lg:inline text-[11px] font-sans-bengali">
                {themeLabels[theme].name}
              </span>
            </button>

            <div className={`absolute right-0 mt-1 w-36 rounded-xl border shadow-xl p-1.5 hidden group-hover:block z-50 ${getThemeClass()}`}>
              {(['nocturne', 'parchment', 'oled', 'dawn'] as ThemeType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onThemeChange(t)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-sans-bengali text-left transition-colors cursor-pointer ${
                    theme === t ? 'bg-amber-500/20 font-bold text-amber-500' : 'hover:bg-black/10'
                  }`}
                >
                  {themeLabels[t].icon}
                  <span>{themeLabels[t].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Book Info Modal Button */}
          <button
            onClick={onOpenBookInfo}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${getButtonBg()}`}
            title="প্রেক্ষাপট ও চরিত্র বিশ্লেষণ"
          >
            <Info className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
