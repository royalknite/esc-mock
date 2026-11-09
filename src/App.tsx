/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WelcomeModal } from './components/WelcomeModal';
import { FileUploadAndEditor } from './components/QuestionPaperGenerator/FileUploadAndEditor';
import { PaperSettingsPanel } from './components/QuestionPaperGenerator/PaperSettingsPanel';
import { PaperPreview } from './components/QuestionPaperGenerator/PaperPreview';
import { QuestionListModal } from './components/QuestionPaperGenerator/QuestionListModal';
import { OMRSettingsPanel } from './components/OMRSheetGenerator/OMRSettingsPanel';
import { OMRPreview } from './components/OMRSheetGenerator/OMRPreview';
import { HomeDashboard } from './components/HomeDashboard/HomeDashboard';
import { APKDashboard } from './components/APKBuilder/APKDashboard';
import { APKInstallModal } from './components/APKBuilder/APKInstallModal';
import { DocumentPaper } from './components/QuestionPaperGenerator/DocumentPaper';
import { SplashScreen } from './components/SplashScreen';
import { TopInstallBanner } from './components/TopInstallBanner';
import { Question, ParseWarning, PaperSettings, OMRSettings } from './types';
import { SAMPLE_TESTS, SampleTest } from './utils/sampleData';
import { parseMCQText } from './utils/txtParser';
import { ArrowRight, BookOpen, FileCheck2, FileText, Sparkles, Smartphone, Download, Home } from 'lucide-react';

