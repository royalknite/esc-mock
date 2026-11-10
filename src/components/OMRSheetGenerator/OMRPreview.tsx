import React, { useRef, useState } from 'react';
import { OMRSettings } from '../../types';
import { Printer, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileDown, CheckCircle2 } from 'lucide-react';
import { generateA4PDFFromElements, PDFGenerationProgress, printElementContainer, isMobileOrNative } from '../../utils/pdfGenerator';

interface OMRPreviewProps {
  settings: OMRSettings;
}

export const OMRPreview: React.FC<OMRPreviewProps> = ({ settings }) => {
  const [zoom, setZoom] = useState<number>(0.9);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<PDFGenerationProgress | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate full question array
  const allQuestionNumbers: number[] = [];
  for (let q = settings.startNumber; q <= settings.endNumber; q++) {
    allQuestionNumbers.push(q);
  }

  // Maximum 100 questions per A4 OMR page (5 columns of 20 questions each)
  const questionsPerPage = 100;
  const totalPages = Math.max(1, Math.ceil(allQuestionNumbers.length / questionsPerPage));

  // Partition questions into pages, each page into up to 5 columns of 20
  const pages: {
    pageNumber: number;
    startQ: number;
    endQ: number;
    columns: number[][];
  }[] = [];

  for (let p = 0; p < totalPages; p++) {
    const pageQuestions = allQuestionNumbers.slice(p * questionsPerPage, (p + 1) * questionsPerPage);
    const startQ = pageQuestions[0] || settings.startNumber;
    const endQ = pageQuestions[pageQuestions.length - 1] || settings.startNumber;

    // Split page questions into up to 5 columns of 20
    const columns: number[][] = [];
    const colSize = 20;
    const numCols = Math.min(5, Math.ceil(pageQuestions.length / colSize));

    for (let c = 0; c < numCols; c++) {
      const colQuestions = pageQuestions.slice(c * colSize, (c + 1) * colSize);
      if (colQuestions.length > 0) {
        columns.push(colQuestions);
      }
    }

    pages.push({
      pageNumber: p + 1,
      startQ,
      endQ,
      columns,
    });
  }

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    try {
      setIsGeneratingPDF(true);
      const pageElements = Array.from(
        containerRef.current.querySelectorAll('.a4-sheet')
      ) as HTMLElement[];

      const fileName = `OMR_Answer_Sheet_${settings.startNumber}_to_${settings.endNumber}`;
      await generateA4PDFFromElements(pageElements, fileName, (progress) => {
        setPdfProgress(progress);
      });
    } catch (err) {
      console.error('Error generating OMR PDF:', err);
      alert('Failed to generate OMR PDF. Please try again or use the Print button.');
    } finally {
      setIsGeneratingPDF(false);
      setPdfProgress(null);
    }
  };

  // Phone / Android app: browser print dialog does not work, so Print also saves the PDF.
  const handlePrint = () => {
    if (isMobileOrNative()) {
      if (!isGeneratingPDF) handleDownloadPDF();
      return;
    }
    printElementContainer('omr-preview-container');
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            OMR Page:
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
            (Questions {settings.startNumber} to {settings.endNumber})
          </span>
        </div>

        {/* Action Buttons */}
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
              title="Fit"
            >
              Fit
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>Print OMR</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer hover:shadow-lg"
          >
            {isGeneratingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating OMR PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-white" />
                <span>Download A4 OMR PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Toast */}
      {isGeneratingPDF && pdfProgress && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-semibold flex items-center justify-between no-print animate-pulse">
          <span>{pdfProgress.status}</span>
          <span>
            {Math.round((pdfProgress.currentPage / pdfProgress.totalPages) * 100)}%
          </span>
        </div>
      )}

      {/* Canvas / OMR Preview Container */}
      <div className="overflow-x-auto pb-8 pt-2 flex justify-center bg-slate-200/60 rounded-2xl p-3 sm:p-6 border border-slate-300 min-h-[600px]">
        <div
          ref={containerRef}
          id="omr-preview-container"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
          className="transition-transform duration-150"
        >
          {pages.map((page, pIdx) => {
            const isVisibleOnScreen = pIdx === currentPageIndex;

            return (
              <div
                key={page.pageNumber}
                data-page-index={pIdx}
                className={`a4-sheet border-2 border-slate-800 rounded-2xl shadow-xl mb-8 flex flex-col justify-between text-slate-900 font-sans ${
                  isVisibleOnScreen ? 'block' : 'hidden print:block'
                }`}
                style={{
                  width: '794px',
                  height: '1123px',
                  maxHeight: '1123px',
                  padding: '24px 28px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                }}
              >
                {/* Clean Inner Rounded Container */}
                <div className="h-full flex flex-col justify-start gap-2">
                  {/* Top Header & Institute Branding */}
                  <div className="border-b-2 border-slate-900 pb-2.5">
                    <div className="text-center">
                      <h1 className="text-2xl sm:text-[24px] font-black tracking-tight text-blue-950 uppercase font-sans leading-none">
                        {settings.instituteName || 'ENGLISH STUDY CENTRE'}
                      </h1>
                      <div className="text-xs font-bold text-red-700 tracking-wider mt-1 uppercase">
                        {settings.location || 'AKASHI SASARAM'} • {settings.directorName || 'Dir. Deepak Sir'}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700">
                        Mob: {settings.mobileNumber || '7050492611'} • Session: 2026-27
                      </div>
                    </div>

                    {/* Centered OMR Title */}
                    <div className="mt-2 py-1 bg-slate-900 text-white rounded text-center">
                      <h2 className="text-base font-black tracking-widest uppercase">
                        OMR ANSWER SHEET
                      </h2>
                      <div className="text-[11px] font-semibold tracking-wide text-slate-200">
                        Questions {page.startQ}–{page.endQ} | Page {page.pageNumber} of {totalPages}
                      </div>
                    </div>
                  </div>

                  {/* Candidate Details & Roll No Matrix (if enabled) */}
                  {settings.includeCandidateFields && (
                    <div className="my-2 border border-slate-800 rounded-lg p-2 bg-slate-50/50">
                      <div className="grid grid-cols-12 gap-3 text-xs">
                        {/* Student Details Fields */}
                        <div className={`${settings.includeRollMatrix ? 'col-span-8' : 'col-span-12'} space-y-1.5`}>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 w-24 shrink-0 text-[11px]">
                              CANDIDATE NAME:
                            </span>
                            <div className="flex-1 border-b border-dotted border-slate-700 h-5 bg-white rounded-xs px-2 flex items-center font-mono text-xs"></div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 w-16 shrink-0 text-[11px]">
                                EXAM:
                              </span>
                              <div className="flex-1 border-b border-dotted border-slate-700 h-5 bg-white rounded-xs px-2 flex items-center text-[11px] font-bold text-blue-950">
                                {settings.examTitle}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 w-14 shrink-0 text-[11px]">
                                DATE:
                              </span>
                              <div className="flex-1 border-b border-dotted border-slate-700 h-5 bg-white rounded-xs px-2 flex items-center text-[11px]">
                                {settings.date}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 w-16 shrink-0 text-[11px]">
                                SUBJECT:
                              </span>
                              <div className="flex-1 border-b border-dotted border-slate-700 h-5 bg-white rounded-xs px-2 flex items-center text-[11px]">
                                {settings.subject}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 w-14 shrink-0 text-[11px]">
                                CLASS:
                              </span>
                              <div className="flex-1 border-b border-dotted border-slate-700 h-5 bg-white rounded-xs px-2 flex items-center text-[11px]">
                                {settings.className}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Roll Number Matrix (Optional 7-digit bubble matrix) */}
                        {settings.includeRollMatrix && (
                          <div className="col-span-4 border-l border-slate-400 pl-2">
                            <div className="text-[10px] font-bold text-center text-slate-800 uppercase mb-0.5">
                              ROLL NO.
                            </div>
                            {/* Boxes */}
                            <div className="grid grid-cols-7 gap-0.5 mb-1">
                              {Array.from({ length: 7 }).map((_, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="h-4 border border-slate-800 bg-white rounded-xs"
                                ></div>
                              ))}
                            </div>
                            {/* Digit bubbles 0 to 9 */}
                            <div className="space-y-0.5">
                              {Array.from({ length: 10 }).map((_, digit) => (
                                <div key={digit} className="grid grid-cols-7 gap-0.5 justify-items-center">
                                  {Array.from({ length: 7 }).map((_, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className="w-3.5 h-3.5 box-border shrink-0 rounded-full border border-slate-800 text-[8px] leading-none font-bold inline-flex items-center justify-center bg-white"
                                    >
                                      {digit}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Instructions & Marking Example Strip */}
                  <div className="border border-slate-800 rounded-md p-1.5 bg-slate-50 flex items-center justify-between text-[10px] text-slate-800 mb-2">
                    <div className="flex-1 pr-2">
                      <span className="font-bold text-red-700 uppercase">INSTRUCTION: </span>
                      <span>
                        Use Black/Blue Ball Point pen only. Fill exactly ONE bubble per question completely. No stray marks.
                      </span>
                    </div>

                    {/* Marking Demonstration Box */}
                    <div className="flex items-center gap-3 border-l border-slate-300 pl-3 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-600 font-medium">Wrong:</span>
                        <div className="w-3.5 h-3.5 rounded-full border border-red-600 flex items-center justify-center text-[8px] text-red-600 font-bold">
                          ✕
                        </div>
                        <div className="w-3.5 h-3.5 rounded-full border border-red-600 flex items-center justify-center text-[8px] text-red-600 font-bold">
                          ✓
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-600 font-bold">Correct:</span>
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-900 flex items-center justify-center text-[8px] text-white font-bold">
                          ●
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main OMR Bubble Grid: 5 Columns with 20 questions each */}
                  <div className="flex-1 grid grid-cols-5 gap-2 border border-slate-800 rounded-lg p-2.5 bg-white">
                    {page.columns.map((columnQuestions, cIdx) => (
                      <div
                        key={cIdx}
                        className={`space-y-1 ${
                          cIdx < page.columns.length - 1 ? 'border-r border-slate-300 pr-1.5' : ''
                        }`}
                      >
                        {/* Column Header */}
                        <div className="text-center font-bold text-[10px] bg-slate-100 py-0.5 rounded border border-slate-300 mb-1">
                          Q. {columnQuestions[0]} – {columnQuestions[columnQuestions.length - 1]}
                        </div>

                        {/* Questions list in this column */}
                        {columnQuestions.map((qNum) => (
                          <div
                            key={qNum}
                            className="flex items-center justify-between py-[1.5px] px-0.5 border-b border-slate-100"
                          >
                            {/* Question Number */}
                            <span className="text-[11px] font-black text-slate-900 w-6 text-right pr-1">
                              {qNum}.
                            </span>

                            {/* Circular Bubbles: A, B, C, D */}
                            <div className="flex items-center gap-1.5">
                              {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                                <div
                                  key={letter}
                                  className="w-[18px] h-[18px] box-border shrink-0 rounded-full border-[1.5px] border-slate-900 inline-flex items-center justify-center text-[10px] leading-none font-black text-slate-900 hover:bg-slate-100 cursor-pointer select-none transition-colors"
                                >
                                  {letter}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Signatures & Bottom Footer */}
                  <div className="mt-2 pt-2 border-t-2 border-slate-900">
                    <div className="grid grid-cols-3 gap-4 text-center text-[10px] font-bold text-slate-800">
                      <div>
                        <div className="h-7 border-b border-slate-500 mb-1"></div>
                        <span>CANDIDATE SIGNATURE</span>
                      </div>
                      <div>
                        <div className="h-7 border-b border-slate-500 mb-1"></div>
                        <span>INVIGILATOR SIGNATURE</span>
                      </div>
                      <div>
                        <div className="h-7 border-b border-slate-500 mb-1"></div>
                        <span>CENTRE SUPERINTENDENT</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2 font-mono">
                      <span>ENGLISH STUDY CENTRE • AKASHI SASARAM (MOB: 7050492611)</span>
                      <span>PAGE {page.pageNumber} OF {totalPages}</span>
                    </div>
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
