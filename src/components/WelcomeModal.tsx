import React from 'react';
import { GraduationCap, BookOpen, FileCheck2, CheckCircle2, Sparkles, X, ArrowRight, ShieldCheck, Languages } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'paper' | 'omr' | 'apk') => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onSelectTab }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Top Banner with Red/Blue Accent */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-6 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-xs font-bold tracking-wider uppercase mb-1">
                Official PDF &amp; APK Suite
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
                ENGLISH STUDY CENTRE
              </h2>
              <p className="text-base sm:text-lg font-semibold text-amber-300 flex items-center gap-2 mt-0.5">
                <span>Dir. Deepak Sir</span>
                <span className="text-white/40">•</span>
                <span className="text-white/90 text-sm font-normal">Akashi Sasaram (Mob: 7050492611)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900">
              Question Paper &amp; OMR Sheet PDF Generator + Mobile APK
            </h3>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
              Generate print-ready, authentic A4 Question Papers and OMR Answer Sheets with full Hindi Devanagari and English Unicode support. Also export as an offline single-file app or genuine Android APK!
            </p>
          </div>

          {/* Three Main Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Question Paper Card */}
            <div
              onClick={() => {
                onSelectTab('paper');
                onClose();
              }}
              className="group p-4 rounded-xl border-2 border-blue-200 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4 text-amber-300" />
                </div>
                <h4 className="font-bold text-blue-950 text-sm mb-1 flex items-center justify-between">
                  <span>Question Paper</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug mb-3">
                  Upload TXT with MCQs. Formats for 25 or 50 questions per page with full Devanagari fonts.
                </p>
              </div>
              <div className="text-[10px] font-bold text-blue-800 bg-white px-2 py-1 rounded border border-blue-200 text-center">
                25 &amp; 50 Qs Formats
              </div>
            </div>

            {/* OMR Sheet Card */}
            <div
              onClick={() => {
                onSelectTab('omr');
                onClose();
              }}
              className="group p-4 rounded-xl border-2 border-red-200 hover:border-red-600 bg-rose-50/40 hover:bg-rose-50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-red-950 text-sm mb-1 flex items-center justify-between">
                  <span>OMR Sheet</span>
                  <ArrowRight className="w-3.5 h-3.5 text-red-600 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug mb-3">
                  Independent OMR generator. Ranges 1–50, 100, 150, 200, 250 with roll matrix and 5-col layout.
                </p>
              </div>
              <div className="text-[10px] font-bold text-red-800 bg-white px-2 py-1 rounded border border-red-200 text-center">
                5-Column Bubbles
              </div>
            </div>

            {/* APK & Offline Card */}
            <div
              onClick={() => {
                onSelectTab('apk');
                onClose();
              }}
              className="group p-4 rounded-xl border-2 border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform text-sm">
                  📱
                </div>
                <h4 className="font-bold text-emerald-950 text-sm mb-1 flex items-center justify-between">
                  <span>Build APK / Offline</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug mb-3">
                  Download single-file HTML app, install WebAPK on Android, or export Capacitor APK project.
                </p>
              </div>
              <div className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-200 text-center">
                Capacitor &amp; WebAPK
              </div>
            </div>
          </div>

          {/* Key Institute Features */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 font-medium">
                <Languages className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Devanagari Font</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Exact A4 Dimensions</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Instant PDF Download</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <span>Zero Question Loss</span>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900 transition-colors shadow-md text-sm cursor-pointer"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
