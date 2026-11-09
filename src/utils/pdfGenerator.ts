import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { fitQuestionColumns } from './fitPage';

export interface PDFGenerationProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

/** True inside the Android app or on a phone/tablet browser (where window.print() does not work). */
export function isMobileOrNative(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

function safeFileName(fileName: string): string {
  const cleaned = fileName.replace(/[\\/:*?"<>|]+/g, '_').trim();
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned || 'Question_Paper'}.pdf`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('Unable to read generated PDF'));
    reader.readAsDataURL(blob);
  });
}

/**
 * html2canvas 1.4.x cannot parse Tailwind v4's oklch/oklab declarations in
 * some WebViews. The clone callback inlines the browser's already-resolved
 * computed styles (normally rgb/px values), then removes external stylesheets.
 * This keeps the visual layout while avoiding the color-parser failure.
 */
/**
 * Builds @font-face CSS with the fonts embedded as data: URIs (only the latin + devanagari
 * subsets of Inter / Noto Sans Devanagari). The html2canvas clone lives in an iframe that
 * would otherwise load fonts late or not at all, so its layout (line wrapping, word spaces)
 * differed from what is painted -> glued words, big gaps, cut questions.
 */
let embeddedFontCssPromise: Promise<string> | null = null;

function getEmbeddedFontCss(): Promise<string> {
  if (!embeddedFontCssPromise) {
    embeddedFontCssPromise = buildEmbeddedFontCss().catch((e) => {
      console.warn('Font embedding failed', e);
      embeddedFontCssPromise = null; // retry next time
      return '';
    });
  }
  return embeddedFontCssPromise;
}

async function buildEmbeddedFontCss(): Promise<string> {
  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href*="fonts.googleapis.com"]')
  );
  const wantedFamilies = /Inter|Noto Sans Devanagari/;
  const wantedSubsets = new Set(['latin', 'devanagari']);
  const blocks: string[] = [];

  for (const link of links) {
    const css = await (await fetch(link.href)).text();
    const re = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(css)) !== null) {
      const subset = m[1];
      const block = m[2];
      const family = /font-family:\s*['"]?([^;'"]+)['"]?/.exec(block)?.[1] ?? '';
      if (wantedSubsets.has(subset) && wantedFamilies.test(family)) blocks.push(block);
    }
  }

  const urls = Array.from(new Set(blocks.flatMap((b) => Array.from(b.matchAll(/url\((https?:[^)]+)\)/g)).map((x) => x[1]))));
  const dataUrls = new Map<string, string>();
  await Promise.all(
    urls.map(async (u) => {
      const blob = await (await fetch(u)).blob();
      dataUrls.set(u, `data:font/woff2;base64,${await blobToBase64(blob)}`);
    })
  );

  return blocks
    .map((b) => b.replace(/url\((https?:[^)]+)\)/g, (_all, u: string) => `url(${dataUrls.get(u) ?? u})`))
    .join('\n');
}

/** Collects @font-face rules (Hindi/English fonts) from every readable stylesheet. */
function collectFontFaceCss(): string {
  const out: string[] = [];
  const walk = (rules: CSSRuleList) => {
    Array.from(rules).forEach((rule) => {
      if (typeof CSSFontFaceRule !== 'undefined' && rule instanceof CSSFontFaceRule) {
        out.push(rule.cssText);
      } else if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) {
        walk((rule as CSSGroupingRule).cssRules);
      }
    });
  };
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      walk(sheet.cssRules);
    } catch {
      // Cross-origin stylesheet (Google Fonts link) - kept as a <link> instead.
    }
  });
  return out.join('\n');
}

function inlineComputedStyles(originalRoot: HTMLElement, clonedRoot: HTMLElement, clonedDocument: Document, embeddedFontCss: string) {
  const originalNodes = [originalRoot, ...Array.from(originalRoot.querySelectorAll<HTMLElement>('*'))];

  // Match source and cloned nodes by a stable temporary ID. Query order can
  // differ in html2canvas clones, which previously caused page 2 to lose styles.
  originalNodes.forEach((original) => {
    const id = original.getAttribute('data-pdf-node-id');
    if (!id) return;
    const cloned = original === originalRoot ? clonedRoot : clonedRoot.querySelector<HTMLElement>(`[data-pdf-node-id="${id}"]`);
    if (!cloned) return;

    const computed = window.getComputedStyle(original);
    for (let p = 0; p < computed.length; p++) {
      const property = computed.item(p);
      if (!property || property.startsWith('--')) continue;
      const value = computed.getPropertyValue(property);
      if (!value || /\b(?:oklch|oklab)\(/i.test(value)) continue;
      try {
        cloned.style.setProperty(property, value);
      } catch {
        // Ignore CSS properties not supported by the WebView.
      }
    }
    cloned.style.setProperty('box-sizing', 'border-box');
  });

  // Styles are now inline as browser-resolved RGB/px values. Removing CSS
  // avoids html2canvas parsing Tailwind v4's unsupported oklch declarations.
  // IMPORTANT: keep the fonts in the clone, otherwise it is laid out with fallback fonts
  // while the canvas paints with the real font -> words stick together / lines wrap wrongly.
  const fontCss = embeddedFontCss || collectFontFaceCss();
  clonedDocument.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    // If embedding failed (offline), keep the Google Fonts <link> as a fallback.
    if (!embeddedFontCss && node instanceof HTMLLinkElement && /fonts\.googleapis\.com/i.test(node.href)) return;
    node.remove();
  });
  if (fontCss) {
    const fontStyle = clonedDocument.createElement('style');
    fontStyle.textContent = fontCss;
    clonedDocument.head.appendChild(fontStyle);
  }
}

async function captureOnce(pageEl: HTMLElement, scale: number, inlineStyles: boolean): Promise<HTMLCanvasElement> {
  const width = pageEl.offsetWidth || 794;
  const height = pageEl.offsetHeight || 1123;
  const embeddedFontCss = await getEmbeddedFontCss();

  const sourceNodes = [pageEl, ...Array.from(pageEl.querySelectorAll<HTMLElement>('*'))];
  sourceNodes.forEach((node, index) => node.setAttribute('data-pdf-node-id', `pdf-node-${index}`));

  try {
    return await html2canvas(pageEl, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width,
    height,
    windowWidth: Math.max(794, width),
    windowHeight: Math.max(1123, height),
    scrollX: 0,
    scrollY: 0,
    onclone: async (clonedDocument) => {
      const clonedRoot = clonedDocument.querySelector(`[data-pdf-capture="true"]`) as HTMLElement | null;
      if (!clonedRoot) return;

      // ROOT CAUSE of squeezed words / overlapping matras / short border:
      // the preview container has transform: scale(zoom). Inside the clone that scale
      // shrinks text boxes (measured) while glyphs are painted at full size.
      // Remove every ancestor transform/zoom so the page is captured at exactly 100%.
      let ancestor: HTMLElement | null = clonedRoot.parentElement;
      while (ancestor) {
        ancestor.style.setProperty('transform', 'none', 'important');
        ancestor.style.setProperty('zoom', '1', 'important');
        ancestor.style.setProperty('transition', 'none', 'important');
        ancestor.style.setProperty('overflow', 'visible', 'important');
        ancestor = ancestor.parentElement;
      }

      clonedRoot.classList.remove('hidden');
      clonedRoot.classList.remove('print:block');
      clonedRoot.classList.add('block');
      clonedRoot.style.setProperty('display', 'flex', 'important');
      clonedRoot.style.setProperty('position', 'fixed', 'important');
      clonedRoot.style.setProperty('left', '0', 'important');
      clonedRoot.style.setProperty('top', '0', 'important');
      clonedRoot.style.setProperty('margin', '0', 'important');
      clonedRoot.style.setProperty('transform', 'none', 'important');
      clonedRoot.style.setProperty('box-shadow', 'none', 'important');
      clonedRoot.style.setProperty('width', `${width}px`, 'important');
      clonedRoot.style.setProperty('height', `${height}px`, 'important');
      clonedRoot.style.setProperty('overflow', 'hidden', 'important');

      if (inlineStyles) {
        try {
          inlineComputedStyles(pageEl, clonedRoot, clonedDocument, embeddedFontCss);
        } catch (e) {
          console.warn('inlineComputedStyles failed', e);
        }
      }

      // Re-apply capture geometry after inlining computed styles.
      clonedRoot.style.setProperty('display', 'flex', 'important');
      clonedRoot.style.setProperty('position', 'fixed', 'important');
      clonedRoot.style.setProperty('left', '0', 'important');
      clonedRoot.style.setProperty('top', '0', 'important');
      clonedRoot.style.setProperty('transform', 'none', 'important');
      clonedRoot.style.setProperty('margin', '0', 'important');
      clonedRoot.style.setProperty('overflow', 'hidden', 'important');

      // Wait until the fonts are really loaded inside the clone before html2canvas measures text.
      try {
        if (clonedDocument.fonts?.load) {
          const sample = 'Aa Total Qs अआ कि';
          const loads: Promise<unknown>[] = [];
          ['Inter', 'Noto Sans Devanagari'].forEach((family) => {
            [400, 500, 600, 700, 800].forEach((w) => {
              loads.push(clonedDocument.fonts.load(`${w} 16px "${family}"`, sample).catch(() => []));
            });
          });
          await Promise.all(loads);
        }
        if (clonedDocument.fonts?.ready) await clonedDocument.fonts.ready;
      } catch {
        // ignore
      }
    },
    });
  } finally {
    sourceNodes.forEach((node) => node.removeAttribute('data-pdf-node-id'));
  }
}

/** Tries high quality first, then lighter settings (phones can run out of memory or fail on some styles). */
async function captureA4Page(pageEl: HTMLElement): Promise<HTMLCanvasElement> {
  const attempts: Array<[number, boolean]> = [
    [2.5, true],
    [2.2, true],
    [1.8, true],
    [1.5, true],
  ];
  let lastError: unknown;
  for (const [scale, inlineStyles] of attempts) {
    try {
      const canvas = await captureOnce(pageEl, scale, inlineStyles);
      if (canvas.width > 0 && canvas.height > 0) return canvas;
      lastError = new Error('Empty canvas');
    } catch (e) {
      console.warn(`PDF capture failed (scale ${scale}, inline ${inlineStyles})`, e);
      lastError = e;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** Captures every A4 sheet, including pages hidden by the preview navigator. */
export async function generateA4PDFFromElements(
  pageElements: HTMLElement[],
  fileName: string,
  onProgress?: (progress: PDFGenerationProgress) => void
): Promise<void> {
  if (!pageElements || pageElements.length === 0) {
    throw new Error('No page elements provided for PDF generation');
  }

  if (document.fonts) await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const originalStyles = pageElements.map((el) => ({
    el,
    style: el.getAttribute('style'),
    className: el.getAttribute('class'),
  }));

  try {
    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      pageEl.setAttribute('data-pdf-capture', 'true');

      onProgress?.({
        currentPage: i + 1,
        totalPages: pageElements.length,
        status: `Rendering page ${i + 1} of ${pageElements.length}...`,
      });

      // Ensure the source node is measurable even when it is the non-selected preview page.
      pageEl.classList.remove('hidden');
      pageEl.classList.add('block');
      // Reveal each page in place before capture; never move it off-screen.
      // Off-screen absolute positioning caused Android WebView to lose page 2 layout.
      pageEl.style.setProperty('display', 'flex', 'important');
      pageEl.style.setProperty('position', 'relative', 'important');
      pageEl.style.setProperty('left', 'auto', 'important');
      pageEl.style.setProperty('top', 'auto', 'important');
      pageEl.style.setProperty('transform', 'none', 'important');
      await new Promise((resolve) => requestAnimationFrame(resolve));

      fitQuestionColumns(pageEl);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      let canvas: HTMLCanvasElement;
      try {
        canvas = await captureA4Page(pageEl);
      } finally {
        // Must be removed right after each page, otherwise page 2 captures page 1's marker.
        pageEl.removeAttribute('data-pdf-capture');
      }
      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      if (i > 0) pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Larger, softly colored institute watermark on every generated PDF page.
      // Keep the blue tint light enough for question text and answer options to remain readable.
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(40);
      pdf.setTextColor(239, 180, 180);
      pdf.text('ENGLISH STUDY CENTRE', 105, 153, {
        angle: 38,
        align: 'center',
      });
    }
  } finally {
    originalStyles.forEach(({ el, style, className }) => {
      el.removeAttribute('data-pdf-capture');
      el.querySelectorAll('[data-pdf-node-id]').forEach((node) => node.removeAttribute('data-pdf-node-id'));
      if (className === null) el.removeAttribute('class');
      else el.setAttribute('class', className);
      if (style === null) el.removeAttribute('style');
      else el.setAttribute('style', style);
    });
  }

  onProgress?.({
    currentPage: pageElements.length,
    totalPages: pageElements.length,
    status: 'Saving PDF...',
  });

  const sanitizedName = safeFileName(fileName);
  const blob = pdf.output('blob');

  // Android app: save the PDF straight into the phone's Documents folder.
  // If the phone blocks that, fall back to the share/save sheet.
  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(blob);

    try {
      await Filesystem.writeFile({
        path: sanitizedName,
        data: base64,
        directory: Directory.Documents,
        recursive: true,
      });
      alert(`PDF download ho gayi: Documents/${sanitizedName}`);
      return;
    } catch (saveErr) {
      console.warn('Direct save to Documents failed, using share sheet', saveErr);
    }

    await Filesystem.writeFile({
      path: sanitizedName,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    });

    const uriResult = await Filesystem.getUri({
      path: sanitizedName,
      directory: Directory.Cache,
    });

    const canShare = await Share.canShare();
    if (!canShare.value) {
      throw new Error('Unable to save PDF on this device.');
    }

    await Share.share({
      title: sanitizedName,
      text: 'English Study Centre PDF',
      files: [uriResult.uri],
      dialogTitle: 'Save PDF',
    });
    return;
  }

  // Normal browser download.
  const blobUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = sanitizedName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  }
}

/** Direct print trigger for browser native high-fidelity print dialog. */
export function printElementContainer(containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;
  window.print();
}
