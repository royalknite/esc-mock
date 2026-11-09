import React from 'react';
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  Smartphone,
  Sparkles,
  ArrowRight,
  FileDown,
  Printer,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  Upload,
  ListOrdered,
  FileText
} from 'lucide-react';
import { Question, PaperSettings, OMRSettings } from '../../types';
import { SAMPLE_TESTS, SampleTest } from '../../utils/sampleData';

interface HomeDashboardProps {
  onNavigate: (tab: 'home' | 'paper' | 'document' | 'omr' | 'apk') => void;
  questions: Question[];
  paperSettings: PaperSettings;
  omrSettings: OMRSettings;
  onLoadSample: (sample: SampleTest) => void;
  onOpenQuestionEditor: () => void;
  onOpenInstallModal?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  questions,
  paperSettings,
  omrSettings,
  onLoadSample,
  onOpenQuestionEditor,
  onOpenInstallModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Institute Hero Header */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#091429] flex items-center justify-center shadow-xl border-2 border-red-500/80 shrink-0 overflow-hidden p-1">
              <img src="/icon.svg" alt="ESC Launcher Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-600/90 text-white text-xs font-bold tracking-wider uppercase mb-1.5 shadow-xs">
                Director's Dashboard • सत्र 2026-27
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight font-sans">
                ENGLISH STUDY CENTRE
              </h1>
              <p className="text-sm sm:text-base font-bold text-amber-300 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Dir. Deepak Sir</span>
                <span className="text-white/40">•</span>
                <span className="text-white/90 text-xs sm:text-sm font-normal">
                  Akashi Sasaram, Rohtas (Bihar) • Mob: 7050492611
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onNavigate('paper')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>MCQ Paper</span>
            </button>
            <button
              onClick={() => onNavigate('document')}
              className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-900 hover:bg-indigo-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>TXT Paper Generator</span>
            </button>
            <button
              onClick={() => onNavigate('omr')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>OMR Sheet</span>
            </button>
            <button
              onClick={() => {
                if (onOpenInstallModal) onOpenInstallModal();
                else onNavigate('apk');
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-amber-300" />
              <span>Build / Download APK</span>
            </button>
          </div>
        </div>

        {/* Live Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-blue-800/80">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-blue-200 font-medium">MCQs Loaded</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {questions.length} Questions
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-blue-200 font-medium">Paper Format</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
              {paperSettings.format} Qs / Page
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-blue-200 font-medium">OMR Range</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
              {omrSettings.startNumber}–{omrSettings.endNumber}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-blue-200 font-medium">Print Paper Size</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              A4 Portrait
            </div>
          </div>
        </div>
      </div>

      {/* Main 3 Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: MCQ Question Paper Generator */}
        <div className="bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-500 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-amber-300" />
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                25 &amp; 50 Qs
              </span>
            </div>
            <h3 className="text-base font-black text-blue-950 mb-1">
              MCQ Question Paper Generator
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Upload any TXT file with MCQs. Automatically extracts questions and options in English &amp; Hindi Devanagari. Choose <strong>25</strong> or <strong>50 Qs/Page</strong> layout.
            </p>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 mb-3 space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Subject:</span>
                <span className="font-bold text-blue-900">{paperSettings.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Class &amp; Session:</span>
                <span className="font-bold text-slate-900">{paperSettings.className} • {paperSettings.session}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigate('paper')}
              className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open MCQ Generator</span>
              <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </button>
            {questions.length > 0 && (
              <button
                onClick={onOpenQuestionEditor}
                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-center"
              >
                Review / Edit ({questions.length} Qs)
              </button>
            )}
          </div>
        </div>

        {/* Card 2: OMR Answer Sheet Generator */}
        <div className="bg-white rounded-2xl border-2 border-red-100 hover:border-red-500 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-red-800 bg-rose-50 px-2.5 py-1 rounded-full border border-red-200">
                1 to 250 Range
              </span>
            </div>
            <h3 className="text-base font-black text-red-950 mb-1">
              OMR Answer Sheet Generator
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Works completely independently. Choose from presets: <strong>1 to 50, 100, 150, 200, 250</strong>. Features 5-column layout with 20 questions/col and roll number matrix.
            </p>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 mb-3 space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Selected Range:</span>
                <span className="font-bold text-red-700">{omrSettings.startNumber} to {omrSettings.endNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Grid Format:</span>
                <span className="font-bold text-slate-900">5 Columns • 20 Qs/Col</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigate('omr')}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open OMR Generator</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-[11px] text-center text-slate-400 py-1">
              Printable A4 with Signature Boxes
            </div>
          </div>
        </div>

        {/* Card 3: Build APK / Download Mobile App */}
        <div className="bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-600 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                APK &amp; Offline App
              </span>
            </div>
            <h3 className="text-base font-black text-emerald-950 mb-1">
              Build APK / Download APK
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Download the complete application as an installable file for your Android phone. Run 100% offline or export the Android Capacitor APK project.
            </p>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 mb-3 space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Android WebAPK:</span>
                <span className="font-bold text-emerald-700">Direct 1-Tap Install</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Single-File App:</span>
                <span className="font-bold text-blue-900">Offline .HTML File</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                if (onOpenInstallModal) onOpenInstallModal();
                else onNavigate('apk');
              }}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-white" />
              <span>Install Now / Download APK</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-[11px] text-center text-slate-500 py-1">
              Direct 1-Tap Home Screen Install
            </div>
          </div>
        </div>
      </div>

      {/* Built-in Sample Test Launchers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Quick Test Loaders (English Study Centre Official Papers)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Click to instantly load &amp; generate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_TESTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onLoadSample(sample);
                onNavigate('paper');
              }}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-blue-900">
                    {sample.count} Questions
                  </span>
                  <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                    {sample.subject}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mb-1">
                  {sample.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {sample.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 mt-2">
                <span>Load &amp; Generate A4 PDF</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Teacher Guide in Hindi & English */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h4 className="font-bold text-sm">
            शिक्षक निर्देश एवं उपयोग मार्गदर्शिका (Teacher's Guide)
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-1">
            <strong className="text-white block">1. प्रश्न पत्र (Question Paper) कैसे बनाएं:</strong>
            <p>
              अपने फोन या कंप्यूटर से किसी भी TXT फाइल को अपलोड करें या सीधे टेक्स्ट पेस्ट करें। ऐप अपने आप 1., (A), (B), (C), (D) पहचान लेता है और हिंदी देवनागरी फ़ॉन्ट को बिना खराब किए शुद्ध रूप में A4 PDF तैयार करता है। 25 या 50 प्रश्न प्रति पृष्ठ चुनें।
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-white block">2. ओएमआर शीट (OMR Sheet) कैसे बनाएं:</strong>
            <p>
              OMR जनरेटर पूरी तरह स्वतंत्र है। प्रश्न सीमा (1 से 50, 100, 150, 200, 250) चुनें। 5-कॉलम और 20 प्रश्न प्रति कॉलम लेआउट में डार्क प्रिंटेबल बबल, रोल नंबर मैट्रिक्स और छात्र विवरण बॉक्स अपने आप बन जाते हैं।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
