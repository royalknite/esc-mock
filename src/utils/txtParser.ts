import { Question, ParseResult, ParseWarning } from '../types';

/**
 * Robust TXT parser for MCQ questions supporting English & Hindi text.
 * Handles diverse formats:
 * - 1. Question text
 * - (A) Opt1 (B) Opt2 (C) Opt3 (D) Opt4
 * - Multiple lines or single-line options
 * - Ans: (A) or Answer: B detection
 * - Flags warnings if questions are missing options
 */
export function parseMCQText(rawContent: string): ParseResult {
  const warnings: ParseWarning[] = [];
  const questions: Question[] = [];

  if (!rawContent || !rawContent.trim()) {
    return {
      questions: [],
      warnings: [],
      totalParsed: 0,
      success: true,
    };
  }

  // Normalize line endings
  const content = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split into question blocks
  // Regex to detect start of a question:
  // Examples: "1.", "1)", "Q1.", "Q.1", "Q1:", "Question 1:", "1 -", "1 :", or Devanagari numerals "१."
  const questionStartRegex = /(?:^|\n)\s*(?:(?:Q|Question|प्रश्न)\s*[\.\:]?\s*)?([0-9]{1,4}|[०-९]{1,4})\s*[\.\)\-\:\—\s]\s*/i;

  // Let's do a line-by-line or block-based state machine that is resilient
  const lines = content.split('\n');
  const blocks: { qNumStr: string; lines: string[] }[] = [];
  let currentBlock: { qNumStr: string; lines: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s*(?:(?:Q|Question|प्रश्न)\s*[\.\:]?\s*)?([0-9]{1,4}|[०-९]{1,4})\s*[\.\)\-\:\—]\s*(.*)$/i);

    if (match) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        qNumStr: match[1],
        lines: [match[2]], // the rest of the question text on that same line
      };
    } else {
      if (currentBlock) {
        currentBlock.lines.push(line);
      } else if (line.trim().length > 0) {
        // Preamble or unnumbered first question. Let's start block 1 if not started
        currentBlock = {
          qNumStr: '1',
          lines: [line],
        };
      }
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  // If standard block splitting didn't find multiple questions, try secondary delimiter (e.g. empty lines or double newline)
  if (blocks.length <= 1 && content.length > 200) {
    // Attempt fallback splitting if numbered format wasn't standard
    const doubleNewlineBlocks = content.split(/\n\s*\n+/);
    if (doubleNewlineBlocks.length > 2) {
      blocks.length = 0;
      doubleNewlineBlocks.forEach((blockText, idx) => {
        const trimmed = blockText.trim();
        if (trimmed) {
          blocks.push({
            qNumStr: String(idx + 1),
            lines: trimmed.split('\n'),
          });
        }
      });
    }
  }

  // Process each question block
  blocks.forEach((block, index) => {
    // Convert Devanagari numerals if needed
    const devanagariMap: Record<string, string> = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    };
    const normalizedNumStr = block.qNumStr.replace(/[०-९]/g, (d) => devanagariMap[d] || d);
    const parsedNum = parseInt(normalizedNumStr, 10) || (index + 1);

    const fullBlockText = block.lines.join('\n').trim();

    // Parse options: A, B, C, D (and optional E)
    // Option markers can be:
    // (A), (B), (C), (D)
    // A., B., C., D.
    // A), B), C), D)
    // [A], [B], [C], [D]
    // (a), (b), (c), (d)
    // (क), (ख), (ग), (घ) -> mapped to A, B, C, D

    let questionBody = '';
    const options: { A: string; B: string; C: string; D: string; E?: string } = {
      A: '',
      B: '',
      C: '',
      D: '',
    };
    let correctAnswer: string | undefined = undefined;

    // Check for Answer key in block: e.g. Ans: A, Answer: (B), Ans-C, उत्तर: A
    const ansMatch = fullBlockText.match(/(?:Ans(?:wer)?|उत्तर)\s*[\:\-\=]?\s*[\(\[]?([A-Ea-eक-घ1-4])[\)\]]?/i);
    if (ansMatch) {
      const rawAns = ansMatch[1].toUpperCase();
      const hindiToEng: Record<string, string> = { 'क': 'A', 'ख': 'B', 'ग': 'C', 'घ': 'D', '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      correctAnswer = hindiToEng[rawAns] || rawAns;
    }

    // Clean block without Answer line for option extraction
    const textWithoutAns = fullBlockText.replace(/(?:^|\n)\s*(?:Ans(?:wer)?|उत्तर)\s*[\:\-\=]?.*$/gim, '').trim();

    // Regex to locate options:
    // Look for markers like (A), (B), (C), (D), A., B., C., D., A), B), C), D)
    // We search for tokens in the text
    const optionMarkerRegex = /(?:^|\s|\n)(?:\(([A-Da-dक-घ])\)|([A-Da-dक-घ])[\.\)]|\[([A-Da-dक-घ])\])\s+/g;
    
    // Find all occurrences and their indices
    const matches: { index: number; letter: string; matchLength: number }[] = [];
    let m;
    while ((m = optionMarkerRegex.exec(textWithoutAns)) !== null) {
      const rawLetter = (m[1] || m[2] || m[3]).toUpperCase();
      const hindiMap: Record<string, string> = { 'क': 'A', 'ख': 'B', 'ग': 'C', 'घ': 'D' };
      const letter = hindiMap[rawLetter] || rawLetter;
      
      matches.push({
        index: m.index,
        letter,
        matchLength: m[0].length,
      });
    }

    if (matches.length >= 2) {
      // First option starts at matches[0].index
      questionBody = textWithoutAns.substring(0, matches[0].index).trim();

      for (let k = 0; k < matches.length; k++) {
        const current = matches[k];
        const next = matches[k + 1];
        const optStart = current.index + current.matchLength;
        const optEnd = next ? next.index : textWithoutAns.length;
        const optText = textWithoutAns.substring(optStart, optEnd).trim();

        if (current.letter === 'A') options.A = optText;
        else if (current.letter === 'B') options.B = optText;
        else if (current.letter === 'C') options.C = optText;
        else if (current.letter === 'D') options.D = optText;
        else if (current.letter === 'E') options.E = optText;
      }
    } else {
      // If regex didn't catch 4 options, try line-based split
      const nonBlankLines = block.lines.map(l => l.trim()).filter(Boolean);
      if (nonBlankLines.length >= 5) {
        questionBody = nonBlankLines[0];
        // Check if next 4 lines are options
        const optKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
        for (let idx = 0; idx < 4; idx++) {
          const l = nonBlankLines[idx + 1] || '';
          options[optKeys[idx]] = l.replace(/^[\(\[]?[A-Da-d1-4\.\)]\s*[\)\.\:\-]?\s*/, '').trim();
        }
      } else {
        // Just take the block text as question text
        questionBody = textWithoutAns;
      }
    }

    // Validation checks
    const missing: string[] = [];
    if (!options.A) missing.push('A');
    if (!options.B) missing.push('B');
    if (!options.C) missing.push('C');
    if (!options.D) missing.push('D');

    if (missing.length > 0) {
      warnings.push({
        questionNumber: parsedNum,
        severity: missing.length === 4 ? 'error' : 'warning',
        message: missing.length === 4
          ? `Question ${parsedNum}: Options A, B, C, D were not clearly detected.`
          : `Question ${parsedNum}: Missing option(s): ${missing.join(', ')}.`,
        rawSnippet: fullBlockText.slice(0, 120),
      });
    }

    questions.push({
      id: `q-${parsedNum}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      number: parsedNum,
      text: questionBody || `Question ${parsedNum}`,
      options,
      correctAnswer,
      rawBlock: fullBlockText,
    });
  });

  return {
    questions,
    warnings,
    totalParsed: questions.length,
    success: questions.length > 0,
  };
}
