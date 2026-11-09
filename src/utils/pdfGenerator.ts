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
function inlineComputedStyles(originalRoot: HTMLElement, clonedRoot: HTMLElement) {
  const originalNodes = [originalRoot, ...Array.from(originalRoot.querySelectorAll('*'))];
  const clonedNodes = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll('*'))];
  const count = Math.min(originalNodes.length, clonedNodes.length);

  for (let i = 0; i < count; i++) {
    const original = originalNodes[i] as HTMLElement;
    const cloned = clonedNodes[i] as HTMLElement;
    const computed = window.getComputedStyle(original);

    for (let p = 0; p < computed.length; p++) {
      const property = computed.item(p);
      const value = computed.getPropertyValue(property);
      if (value) cloned.style.setProperty(property, value);
    }

    cloned.style.setProperty('box-sizing', 'border-box');
  }

  clonedRoot.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove());
}

async function captureA4Page(pageEl: HTMLElement): Promise<HTMLCanvasElement> {
  const width = pageEl.offsetWidth || 794;
  const height = pageEl.offsetHeight || 1123;

  return html2canvas(pageEl, {
    scale: 2,
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
    onclone: (clonedDocument) => {
      const clonedRoot = clonedDocument.querySelector(`[data-pdf-capture="true"]`) as HTMLElement | null;
      if (!clonedRoot) return;

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

      inlineComputedStyles(pageEl, clonedRoot);

      // Re-apply capture geometry after inlining computed styles.
      clonedRoot.style.setProperty('display', 'flex', 'important');
      clonedRoot.style.setProperty('position', 'fixed', 'important');
      clonedRoot.style.setProperty('left', '0', 'important');
      clonedRoot.style.setProperty('top', '0', 'important');
      clonedRoot.style.setProperty('transform', 'none', 'important');
      clonedRoot.style.setProperty('margin', '0', 'important');
      clonedRoot.style.setProperty('overflow', 'hidden', 'important');
    },
  });
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
      pageEl.style.setProperty('display', 'flex', 'important');
      pageEl.style.setProperty('position', 'fixed', 'important');
      pageEl.style.setProperty('left', '-10000px', 'important');
      pageEl.style.setProperty('top', '0', 'important');
      pageEl.style.setProperty('margin', '0', 'important');
      pageEl.style.setProperty('transform', 'none', 'important');
      pageEl.style.setProperty('box-shadow', 'none', 'important');
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // Re-fit so no question is clipped in the PDF (fonts may have loaded since render).
      fitQuestionColumns(pageEl);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const canvas = await captureA4Page(pageEl);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }
  } finally {
    originalStyles.forEach(({ el, style, className }) => {
      el.removeAttribute('data-pdf-capture');
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
