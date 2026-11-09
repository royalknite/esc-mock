import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Question, PaperSettings } from '../../types';
import { Download, Printer, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, FileDown, CheckCircle } from 'lucide-react';
import { generateA4PDFFromElements, PDFGenerationProgress, printElementContainer, isMobileOrNative } from '../../utils/pdfGenerator';
import { fitAllPages } from '../../utils/fitPage';

interface PaperPreviewProps {
  questions: Question[];
  settings: PaperSettings;
}

export const PaperPreview: React.FC<PaperPreviewProps> = ({ questions, settings }) => {
  const [zoom, setZoom] = useState<number>(0.9);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<PDFGenerationProgress | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Format 1: 25 MCQs per page (50 questions = 2 pages).
  // Format 2: 50 MCQs per page (100 questions = 2 pages).
  const questionsPerPage = settings.format === '50' ? 50 : 25;
  const leftColCount = settings.format === '50' ? 25 : 13;

  const totalPages = Math.max(1, Math.ceil(questions.length / questionsPerPage));

  // Chunk questions into pages
  const pages: {
    pageNumber: number;
    leftCol: Question[];
    rightCol: Question[];
  }[] = [];

  for (let p = 0; p < totalPages; p++) {
    const pageQuestions = questions.slice(p * questionsPerPage, (p + 1) * questionsPerPage);
    const leftCol = pageQuestions.slice(0, leftColCount);
    const rightCol = pageQuestions.slice(leftColCount);

    pages.push({
      pageNumber: p + 1,
      leftCol,
      rightCol,
    });
  }

  // Auto-fit: shrink font per page until every question is fully visible (no clipping).
  useLayoutEffect(() => {
    fitAllPages(containerRef.current);
  }, [questions, settings]);

  useEffect(() => {
    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fitAllPages(containerRef.current);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [questions, settings]);

  // Handle PDF Generation
  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    try {
      setIsGeneratingPDF(true);
      const pageElements = Array.from(
        containerRef.current.querySelectorAll('.a4-sheet')
      ) as HTMLElement[];

      const fileName = `${settings.instituteName.replace(/\s+/g, '_')}_${settings.subject}_${settings.format}Q_Paper`;
      await generateA4PDFFromElements(pageElements, fileName, (progress) => {
        setPdfProgress(progress);
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert(`PDF nahi ban payi.\nError: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGeneratingPDF(false);
      setPdfProgress(null);
    }
  };

  // Phone / Android app: browser print dialog does not work, so Print also saves the PDF.
  const handlePrint = () => {
    if (isMobileOrNative()) {
      handleDownloadPDF();
      return;
    }
    fitAllPages(containerRef.current);
    printElementContainer('paper-preview-container');
  };

  const isCompact = settings.format === '50';
  // 25/page stays comfortably readable; 50/page uses a compact but legible size.
  const baseFont = isCompact ? 10.5 : 13;
  const minFont = isCompact ? 9.5 : 11.5;
  const pagePadding = isCompact ? '18px 22px 16px 22px' : '24px 30px 20px 30px';

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Page View:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-800">
              {currentPageIndex + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPageIndex >= totalPages - 1}
              className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            ({questions.length} Questions • {questionsPerPage} per page)
          </span>
        </div>

        {/* Zoom & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
              className="p-1 rounded hover:bg-white text-slate-700 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-1 text-slate-700">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((prev) => Math.min(1.3, prev + 0.1))}
              className="p-1 rounded hover:bg-white text-slate-700 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(0.9)}
              className="p-1 rounded hover:bg-white text-slate-700 cursor-pointer text-xs font-medium px-1.5"
              title="Reset Zoom"
            >
              Fit
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF || questions.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-400 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer hover:shadow-lg"
          >
            {isGeneratingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-amber-300" />
                <span>Download A4 PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Toast */}
      {isGeneratingPDF && pdfProgress && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-semibold flex items-center justify-between no-print animate-pulse">
          <span>{pdfProgress.status}</span>
          <span>
            {Math.round((pdfProgress.currentPage / pdfProgress.totalPages) * 100)}%
          </span>
        </div>
      )}

      {/* Canvas / Paper Container */}
      <div className="overflow-x-auto pb-8 pt-2 flex justify-center bg-slate-200/60 rounded-2xl p-3 sm:p-6 border border-slate-300 min-h-[600px]">
        <div
          ref={containerRef}
          id="paper-preview-container"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
          className="transition-transform duration-150"
        >
          {pages.map((page, pIdx) => {
            // In screen preview, only show current page if zoomed, or in print mode show all pages
            const isVisibleOnScreen = pIdx === currentPageIndex;

            return (
              <div
                key={page.pageNumber}
                data-page-index={pIdx}
                data-base-font={baseFont}
                data-min-font={minFont}
                className={`a4-sheet border border-slate-300 shadow-xl mb-8 flex flex-col justify-between text-slate-900 font-hindi ${
                  isVisibleOnScreen ? 'block' : 'block'
                }`}
                style={{
                  width: '794px',
                  height: '1123px',
                  maxHeight: '1123px',
                  padding: pagePadding,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  ...(isVisibleOnScreen ? {} : { display: 'none' }),
                }}
              >
                {/* Top Section: Header */}
                <div className="flex flex-col" style={{ flex: '1 1 0', minHeight: 0 }}>
                  {/* Institute Master Header (Matching Item 7 Reference) */}
                  <div className="border-b-2 border-slate-900 pb-2 mb-2">
                    <div className="grid grid-cols-3 items-center">
                      {/* Left Header Column */}
                      <div className="text-left text-[11px] leading-tight space-y-0.5">
                        <div className="font-bold text-slate-900">
                          <span className="font-extrabold text-blue-900">Sub: </span>
                          <span>{settings.subject || 'ENGLISH'}</span>
                        </div>
                        <div className="font-semibold text-slate-800">
                          <span className="font-bold text-blue-900">Lesson: </span>
                          <span>{settings.lesson || 'All Chapters'}</span>
                        </div>
                      </div>

                      {/* Center Institute Name & Director */}
                      <div className="text-center">
                        <h2 className="text-xl sm:text-[22px] font-black tracking-tight text-blue-950 uppercase font-sans leading-none">
                          {settings.instituteName || 'ENGLISH STUDY CENTRE'}
                        </h2>
                        <div className="text-xs font-bold text-red-700 tracking-wide mt-0.5 uppercase">
                          {settings.location || 'AKASHI SASARAM'}
                        </div>
                        <div className="text-[11px] font-bold text-slate-800">
                          {settings.directorName || 'Dir. Deepak Sir'}
                        </div>
                      </div>

                      {/* Right Header Column */}
                      <div className="text-right text-[11px] leading-tight space-y-0.5">
                        <div className="font-bold text-slate-900">
                          <span className="font-extrabold text-blue-900">Class: </span>
                          <span>{settings.className || '10 / 12'}</span>
                        </div>
                        <div className="font-semibold text-slate-800">
                          <span className="font-bold text-blue-900">Mob: </span>
                          <span>{settings.mobileNumber || '7050492611'}</span>
                        </div>
                        <div className="font-semibold text-slate-800">
                          <span className="font-bold text-blue-900">Session: </span>
                          <span>{settings.session || '2026-27'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Examination Title Strip */}
                    <div className="mt-1.5 pt-1 border-t border-slate-300 flex items-center justify-between text-[11px] font-bold px-1 bg-slate-50 py-0.5">
                      <span className="text-blue-950 uppercase">
                        {settings.testTitle || 'OBJECTIVE TEST EXAMINATION'}
                      </span>
                      <div className="flex items-center gap-4 text-slate-700">
                        {settings.timeAllowed && (
                          <span>Time: {settings.timeAllowed}</span>
                        )}
                        <span>Total Qs: {questions.length}</span>
                        {settings.fullMarks && (
                          <span>F.M.: {settings.fullMarks}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout Container */}
                  <div className="grid grid-cols-2 gap-x-4 relative" style={{ flex: '1 1 0', minHeight: 0 }}>
                    {/* Vertical Dividing Line */}
                    <div
                      className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-300 -translate-x-1/2 pointer-events-none"
                      style={{ height: '100%' }}
                    ></div>

                    {[page.leftCol, page.rightCol].map((col, cIdx) => (
                      <div
                        key={cIdx}
                        data-fit-col="true"
                        className={`min-w-0 ${cIdx === 0 ? 'pr-2' : 'pl-2'}`}
                        style={{
                          height: '100%',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          gap: isCompact ? '5px' : '10px',
                          lineHeight: isCompact ? 1.16 : 1.25,
                        }}
                      >
                        {col.map((q) => (
                          <div key={q.id} data-q={q.number} className="text-slate-900" style={{ flexShrink: 0, breakInside: 'avoid' }}>
                            <div className="flex items-start gap-1">
                              <span className="font-bold text-slate-950 shrink-0">{q.number}.</span>
                              <span className="min-w-0 flex-1 font-semibold text-slate-900 whitespace-normal break-words">
                                {q.text}
                              </span>
                            </div>
                            <div className="mt-0.5 grid grid-cols-2 gap-x-1 gap-y-0 pl-3 text-slate-800">
                              {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                                <span key={opt} className="min-w-0 break-words whitespace-normal">
                                  <strong className="text-slate-950">({opt})</strong> {q.options[opt]}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Footer Section */}
                <div className="border-t border-slate-300 pt-1.5 mt-auto flex items-center justify-between text-[10px] text-slate-600 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900 uppercase">
                      {settings.instituteName}
                    </span>
                    <span>•</span>
                    <span>{settings.location} (Mob: {settings.mobileNumber})</span>
                  </div>
                  <div className="font-bold text-slate-800">
                    Page {page.pageNumber} of {totalPages}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
