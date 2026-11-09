import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export const TopInstallBanner: React.FC = () => {
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
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showChromeGuide, setShowChromeGuide] = useState<boolean>(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState<boolean>(false);

  useEffect(() => {
    // Check if in restricted in-app browser (WhatsApp, Facebook, Instagram, etc.)
    const ua = navigator.userAgent || '';
    const inApp = /FBAN|FBAV|Instagram|WhatsApp|Line|Twitter|Snapchat/i.test(ua);
    setIsInAppBrowser(inApp);

    // Prompt listeners
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

  // If already installed in standalone mode or manually closed, hide banner
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    // 1. If in an in-app browser (e.g. WhatsApp / Facebook), open directly in Chrome
    if (isInAppBrowser) {
      const currentUrl = window.location.href.replace(/https?:\/\//, '');
      const chromeIntent = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = chromeIntent;
      return;
    }

    // 2. Direct browser native installation trigger
    const promptEvent = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          (window as any).deferredPWAInstallPrompt = null;
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
        setShowChromeGuide(true);
      }
    } else {
      // 3. If prompt is not ready or restricted, show visual Chrome 3-dot guide
      setShowChromeGuide(true);
    }
  };

  const openInChromeDirectly = () => {
    const currentUrl = window.location.href.replace(/https?:\/\//, '');
    const chromeIntent = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = chromeIntent;
  };

  return (
    <>
      {/* Sticky Top Install Bar (Android Chrome Native Style) */}
      <div className="bg-gradient-to-r from-[#07132b] via-[#0d224d] to-[#142d66] text-white border-b-2 border-red-500/80 sticky top-0 z-50 shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between gap-3">
          {/* Left: App Logo + Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#081329] p-0.5 border-2 border-amber-400 shadow-md shrink-0 overflow-hidden">
              <img
                src="/icon.svg"
                alt="ENGLISH STUDY CENTRE Icon"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-xs sm:text-sm tracking-tight text-white uppercase truncate">
                  ENGLISH STUDY CENTRE
                </span>
                <span className="hidden sm:inline-block bg-red-600 text-[10px] font-bold px-1.5 py-0.2 rounded text-white uppercase">
                  App
                </span>
              </div>
              <p className="text-[11px] text-amber-300 font-semibold truncate leading-tight">
                Dir. Deepak Sir • Akashi Sasaram
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium">
                <span className="text-amber-400">★★★★★</span>
                <span>4.9</span>
                <span className="hidden xs:inline">• Free • Official Android App</span>
              </div>
            </div>
          </div>

          {/* Right: Install Button & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {isInAppBrowser ? (
              <button
                onClick={openInChromeDirectly}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition transform active:scale-95 cursor-pointer animate-pulse"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Chrome to Install</span>
              </button>
            ) : (
              <button
                onClick={handleInstallClick}
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition transform active:scale-95 cursor-pointer ring-2 ring-emerald-400/50"
              >
                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                <span>INSTALL APP</span>
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Dismiss top banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chrome Android "Add to Home Screen" Visual Guide Modal */}
      {showChromeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl border-2 border-blue-900 relative">
            <button
              onClick={() => setShowChromeGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Visual Pointer to Chrome Top-Right Menu */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#091429] p-1 border-2 border-amber-400 flex items-center justify-center shrink-0">
                <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-black text-base text-blue-950 leading-tight">
                  Install on Android Device
                </h3>
                <p className="text-xs font-semibold text-red-600">
                  ENGLISH STUDY CENTRE • Dir. Deepak Sir
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3 mb-4 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  Tap the <strong>3 dots menu (⋮)</strong> at the top-right corner of Google Chrome.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  Tap <strong>Install</strong>. The official <strong>ESC</strong> icon will be added to your phone's app drawer!
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={openInChromeDirectly}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-amber-300" />
                <span>Open in Google Chrome Browser</span>
              </button>

              <button
                onClick={() => setShowChromeGuide(false)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
