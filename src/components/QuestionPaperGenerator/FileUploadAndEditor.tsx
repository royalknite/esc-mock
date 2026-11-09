import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Edit3, Trash2 } from 'lucide-react';
import { Question, ParseWarning } from '../../types';
import { parseMCQText } from '../../utils/txtParser';
import { SAMPLE_TESTS, SampleTest } from '../../utils/sampleData';

interface FileUploadAndEditorProps {
  questions: Question[];
  warnings: ParseWarning[];
  rawText: string;
  fileName: string;
  onDataLoaded: (questions: Question[], warnings: ParseWarning[], rawText: string, fileName: string) => void;
  onOpenQuestionEditor: () => void;
  onClear: () => void;
}

export const FileUploadAndEditor: React.FC<FileUploadAndEditorProps> = ({
  questions,
  warnings,
  rawText,
  fileName,
  onDataLoaded,
  onOpenQuestionEditor,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const processText = (text: string, name: string) => {
    const result = parseMCQText(text);
    onDataLoaded(result.questions, result.warnings, text, name);
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      processText(content, file.name);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleLoadSample = (sample: SampleTest) => {
    processText(sample.content, `${sample.name}.txt`);
  };

  const handleApplyPastedText = () => {
    if (!pastedText.trim()) return;
    processText(pastedText, 'Pasted_Questions.txt');
    setIsManualInputOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4 no-print">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Upload Question Paper TXT
            </h3>
            <p className="text-xs text-slate-500">
              Auto-extracts English &amp; Hindi MCQs with full Unicode fidelity
            </p>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQuestionEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Questions ({questions.length})</span>
            </button>
            <button
              onClick={onClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Clear & Reset"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70 scale-[0.99]'
            : questions.length > 0
            ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40'
            : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs ${
              questions.length > 0
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-900 text-white'
            }`}
          >
            {questions.length > 0 ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <span className="font-bold text-slate-800 text-sm block">
              {questions.length > 0 ? (
                <span className="text-emerald-800 font-semibold">
                  File Loaded: {fileName}
                </span>
              ) : (
                'Click or Drag & Drop TXT File here'
              )}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Supports 1., (A), (B), (C), (D) format in English, Hindi, and mathematical symbols
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 shadow-2xs hover:border-blue-400">
              Browse from Device / Mobile Storage
            </span>
          </div>
        </div>
      </div>

      {/* Quick Sample Selector */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Or try instantly with pre-loaded Institute test papers:</span>
          </div>
          <button
            type="button"
            onClick={() => setIsManualInputOpen(!isManualInputOpen)}
            className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer underline"
          >
            {isManualInputOpen ? 'Hide Paste Box' : 'Or Paste Text directly'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLE_TESTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-blue-900 group-hover:text-blue-700">
                  {sample.count} Questions
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                  {sample.subject}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold line-clamp-1">
                {sample.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Paste Text Box (Collapsible) */}
      {isManualInputOpen && (
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Paste TXT Question Paper Content:
          </label>
          <textarea
            rows={5}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="1. What is the antonym of candid?&#10;(A) Frank (B) Secretive (C) Polite (D) Honest&#10;&#10;2. 'सूर्योदय' का संधि विच्छेद क्या है?&#10;(A) सूर्य + उदय (B) सूर्यो + दय (C) सूर + उदय (D) सूर्य + दय"
            className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white font-hindi"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleApplyPastedText}
              className="px-4 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-950 transition-colors cursor-pointer"
            >
              Parse Pasted Questions
            </button>
          </div>
        </div>
      )}

      {/* Status Bar / Extracted Stats */}
      {questions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Successfully extracted <strong>{questions.length}</strong> questions with complete A, B, C, D options!
            </span>
          </div>
          <button
            onClick={onOpenQuestionEditor}
            className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
          >
            Review all {questions.length} questions
          </button>
        </div>
      )}

      {/* Validation Warnings (Required by prompt: "If formatting is incorrect, show the question number and the error") */}
      {warnings.length > 0 && (
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Formatting Notice: {warnings.length} question(s) had missing or irregular option markers
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {warnings.map((w, idx) => (
              <div
                key={idx}
                className="text-xs text-amber-900/90 bg-white/70 p-2 rounded border border-amber-100 flex items-start justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-amber-800">Q#{w.questionNumber}:</span>{' '}
                  <span>{w.message}</span>
                  {w.rawSnippet && (
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                      "{w.rawSnippet}"
                    </p>
                  )}
                </div>
                <button
                  onClick={onOpenQuestionEditor}
                  className="text-[11px] text-blue-700 font-bold hover:underline shrink-0 cursor-pointer"
                >
                  Fix
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
