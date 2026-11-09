import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  FileCode,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { downloadSingleFileApp } from '../../utils/apkExporter';

interface APKInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKInstallModal: React.FC<APKInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => {
    return (window as any).deferredPWAInstallPrompt || null;
  });
  const [isInstallable, setIsInstallable] = useState<boolean>(() => {
    return Boolean((window as any).deferredPWAInstallPrompt);
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState<boolean>(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const inApp = /FBAN|FBAV|Instagram|WhatsApp|Line|Twitter|Snapchat/i.test(ua);
    setIsInAppBrowser(inApp);

    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      setIsInstallable(true);
    }

    const handlePromptReady = (e: any) => {
      const p = e.detail || (window as any).deferredPWAInstallPrompt;
      if (p) {
        setDeferredPrompt(p);
        setIsInstallable(true);
      }
    };

    const handleStandardPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPWAInstallPrompt = e;
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      (window as any).deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleStandardPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleStandardPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallNow = async () => {
    // 1. If inside restricted in-app browser (e.g. WhatsApp / Facebook), open in Chrome directly
    if (isInAppBrowser) {
      const currentUrl = window.location.href.replace(/https?:\/\//, '');
      const chromeIntent = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = chromeIntent;
      return;
    }

    // 2. Direct browser native PWA installation trigger
    const promptEvent = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          (window as any).deferredPWAInstallPrompt = null;
        } else {
          setShowInstructions(true);
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
        setShowInstructions(true);
      }
    } else {
      // 3. Fallback: Show foolproof instructions for Chrome 3-dot menu
      setShowInstructions(true);
    }
  };

  const openInChromeDirectly = () => {
    const currentUrl = window.location.href.replace(/https?:\/\//, '');
    const chromeIntent = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = chromeIntent;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in no-print overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-blue-900 overflow-hidden relative text-slate-900 my-auto">
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#091429] p-1 border-2 border-amber-400 shadow-xl shrink-0 overflow-hidden">
              <img
                src="/icon.svg"
                alt="ESC App Icon"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Install APK / WebAPK</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight uppercase font-sans">
                ENGLISH STUDY CENTRE
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-300">
                Dir. Deepak Sir • Akashi Sasaram (Mob: 7050492611)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Badge Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">Format:</span>
              <span className="font-bold text-blue-950">Android APK / WebAPK</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified &amp; Safe</span>
            </div>
          </div>

          {/* Core Card Section: Install Now */}
          {!showInstructions ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Install <strong>ENGLISH STUDY CENTRE</strong> directly to your Android device. It adds the official <strong>ESC</strong> launcher icon to your phone's home screen and app drawer, running in full-screen standalone mode with 100% offline access!
                </p>
              </div>

              {/* Direct 'Install Now' Primary Button */}
              {isInstalled ? (
                <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>App Already Installed on this Device!</span>
                </div>
              ) : (
                <button
                  onClick={handleInstallNow}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-base shadow-xl flex items-center justify-center gap-2.5 transition transform active:scale-95 cursor-pointer ring-4 ring-emerald-400/30 animate-pulse"
                >
                  <Smartphone className="w-5 h-5 text-amber-300" />
                  <span>Install Now</span>
                </button>
              )}

              {/* Toggle to manual instruction guide */}
              <div className="text-center">
                <button
                  onClick={() => setShowInstructions(true)}
                  className="text-xs text-blue-800 hover:text-blue-950 font-bold underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Not working automatically? Tap for Chrome 3-dot instructions</span>
                </button>
              </div>
            </div>
          ) : (
            /* Foolproof Chrome Instructions Step-by-Step Card */
            <div className="space-y-4 animate-fade-in">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>How to Install via Chrome in 3 Steps:</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Tap the <strong>three-dot menu (⋮)</strong> at the top right of your Chrome browser.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Select <strong>'Install app'</strong> or <strong>'Add to Home screen'</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Tap <strong>'Install'</strong>. The <strong>ENGLISH STUDY CENTRE</strong> app icon will instantly appear on your home screen!
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleInstallNow}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Try 'Install Now' Again</span>
                </button>

                <button
                  onClick={openInChromeDirectly}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Open in Google Chrome Browser</span>
                </button>

                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Back to Install Card
                </button>
              </div>
            </div>
          )}

          {/* Offline HTML Fallback Option */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Prefer offline file?</span>
            <button
              onClick={downloadSingleFileApp}
              className="font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-500" />
              <span>Download Offline .HTML File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
