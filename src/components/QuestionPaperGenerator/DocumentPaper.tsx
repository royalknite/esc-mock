import React, { useMemo, useRef, useState } from 'react';
import { FileText, Upload, Download, Printer } from 'lucide-react';
import { generateA4PDFFromElements, PDFGenerationProgress, printElementContainer, isMobileOrNative } from '../../utils/pdfGenerator';

const CHARS_PER_PAGE = 2600;
function splitIntoPages(text: string): string[] {
  const lines = text.replace(/\r/g, '').split('\n');
  const pages: string[] = [];
  let current = '';
  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;
    if (next.length > CHARS_PER_PAGE && current) {
      pages.push(current);
      current = line;
    } else current = next;
  }
  if (current || pages.length === 0) pages.push(current);
  return pages;
}

export const DocumentPaper: React.FC = () => {
  const [title, setTitle] = useState('QUESTION PAPER');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<PDFGenerationProgress | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const pages = useMemo(() => splitIntoPages(content), [content]);

  const readFile = (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert('Please upload a .txt file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setContent(String(reader.result || '')); setFileName(file.name); };
    reader.onerror = () => alert('TXT file could not be read.');
    reader.readAsText(file, 'UTF-8');
  };

  const download = async () => {
    if (!content.trim() || !previewRef.current) { alert('पहले TXT फाइल अपलोड करें।'); return; }
    setBusy(true);
    try {
      const elements = Array.from(previewRef.current.querySelectorAll<HTMLElement>('.document-a4-page'));
      const safeTitle = (title || 'Question_Paper').replace(/[^\w\- ]/g, '').trim().replace(/\s+/g, '_');
      await generateA4PDFFromElements(elements, `${safeTitle || 'Question_Paper'}.pdf`, setProgress);
    } catch (error) {
      console.error(error);
      alert('PDF नहीं बन पाया। Browser में Print → Save as PDF इस्तेमाल करें।');
    } finally { setBusy(false); setProgress(null); }
  };

  return <div className="space-y-5">
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 no-print">
      <div className="flex items-center gap-2"><FileText className="text-blue-800"/><div><h2 className="font-black text-lg">Paper – TXT Question Paper</h2><p className="text-xs text-slate-500">अपनी TXT फाइल अपलोड करें और A4 PDF बनाएं।</p></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs font-bold text-slate-700">Paper Title<input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal" placeholder="QUESTION PAPER"/></label>
        <label className="text-xs font-bold text-slate-700">Subject / Class<input value={subject} onChange={e=>setSubject(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal" placeholder="Subject / Class"/></label>
      </div>
      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-5 cursor-pointer text-blue-900 font-bold text-sm"><Upload className="w-5 h-5"/> {fileName || 'TXT फाइल चुनें'}<input type="file" accept=".txt,text/plain" className="hidden" onChange={e=>readFile(e.target.files?.[0])}/></label>
      <label className="block text-xs font-bold text-slate-700">या TXT का content यहाँ paste करें<textarea rows={7} value={content} onChange={e=>setContent(e.target.value)} className="mt-1 w-full rounded-lg border p-3 text-sm font-normal font-hindi" placeholder="यहाँ पूरा question paper paste करें..."/></label>
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-500">{content.length} characters • {pages.length} A4 page(s)</span><div className="flex gap-2"><button onClick={()=>{ if (isMobileOrNative()) { if (!busy) download(); } else { printElementContainer('document-paper-preview'); } }} disabled={!content.trim()} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold disabled:opacity-40"><Printer className="inline w-4 h-4 mr-1"/>Print</button><button onClick={download} disabled={!content.trim()||busy} className="rounded-lg bg-blue-900 text-white px-4 py-2 text-xs font-bold disabled:opacity-40"><Download className="inline w-4 h-4 mr-1"/>{busy?'PDF बन रहा है...':'Download PDF'}</button></div></div>
      {progress && <p className="text-xs text-blue-800">{progress.status}</p>}
    </section>
    <div className="overflow-x-auto rounded-2xl bg-slate-200 p-3 sm:p-5">
      <div id="document-paper-preview" ref={previewRef} className="space-y-5">
        {pages.map((page,index)=><article key={index} className="document-a4-page a4-sheet bg-white shadow-xl border border-slate-300 font-hindi" style={{width:794,height:1123,minHeight:1123,padding:'48px 54px',boxSizing:'border-box',overflow:'hidden',whiteSpace:'pre-wrap',overflowWrap:'anywhere',flexDirection:'column'}}>
          <header className="text-center border-b-2 border-slate-800 pb-3 mb-5"><h1 className="text-xl font-black text-blue-950">{title || 'QUESTION PAPER'}</h1>{subject && <p className="text-sm font-bold mt-1">{subject}</p>}<p className="text-xs text-slate-500 mt-1">Page {index+1} of {pages.length}</p></header>
          <div className="text-[15px] leading-7 text-slate-900">{page}</div>
        </article>)}
      </div>
    </div>
  </div>;
};