const STORAGE_KEY_PAPER_SETTINGS = 'esc_paper_settings_v1';
const STORAGE_KEY_OMR_SETTINGS = 'esc_omr_settings_v1';
const STORAGE_KEY_QUESTIONS = 'esc_questions_v1';
const STORAGE_KEY_WELCOMED = 'esc_has_welcomed_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'paper' | 'document' | 'omr' | 'apk'>('home');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isAPKInstallModalOpen, setIsAPKInstallModalOpen] = useState(false);

  // Question Paper State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [warnings, setWarnings] = useState<ParseWarning[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const [paperSettings, setPaperSettings] = useState<PaperSettings>(() => {
    const defaults: PaperSettings = {
      instituteName: 'ENGLISH STUDY CENTRE', directorName: 'Dir. Deepak Sir',
      location: 'AKASHI SASARAM', mobileNumber: '7050492611', subject: 'ENGLISH',
      lesson: 'Tense, Voice & Preposition', className: '10 / 12', session: '2026-27',
      testTitle: 'WEEKLY OBJECTIVE TEST', totalQuestions: 25, timeAllowed: '60 Minutes',
      fullMarks: '50 Marks', format: '25',
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAPER_SETTINGS);
      if (!saved) return defaults;
      const parsed = JSON.parse(saved);
      return { ...defaults, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
    } catch { return defaults; }
  });

  // OMR Sheet State
  const [omrSettings, setOmrSettings] = useState<OMRSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OMR_SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      instituteName: 'ENGLISH STUDY CENTRE',
      directorName: 'Dir. Deepak Sir',
      location: 'AKASHI SASARAM',
      mobileNumber: '7050492611',
      examTitle: 'OBJECTIVE EXAMINATION 2026-27',
      subject: 'ENGLISH',
      className: '10 / 12',
      date: '10/11/2026',
      startNumber: 1,
      endNumber: 100,
      bubbleCount: 4,
      includeCandidateFields: true,
      includeRollMatrix: true,
      columnsPerPage: 5,
      questionsPerColumn: 20,
    };
  });

  // Initial load: either restore from local storage or load default 25Q sample
  useEffect(() => {
    const hasWelcomed = localStorage.getItem(STORAGE_KEY_WELCOMED);
    if (!hasWelcomed) {
      setIsWelcomeOpen(true);
      localStorage.setItem(STORAGE_KEY_WELCOMED, 'true');
    }

    const savedQuestions = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          setFileName('Saved_Session_Paper.txt');
          return;
        }
      } catch (e) {
        // ignore
      }
    }

    // Default load sample 1 (English Grammar 25 questions) so user sees instant working state
    const defaultSample = SAMPLE_TESTS[0];
    const parseRes = parseMCQText(defaultSample.content);
    setQuestions(parseRes.questions);
    setWarnings(parseRes.warnings);
    setRawText(defaultSample.content);
    setFileName(`${defaultSample.name}.txt`);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAPER_SETTINGS, JSON.stringify(paperSettings));
  }, [paperSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OMR_SETTINGS, JSON.stringify(omrSettings));
  }, [omrSettings]);

  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
    }
  }, [questions]);

  // Handle data load from file upload or sample
  const handleDataLoaded = (
    loadedQuestions: Question[],
    loadedWarnings: ParseWarning[],
    loadedRawText: string,
    loadedFileName: string
  ) => {
    setQuestions(loadedQuestions);
    setWarnings(loadedWarnings);
    setRawText(loadedRawText);
    setFileName(loadedFileName);
    setPaperSettings((prev) => ({
      ...prev,
      totalQuestions: loadedQuestions.length,
    }));
  };

  const handleClearAll = () => {
    if (window.confirm('Reset questions and upload a new TXT file?')) {
      setQuestions([]);
      setWarnings([]);
      setRawText('');
      setFileName('');
      localStorage.removeItem(STORAGE_KEY_QUESTIONS);
    }
  };

  // Sync Question Count with OMR Sheet
  const handleSyncWithOMR = () => {
    setOmrSettings((prev) => ({
      ...prev,
      startNumber: 1,
      endNumber: Math.max(1, questions.length || 50),
      subject: paperSettings.subject,
      className: paperSettings.className,
      examTitle: paperSettings.testTitle,
    }));
    setActiveTab('omr');
  };

  const handleLoadSample = (sample: SampleTest) => {
    const parseRes = parseMCQText(sample.content);
    handleDataLoaded(parseRes.questions, parseRes.warnings, sample.content, `${sample.name}.txt`);
    setPaperSettings((prev) => ({
      ...prev,
      subject: sample.subject,
      lesson: sample.lesson,
      className: sample.className,
      totalQuestions: sample.count,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans pb-16 sm:pb-0">
      {/* Chrome Android Native Top Install Banner ("page ke upar Install dia rhata hai") */}
      <TopInstallBanner />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        onOpenSplash={() => setShowSplash(true)}
        onOpenInstallModal={() => setIsAPKInstallModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* Banner with Fast Switcher & Director's Desk */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                Active Module:
              </span>
              <span className="text-sm font-black text-blue-950">
                {activeTab === 'home' && 'HOME DASHBOARD • OVERVIEW'}
                {activeTab === 'paper' && 'MCQ QUESTION PAPER GENERATOR'}
                {activeTab === 'document' && 'TXT QUESTION PAPER GENERATOR'}
                {activeTab === 'omr' && 'OMR ANSWER SHEET GENERATOR'}
                {activeTab === 'apk' && 'BUILD APK & OFFLINE APP EXPORT'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {activeTab === 'home' && 'Institute Overview, Quick Launchers, Extracted MCQ Stats & Director Desk.'}
              {activeTab === 'paper' && 'Upload TXT with MCQs, select 25 or 50 questions per page, preview live, and download authentic A4 PDF.'}
              {activeTab === 'document' && 'Upload or paste a complete TXT question paper and download it as a multi-page A4 PDF.'}
              {activeTab === 'omr' && 'Select question range (1-50, 1-100, 1-150, 1-200, 1-250), candidate fields, and download printable A4 OMR.'}
              {activeTab === 'apk' && 'Download single-file HTML app, install WebAPK on Android, or export Capacitor project for Google Play.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'home' && (
              <button
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                <span>🏠 Home Dashboard</span>
              </button>
            )}

            {activeTab === 'paper' && questions.length > 0 && (
              <button
                onClick={handleSyncWithOMR}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-red-600" />
                <span>Create Matching OMR (1–{questions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {activeTab !== 'paper' && (
              <button
                onClick={() => setActiveTab('paper')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-blue-700" />
                <span>MCQ Paper</span>
              </button>
            )}

            {activeTab !== 'document' && (
              <button
                onClick={() => setActiveTab('document')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-700" />
                <span>Paper</span>
              </button>
            )}

            {activeTab !== 'omr' && (
              <button
                onClick={() => setActiveTab('omr')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-red-600" />
                <span>OMR Sheet</span>
              </button>
            )}

            {activeTab !== 'apk' && (
              <button
                onClick={() => {
                  setActiveTab('apk');
                  setIsAPKInstallModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Build APK</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 0: HOME DASHBOARD */}
        {activeTab === 'home' && (
          <HomeDashboard
            onNavigate={setActiveTab}
            questions={questions}
            paperSettings={paperSettings}
            omrSettings={omrSettings}
            onLoadSample={handleLoadSample}
            onOpenQuestionEditor={() => setIsQuestionEditorOpen(true)}
            onOpenInstallModal={() => setIsAPKInstallModalOpen(true)}
          />
        )}

        {/* TAB 1: QUESTION PAPER GENERATOR */}
        {activeTab === 'paper' && (
          <div className="space-y-6">
            {/* Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: File Upload & Controls */}
              <div className="lg:col-span-5 space-y-6">
                <FileUploadAndEditor
                  questions={questions}
                  warnings={warnings}
                  rawText={rawText}
                  fileName={fileName}
                  onDataLoaded={handleDataLoaded}
                  onOpenQuestionEditor={() => setIsQuestionEditorOpen(true)}
                  onClear={handleClearAll}
                />

                <PaperSettingsPanel
                  settings={paperSettings}
                  onChange={setPaperSettings}
                  totalParsedQuestions={questions.length}
                />
              </div>

              {/* Right Column: Live A4 PDF Preview & Download */}
              <div className="lg:col-span-7">
                <PaperPreview questions={questions} settings={paperSettings} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TXT DOCUMENT QUESTION PAPER */}
        {activeTab === 'document' && <DocumentPaper />}

        {/* TAB 2: OMR SHEET GENERATOR (INDEPENDENT) */}
        {activeTab === 'omr' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Range & Settings */}
              <div className="lg:col-span-5 space-y-6">
                <OMRSettingsPanel settings={omrSettings} onChange={setOmrSettings} />
              </div>

              {/* Right Column: Live A4 OMR Preview & Download */}
              <div className="lg:col-span-7">
                <OMRPreview settings={omrSettings} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUILD APK / DOWNLOAD APK (DEDICATED SECTION) */}
        {activeTab === 'apk' && (
          <div className="space-y-6">
            <APKDashboard onOpenSplash={() => setShowSplash(true)} />
          </div>
        )}
      </main>

      {/* Android Mobile Bottom Navigation Bar (MCQ Home, MCQ, Paper, OMR, APK) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-2 flex justify-around items-center z-40 md:hidden shadow-lg no-print">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold cursor-pointer transition-colors ${
            activeTab === 'home' ? 'text-blue-950 font-black' : 'text-slate-500'
          }`}
        >
          <span className="text-base leading-none">🏠</span>
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('paper')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold cursor-pointer transition-colors ${
            activeTab === 'paper' ? 'text-blue-900 font-black' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>MCQ</span>
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold cursor-pointer transition-colors ${activeTab === 'document' ? 'text-indigo-700 font-black' : 'text-slate-500'}`}
        >
          <FileText className="w-4 h-4" />
          <span>Paper</span>
        </button>
        <button
          onClick={() => setActiveTab('omr')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold cursor-pointer transition-colors ${
            activeTab === 'omr' ? 'text-red-600 font-black' : 'text-slate-500'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>OMR</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('apk');
            setIsAPKInstallModalOpen(true);
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold cursor-pointer transition-colors ${
            activeTab === 'apk' ? 'text-emerald-700 font-black' : 'text-slate-500'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Install APK</span>
        </button>
      </nav>

      {/* Footer Strip */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 mt-12 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-700">
            ENGLISH STUDY CENTRE • Dir. Deepak Sir • Akashi Sasaram (Bihar)
          </div>
          <div>Mob: 7050492611 • Academic Session 2026-27 • Real A4 PDF Output</div>
        </div>
      </footer>

      {/* Welcome / Info Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsWelcomeOpen(false);
        }}
      />

      {/* Question Editor Modal */}
      <QuestionListModal
        isOpen={isQuestionEditorOpen}
        onClose={() => setIsQuestionEditorOpen(false)}
        questions={questions}
        onUpdateQuestions={(updated) => {
          setQuestions(updated);
          setPaperSettings((prev) => ({
            ...prev,
            totalQuestions: updated.length,
          }));
        }}
      />

      {/* Official Android Splash Screen */}
      {showSplash && (
        <SplashScreen
          onDismiss={() => setShowSplash(false)}
          isManualPreview={true}
        />
      )}

      {/* Clean Full-Screen APK Installation Modal */}
      <APKInstallModal
        isOpen={isAPKInstallModalOpen}
        onClose={() => setIsAPKInstallModalOpen(false)}
      />
    </div>
  );
}
