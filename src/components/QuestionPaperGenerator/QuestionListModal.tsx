import React, { useState } from 'react';
import { Question } from '../../types';
import { X, Plus, Trash2, Edit3, Check, AlertCircle } from 'lucide-react';

interface QuestionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
}

export const QuestionListModal: React.FC<QuestionListModalProps> = ({
  isOpen,
  onClose,
  questions,
  onUpdateQuestions,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({ ...q, options: { ...q.options } });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    const updated = questions.map((q) => (q.id === editForm.id ? editForm : q));
    onUpdateQuestions(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    const updated = questions
      .filter((q) => q.id !== id)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
    onUpdateQuestions(updated);
  };

  const handleAddNew = () => {
    const nextNum = questions.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}`,
      number: nextNum,
      text: 'New question text here...',
      options: {
        A: 'Option A',
        B: 'Option B',
        C: 'Option C',
        D: 'Option D',
      },
      correctAnswer: 'A',
    };
    onUpdateQuestions([...questions, newQ]);
    handleStartEdit(newQ);
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(q.number).includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">Extracted Question Editor</h3>
            <span className="bg-blue-800 text-blue-200 text-xs px-2.5 py-1 rounded-full font-semibold">
              {questions.length} Total Questions
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search questions by number or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {/* List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>No questions found.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isEditing = editingId === q.id;

              if (isEditing && editForm) {
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/40 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-blue-900 text-sm">
                        Editing Question #{editForm.number}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-semibold cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Question Text (English / Hindi Unicode):
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.text}
                        onChange={(e) =>
                          setEditForm({ ...editForm, text: e.target.value })
                        }
                        className="w-full text-sm p-2 rounded-lg border border-slate-300 bg-white font-hindi"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
                        <div key={optKey} className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-700 w-6">
                            ({optKey})
                          </span>
                          <input
                            type="text"
                            value={editForm.options[optKey]}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                options: {
                                  ...editForm.options,
                                  [optKey]: e.target.value,
                                },
                              })
                            }
                            className="flex-1 text-xs p-1.5 rounded border border-slate-300 bg-white font-hindi"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-slate-700">Answer Key:</span>
                      <select
                        value={editForm.correctAnswer || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, correctAnswer: e.target.value })
                        }
                        className="text-xs p-1 rounded border border-slate-300 bg-white"
                      >
                        <option value="">None</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-950 text-sm shrink-0">
                        {q.number}.
                      </span>
                      <p className="text-slate-900 font-medium text-sm font-hindi leading-snug">
                        {q.text}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 pl-5 font-hindi">
                      <div>
                        <span className="font-bold text-slate-800">(A)</span> {q.options.A || '—'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">(B)</span> {q.options.B || '—'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">(C)</span> {q.options.C || '—'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">(D)</span> {q.options.D || '—'}
                      </div>
                    </div>
                    {q.correctAnswer && (
                      <div className="pl-5 text-[11px] font-semibold text-emerald-700">
                        Ans: {q.correctAnswer}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                    <button
                      onClick={() => handleStartEdit(q)}
                      className="p-1.5 rounded-md hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                      title="Edit question"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Changes are automatically reflected in the A4 PDF preview.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
