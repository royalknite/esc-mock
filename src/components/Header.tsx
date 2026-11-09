import React from 'react';
import { BookOpen, FileCheck2, FileText, HelpCircle, Phone, MapPin, GraduationCap } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'paper' | 'document' | 'omr' | 'apk';
  setActiveTab: (tab: 'home' | 'paper' | 'document' | 'omr' | 'apk') => void;
  onOpenWelcome: () => void;
  onOpenSplash?: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenWelcome, onOpenSplash, onOpenInstallModal }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top micro info strip */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-blue-200">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Akashi Sasaram, Bihar</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-blue-200">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mob: 7050492611</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="bg-red-600/90 text-white px-2 py-0.5 rounded-full font-medium text-[11px] tracking-wide">
              SESSION 2026-27
            </span>
            {onOpenSplash && (
              <button
                onClick={onOpenSplash}
                className="text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md"
                title="Preview Official Splash Screen"
              >
                <span>✨ Splash Screen</span>
              </button>
            )}
            <button
              onClick={onOpenWelcome}
              className="text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="About English Study Centre"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Institute Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#091429] flex items-center justify-center text-white shadow-md border-2 border-red-500/80 shrink-0 overflow-hidden p-0.5 group-hover:scale-105 transition-transform">
            <img src="/icon.svg" alt="ESC Launcher Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-blue-950 font-sans">
                ENGLISH STUDY CENTRE
              </h1>
              <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded border border-red-200">
                A4 PDF &amp; APK
              </span>
            </div>
            <p className="text-sm font-semibold text-red-600 tracking-wide flex items-center gap-1.5">
              <span>Dir. Deepak Sir</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-normal text-xs">Question Paper, OMR &amp; Mobile App</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-blue-950 text-white shadow-sm ring-1 ring-blue-950'
                : 'text-slate-700 hover:text-blue-900 hover:bg-slate-200/70'
            }`}
          >
            <span>🏠</span>
            <span>MCQ Home</span>
          </button>
          <button
            onClick={() => setActiveTab('paper')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'paper'
                ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-950'
                : 'text-slate-700 hover:text-blue-900 hover:bg-slate-200/70'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>MCQ Paper</span>
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'document' ? 'bg-indigo-700 text-white shadow-sm ring-1 ring-indigo-800' : 'text-indigo-800 hover:bg-indigo-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paper</span>
          </button>
          <button
            onClick={() => setActiveTab('omr')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'omr'
                ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-700'
                : 'text-slate-700 hover:text-red-700 hover:bg-slate-200/70'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-white" />
            <span>OMR Sheet</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('apk');
              if (onOpenInstallModal) onOpenInstallModal();
            }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'apk'
                ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <span className="text-sm">📱</span>
            <span>Build APK</span>
            <span className="text-[10px] bg-amber-400 text-blue-950 px-1.5 py-0.2 rounded font-black">
              INSTALL
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
