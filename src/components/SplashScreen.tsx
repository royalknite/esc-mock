import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, BookOpen, FileCheck2, ArrowRight, Sparkles, X } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
  isManualPreview?: boolean;
}

const SPLASH_DURATION_MS = 3500;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss, isManualPreview = false }) => {
  const [progress, setProgress] = useState(0);
  const dismissedRef = useRef(false);

  const safeDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismiss();
  };

  useEffect(() => {
    dismissedRef.current = false;
    setProgress(0);
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / SPLASH_DURATION_MS) * 100));
      setProgress(pct);

      if (elapsed < SPLASH_DURATION_MS) {
        rafId = requestAnimationFrame(tick);
      } else if (!isManualPreview) {
        setTimeout(safeDismiss, 150);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isManualPreview]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gradient-to-br from-[#071126] via-[#0b1b3d] to-[#152a5c] text-white p-6 select-none overflow-hidden">
      {/* Background Ambient Circles */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between relative z-10 pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] font-bold tracking-wider uppercase border border-red-400/50 shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>ESC Mock Build App</span>
        </span>
        {isManualPreview && (
          <button
            onClick={safeDismiss}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close Splash Preview"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Center Hero Logo Emblem */}
      <div className="flex flex-col items-center text-center relative z-10 max-w-sm my-auto">
        {/* Animated ESC Logo Container */}
        <div className="relative mb-6 animate-splash-logo">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-red-600 to-blue-600 opacity-50 blur-xl animate-pulse" />
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl shadow-2xl border-2 border-white/25 overflow-hidden bg-[#091429] flex items-center justify-center p-1.5">
            <img
              src="/icon.svg"
              alt="ESC Logo - English Study Centre"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-red-600 to-rose-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md border border-white/30 uppercase tracking-wider">
            Deepak Sir
          </div>
        </div>

        {/* App & Institute Titles */}
        <div className="animate-splash-fade flex flex-col items-center">
          <p className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-emerald-300 mb-1">
            ESC Mock Build App
          </p>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
            English Study Centre
          </h1>

          {/* Subtitle / Director Name */}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-0.5 w-6 bg-red-500 rounded-full" />
            <h2 className="text-base sm:text-lg font-bold text-amber-300 tracking-wide">
              Dir. Deepak Sir
            </h2>
            <span className="h-0.5 w-6 bg-red-500 rounded-full" />
          </div>

          <p className="text-xs text-blue-200 mt-1 font-medium">
            Akashi Sasaram (Bihar) • Mob: 7050492611
          </p>

          {/* Features tag */}
          <div className="flex items-center justify-center gap-2.5 mt-4 text-[11px] text-slate-300 font-semibold flex-wrap">
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
              <span>A4 PDF Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Loading Bar and Launch Button */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 relative z-10 pb-4">
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[11px] text-slate-400 font-mono">
          <span>Opening Home Screen...</span>
          <span>{progress}%</span>
        </div>

        <button
          onClick={safeDismiss}
          className="mt-1 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
        >
          <span>Continue to Home</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
