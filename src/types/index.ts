export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  options: QuestionOptions;
  correctAnswer?: string; // Optional answer key if present in TXT
  rawBlock?: string;
}

export interface ParseWarning {
  questionNumber: number;
  message: string;
  severity: 'warning' | 'error';
  rawSnippet?: string;
}

export interface ParseResult {
  questions: Question[];
  warnings: ParseWarning[];
  totalParsed: number;
  success: boolean;
}

export type PaperFormat = '25' | '50';

export interface PaperSettings {
  instituteName: string;
  directorName: string;
  location: string;
  mobileNumber: string;
  subject: string;
  lesson: string;
  className: string;
  session: string;
  testTitle: string;
  totalQuestions: number;
  timeAllowed: string;
  fullMarks: string;
  generalInstructions?: string;
  format: PaperFormat;
}

export interface OMRSettings {
  instituteName: string;
  directorName: string;
  location: string;
  mobileNumber: string;
  examTitle: string;
  subject: string;
  className: string;
  date: string;
  startNumber: number;
  endNumber: number;
  bubbleCount: 4 | 5;
  includeCandidateFields: boolean;
  includeRollMatrix: boolean;
  columnsPerPage: number;
  questionsPerColumn: number;
}
