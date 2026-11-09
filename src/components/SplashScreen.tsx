import React, { useState, useEffect } from 'react';
import { Smartphone, BookOpen, FileCheck2, ArrowRight, Sparkles, X } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
  isManualPreview?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss, isManualPreview = false }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar from 0 to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (!isManualPreview) {
            // Auto-dismiss after 1.8s on initial load
            setTimeout(onDismiss, 350);
          }
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isManualPreview, onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-br from-[#071126] via-[#0b1b3d] to-[#152a5c] text-white p-6 select-none overflow-hidden animate-fade-in">
      {/* Background Ambient Circles */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with manual close if preview */}
      <div className="w-full max-w-md flex items-center justify-between relative z-10 pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/80 text-white text-[11px] font-bold tracking-wider uppercase border border-red-400/50 shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Official Android Splash</span>
        </span>
        {isManualPreview && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close Splash Preview"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Center Hero Logo Emblem */}
      <div className="flex flex-col items-center text-center relative z-10 max-w-sm my-auto">
        {/* Animated Icon Container */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-red-600 to-blue-600 opacity-40 blur-xl animate-pulse" />
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden bg-[#091429] flex items-center justify-center p-1">
            <img
              src="/icon.svg"
              alt="ENGLISH STUDY CENTRE Icon"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          {/* Subtle Badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-red-600 to-rose-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md border border-white/30 uppercase tracking-wider">
            Deepak Sir
          </div>
        </div>

        {/* Institute Title */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
          ENGLISH STUDY CENTRE
        </h1>

        {/* Subtitle / Director Name */}
        <div className="mt-1 flex items-center gap-2">
          <span className="h-0.5 w-6 bg-red-500 rounded-full" />
          <h2 className="text-base sm:text-lg font-bold text-amber-300 tracking-wide">
            Dir. Deepak Sir
          </h2>
          <span className="h-0.5 w-6 bg-red-500 rounded-full" />
        </div>

        {/* Address and Contact info */}
        <p className="text-xs text-blue-200 mt-1 font-medium">
          Akashi Sasaram (Bihar) • Mob: 7050492611
        </p>

        {/* Features tag */}
        <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-slate-300 font-semibold">
          <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>MCQ Papers</span>
          </span>
          <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
            <FileCheck2 className="w-3.5 h-3.5 text-red-400" />
            <span>OMR Sheets</span>
          </span>
          <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android App</span>
          </span>
        </div>
      </div>

      {/* Bottom Loading Bar and Launch Button */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 relative z-10 pb-4">
        {/* Progress bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[11px] text-slate-400 font-mono">
          <span>Loading Engine...</span>
          <span>{progress}%</span>
        </div>

        <button
          onClick={onDismiss}
          className="mt-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
        >
          <span>Open Application</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
