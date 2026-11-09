import React from 'react';
import { PaperSettings, PaperFormat } from '../../types';
import { Settings, LayoutGrid, FileText, CheckCircle2 } from 'lucide-react';

interface PaperSettingsPanelProps {
  settings: PaperSettings;
  onChange: (updated: PaperSettings) => void;
  totalParsedQuestions: number;
}

export const PaperSettingsPanel: React.FC<PaperSettingsPanelProps> = ({
  settings,
  onChange,
  totalParsedQuestions,
}) => {
  const handleInputChange = (field: keyof PaperSettings, value: string | number) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-5 no-print">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-900 flex items-center justify-center font-bold">
          2
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Question Paper Settings &amp; Layout
          </h3>
          <p className="text-xs text-slate-500">
            Choose the layout: 50 questions in 2 pages or 100 questions in 2 pages
          </p>
        </div>
      </div>

      {/* Selectable PDF Layout Options (Required in Item 6) */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Select PDF Page Layout Format:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Format 1: 25 per page */}
          <div
            onClick={() => handleInputChange('format', '25')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
              settings.format === '25'
                ? 'border-blue-700 bg-blue-50/60 shadow-xs ring-1 ring-blue-700'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                    settings.format === '25'
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  25
                </div>
                <div>
                  <h4 className="font-black text-blue-950 text-sm">
                    FORMAT 1: 25 Questions / Page
                  </h4>
                  <span className="text-[11px] text-blue-800 font-semibold">
                    Spacious &amp; Standard Exam Format
                  </span>
                </div>
              </div>
              {settings.format === '25' && (
                <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
              )}
            </div>
            <ul className="mt-3 text-xs text-slate-600 space-y-1 pl-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Two-column layout (Q1–13 left, Q14–25 right)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Standard spacing, clear Hindi Devanagari fonts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>50 questions = exactly 2 A4 pages</span>
              </li>
            </ul>
          </div>

          {/* Format 2: 50 per page */}
          <div
            onClick={() => handleInputChange('format', '50')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
              settings.format === '50'
                ? 'border-red-600 bg-rose-50/60 shadow-xs ring-1 ring-red-600'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                    settings.format === '50'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  50
                </div>
                <div>
                  <h4 className="font-black text-red-950 text-sm">
                    FORMAT 2: 50 Questions / Page
                  </h4>
                  <span className="text-[11px] text-red-700 font-semibold">
                    Compact &amp; Paper-Saving Layout
                  </span>
                </div>
              </div>
              {settings.format === '50' && (
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />
              )}
            </div>
            <ul className="mt-3 text-xs text-slate-600 space-y-1 pl-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                <span>Compact two-column layout (25 left, 25 right per page)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                <span>100 questions = exactly 2 A4 pages</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                <span>Compact spacing; 100 questions fit into 2 A4 pages</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Information Inputs (Editable as required) */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Test &amp; Institute Header Details:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Name:
            </label>
            <input
              type="text"
              value={settings.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="e.g. ENGLISH"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lesson / Chapter:
            </label>
            <input
              type="text"
              value={settings.lesson}
              onChange={(e) => handleInputChange('lesson', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="e.g. TENSE & VOICE"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class:
            </label>
            <input
              type="text"
              value={settings.className}
              onChange={(e) => handleInputChange('className', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="e.g. 10 / 12"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Test Title:
            </label>
            <input
              type="text"
              value={settings.testTitle}
              onChange={(e) => handleInputChange('testTitle', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="e.g. WEEKLY OBJECTIVE TEST"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Session:
            </label>
            <input
              type="text"
              value={settings.session}
              onChange={(e) => handleInputChange('session', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="e.g. 2026-27"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Questions:
            </label>
            <input
              type="number"
              value={settings.totalQuestions || totalParsedQuestions || 0}
              onChange={(e) => handleInputChange('totalQuestions', parseInt(e.target.value, 10) || 0)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="e.g. 50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institute Name:
            </label>
            <input
              type="text"
              value={settings.instituteName}
              onChange={(e) => handleInputChange('instituteName', e.target.value)}
              className="w-full text-xs font-bold text-blue-900 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="ENGLISH STUDY CENTRE"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Director Name:
            </label>
            <input
              type="text"
              value={settings.directorName}
              onChange={(e) => handleInputChange('directorName', e.target.value)}
              className="w-full text-xs font-semibold text-red-700 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="Dir. Deepak Sir"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Branch:
            </label>
            <input
              type="text"
              value={settings.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="AKASHI SASARAM"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number (Optional):
            </label>
            <input
              type="text"
              value={settings.mobileNumber}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="7050492611"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Time Allowed:
            </label>
            <input
              type="text"
              value={settings.timeAllowed}
              onChange={(e) => handleInputChange('timeAllowed', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="60 Minutes"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Marks:
            </label>
            <input
              type="text"
              value={settings.fullMarks}
              onChange={(e) => handleInputChange('fullMarks', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              placeholder="50 Marks"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
