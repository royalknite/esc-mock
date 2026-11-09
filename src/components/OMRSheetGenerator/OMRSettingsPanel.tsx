import React from 'react';
import { OMRSettings } from '../../types';
import { CheckCircle2, Sliders, Calendar, Hash, FileCheck, Layers } from 'lucide-react';

interface OMRSettingsPanelProps {
  settings: OMRSettings;
  onChange: (updated: OMRSettings) => void;
}

export const OMRSettingsPanel: React.FC<OMRSettingsPanelProps> = ({ settings, onChange }) => {
  const handleInputChange = (field: keyof OMRSettings, value: string | number | boolean) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const setPresetRange = (start: number, end: number) => {
    onChange({
      ...settings,
      startNumber: start,
      endNumber: end,
    });
  };

  const totalQuestions = Math.max(1, settings.endNumber - settings.startNumber + 1);
  const questionsPerPage = 100;
  const estimatedPages = Math.ceil(totalQuestions / questionsPerPage);

  const presets = [
    { label: '1 to 50', start: 1, end: 50 },
    { label: '1 to 100', start: 1, end: 100 },
    { label: '1 to 150', start: 1, end: 150 },
    { label: '1 to 200', start: 1, end: 200 },
    { label: '1 to 250', start: 1, end: 250 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-5 no-print">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-900 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5 text-red-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              OMR Answer Sheet Range &amp; Setup
            </h3>
            <p className="text-xs text-slate-500">
              Select question range manually. Generates authentic A4 OMR with 5-column layout.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
            {totalQuestions} Questions • {estimatedPages} Page{estimatedPages > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Range Presets (Required in Item 8) */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Quick Range Presets:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {presets.map((preset) => {
            const isSelected =
              settings.startNumber === preset.start && settings.endNumber === preset.end;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPresetRange(preset.start, preset.end)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-400'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Range Inputs */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Custom Question Range:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Starting Question Number:
            </label>
            <input
              type="number"
              min={1}
              value={settings.startNumber}
              onChange={(e) =>
                handleInputChange('startNumber', Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ending Question Number:
            </label>
            <input
              type="number"
              min={settings.startNumber}
              value={settings.endNumber}
              onChange={(e) =>
                handleInputChange(
                  'endNumber',
                  Math.max(settings.startNumber, parseInt(e.target.value, 10) || settings.startNumber)
                )
              }
              className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* Exam & Header Info */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          OMR Header &amp; Candidate Fields:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institute Name:
            </label>
            <input
              type="text"
              value={settings.instituteName}
              onChange={(e) => handleInputChange('instituteName', e.target.value)}
              className="w-full text-xs font-bold text-blue-900 px-3 py-2 rounded-lg border border-slate-300 bg-white"
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
              className="w-full text-xs font-semibold text-red-700 px-3 py-2 rounded-lg border border-slate-300 bg-white"
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
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Title:
            </label>
            <input
              type="text"
              value={settings.examTitle}
              onChange={(e) => handleInputChange('examTitle', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject &amp; Class:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="Subject"
                value={settings.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
              />
              <input
                type="text"
                placeholder="Class"
                value={settings.className}
                onChange={(e) => handleInputChange('className', e.target.value)}
                className="w-full text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Date:
            </label>
            <input
              type="text"
              value={settings.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white"
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={settings.includeCandidateFields}
              onChange={(e) => handleInputChange('includeCandidateFields', e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-700">
              Include Candidate Name, Date &amp; Signature Boxes
            </span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={settings.includeRollMatrix}
              onChange={(e) => handleInputChange('includeRollMatrix', e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-700">
              Include 7-Digit Roll Number OMR Bubble Matrix
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
