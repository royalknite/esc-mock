import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Package,
  Layers,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Code2,
  FileCode,
  FolderArchive,
  ArrowRight,
  Info,
  X,
  Sparkles,
  Eye,
  Grid,
  Palette
} from 'lucide-react';
import { downloadSingleFileApp, exportCapacitorAndroidZip, exportAndroidIconPack } from '../../utils/apkExporter';

interface APKDashboardProps {
  onOpenSplash?: () => void;
}

export const APKDashboard: React.FC<APKDashboardProps> = ({ onOpenSplash }) => {
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
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingIcons, setIsExportingIcons] = useState(false);
  const [iconShape, setIconShape] = useState<'squircle' | 'circle' | 'rounded' | 'teardrop'>('squircle');

  const handleExportIcons = async () => {
    try {
      setIsExportingIcons(true);
      await exportAndroidIconPack();
    } catch (e) {
      console.error(e);
      alert('Error generating Android icon pack.');
    } finally {
      setIsExportingIcons(false);
    }
  };

  // Listen for PWA install prompt & app installed events
  useEffect(() => {
    // Check if prompt was already captured at window level
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      setIsInstallable(true);
    }

    const handlePromptReady = (e: any) => {
      const promptEvent = e.detail || (window as any).deferredPWAInstallPrompt;
      if (promptEvent) {
        setDeferredPrompt(promptEvent);
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

  /**
   * Directly triggers the browser's native app installation prompt on Android
   */
  const handleInstallApp = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPWAInstallPrompt;

    if (promptEvent) {
      try {
        // Direct browser native installation prompt invocation
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          (window as any).deferredPWAInstallPrompt = null;
        }
      } catch (err) {
        console.error('Error triggering PWA install prompt:', err);
      }
    } else {
      // If the browser hasn't fired beforeinstallprompt yet (or iframe constraint), show helper modal
      setShowInstallGuide(true);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      await exportCapacitorAndroidZip();
    } catch (e) {
      console.error(e);
      alert('Error generating Android project ZIP.');
    } finally {
      setIsExportingZip(false);
    }
  };

  const capacitorCommands = `# 1. Extract the downloaded Android Project ZIP
# 2. Open terminal in the project directory and run:
npm install
npm install -D @capacitor/cli @capacitor/core @capacitor/android

# 3. Add Android platform & sync assets
npx cap add android
npx cap sync android

# 4. Compile the actual APK directly with Gradle:
cd android
chmod +x gradlew
./gradlew assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk`;

  return (
    <div className="space-y-6">
      {/* Hero Banner: Android Mobile App */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-red-600/20 to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#091429] flex items-center justify-center shadow-xl border-2 border-red-500/80 shrink-0 overflow-hidden p-1">
              <img src="/icon.svg" alt="ESC Android Launcher Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-600/90 text-white text-xs font-bold tracking-wider uppercase mb-1.5">
                Official Android App &amp; APK
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
                ENGLISH STUDY CENTRE
              </h2>
              <p className="text-sm sm:text-base font-semibold text-amber-300">
                Dir. Deepak Sir • Akashi Sasaram (Mob: 7050492611)
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-blue-200">
                <span className="bg-blue-900/80 px-2.5 py-0.5 rounded border border-blue-700 font-mono">
                  App ID: com.englishstudycentre.deepaksir
                </span>
                <span className="bg-blue-900/80 px-2.5 py-0.5 rounded border border-blue-700">
                  Version 1.0.0
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Android 8.0 - 15+
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
            <button
              onClick={handleInstallApp}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg transition-transform active:scale-95 cursor-pointer relative"
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>App Installed on Device</span>
                </>
              ) : isInstallable ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <Smartphone className="w-4 h-4" />
                  <span>Install Now on Android</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>Install on Android Device</span>
                </>
              )}
            </button>

            <button
              onClick={downloadSingleFileApp}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-amber-300" />
              <span>Download Single-File HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main APK / App Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Single-File Offline Web App */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center mb-3">
              <FileCode className="w-6 h-6 text-blue-700" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-base">
                Single-File Offline App
              </h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                .HTML
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Complete standalone single-file web application with embedded CSS, JS, Devanagari fonts, and PDF engine. Runs 100% offline on any Android browser or computer without a server!
            </p>
          </div>

          <button
            onClick={downloadSingleFileApp}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Download Offline .HTML (1-Click)</span>
          </button>
        </div>

        {/* Card 2: WebAPK / PWA Native Android Install */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-3">
              <Smartphone className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-base">
                Instant Android WebAPK
              </h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Native APK Install
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Instantly triggers Android's native installation prompt. Automatically installs the app icon, splash screen, and full-screen mode directly into your Android app drawer.
            </p>
          </div>

          <button
            onClick={handleInstallApp}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {isInstalled ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Installed on this Device</span>
              </>
            ) : isInstallable ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                <Smartphone className="w-4 h-4" />
                <span>Install Now on Android Device</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span>Install on Android Device</span>
              </>
            )}
          </button>
        </div>

        {/* Card 3: Capacitor Android Project ZIP */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-900 flex items-center justify-center mb-3">
              <FolderArchive className="w-6 h-6 text-red-700" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-base">
                Capacitor Android Project
              </h3>
              <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                Full Source ZIP
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Complete ready-to-compile Android project containing <code className="text-slate-800 font-mono">capacitor.config.json</code>, <code className="text-slate-800 font-mono">AndroidManifest.xml</code>, Gradle scripts, icons, and web assets.
            </p>
          </div>

          <button
            onClick={handleExportZip}
            disabled={isExportingZip}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {isExportingZip ? (
              <span>Packaging ZIP...</span>
            ) : (
              <>
                <FolderArchive className="w-4 h-4" />
                <span>Export Android Project (ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official Android Launcher Icon & App Shortcut Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#091429] text-white flex items-center justify-center shadow-md border-2 border-red-500/80 shrink-0 overflow-hidden p-1">
              <img src="/icon.svg" alt="Official Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold tracking-wide uppercase mb-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Adaptive Launcher Icon &amp; App Drawer
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Android App Icon &amp; Install Shortcut
              </h3>
              <p className="text-xs text-slate-500">
                Custom high-resolution launcher icon designed specifically for <strong>ENGLISH STUDY CENTRE</strong> (Dir. Deepak Sir)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenSplash && (
              <button
                onClick={onOpenSplash}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-slate-200"
              >
                <span>✨ Preview Splash Screen</span>
              </button>
            )}
            <button
              onClick={handleExportIcons}
              disabled={isExportingIcons}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:bg-slate-400 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isExportingIcons ? 'Packaging Icons...' : 'Download Icon Pack (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Showcase: Interactive Phone Simulation & Design Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Realistic Android Phone Mockup (App Drawer & Shortcut) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 rounded-[36px] p-5 text-white shadow-2xl border-4 border-slate-800 relative overflow-hidden">
            {/* Phone Speaker Notch & Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pb-4 px-2 border-b border-white/10">
              <span className="font-bold">10:11</span>
              <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span>📶</span>
                <span>🔋 100%</span>
              </div>
            </div>

            {/* Sub-header: App Drawer Live Preview */}
            <div className="mt-4 mb-3 flex items-center justify-between px-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Android App Drawer
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                Live Simulation
              </span>
            </div>

            {/* App Drawer Grid (4 Apps) */}
            <div className="grid grid-cols-4 gap-3 text-center my-3">
              {/* Other System Apps */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-md">
                  📞
                </div>
                <span className="text-[10px] text-slate-300 font-medium truncate w-14">Phone</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-xl shadow-md">
                  🌐
                </div>
                <span className="text-[10px] text-slate-300 font-medium truncate w-14">Chrome</span>
              </div>

              {/* OUR OFFICIAL APP WITH CUSTOM ICON */}
              <div className="flex flex-col items-center gap-1 relative group cursor-pointer" onClick={handleInstallApp}>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-2xl bg-red-500/40 blur-xs animate-pulse"></div>
                  <div className={`w-12 h-12 bg-[#091429] flex items-center justify-center shadow-lg border-2 border-amber-400 overflow-hidden p-0.5 relative z-10 transition-all ${
                    iconShape === 'circle' ? 'rounded-full' :
                    iconShape === 'rounded' ? 'rounded-2xl' :
                    iconShape === 'teardrop' ? 'rounded-[20px] rounded-br-none' : 'rounded-[28%]'
                  }`}>
                    <img src="/icon.svg" alt="ESC Icon" className="w-full h-full object-contain" />
                  </div>
                </div>
                <span className="text-[10px] text-white font-black truncate w-16 bg-blue-900/60 px-1 rounded border border-blue-400/40">
                  ENGLISH STUDY
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl shadow-md">
                  ⚙️
                </div>
                <span className="text-[10px] text-slate-300 font-medium truncate w-14">Settings</span>
              </div>
            </div>

            {/* Android Home Screen Quick Action Shortcut Popup Simulation */}
            <div className="mt-5 p-3 rounded-2xl bg-slate-800/90 border border-white/10 backdrop-blur-md space-y-2">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <img src="/icon.svg" alt="App Icon" className="w-5 h-5 rounded-md" />
                <div className="text-[11px] font-bold text-white">
                  ENGLISH STUDY CENTRE Shortcuts
                </div>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="text-amber-400">📄</span>
                    <span>MCQ Question Paper</span>
                  </span>
                  <span className="text-[9px] text-slate-400">25/50 Q</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="text-red-400">⭕</span>
                    <span>OMR Answer Sheet</span>
                  </span>
                  <span className="text-[9px] text-slate-400">1–250 Q</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="text-emerald-400">📱</span>
                    <span>Install APK / WebAPK</span>
                  </span>
                  <span className="text-[9px] text-slate-400">Offline</span>
                </div>
              </div>
            </div>

            {/* Interactive Shape Switcher */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="text-[10px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Android Adaptive Mask Shape:</span>
                <span className="text-amber-300 capitalize">{iconShape}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                <button
                  onClick={() => setIconShape('squircle')}
                  className={`py-1 rounded font-bold transition cursor-pointer ${
                    iconShape === 'squircle' ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  Squircle
                </button>
                <button
                  onClick={() => setIconShape('circle')}
                  className={`py-1 rounded font-bold transition cursor-pointer ${
                    iconShape === 'circle' ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  Circle
                </button>
                <button
                  onClick={() => setIconShape('rounded')}
                  className={`py-1 rounded font-bold transition cursor-pointer ${
                    iconShape === 'rounded' ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  Square
                </button>
                <button
                  onClick={() => setIconShape('teardrop')}
                  className={`py-1 rounded font-bold transition cursor-pointer ${
                    iconShape === 'teardrop' ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  Teardrop
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Icon Architecture & Design Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            {/* Design Spec Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Element 1: ESC Monogram */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                    ESC
                  </span>
                  <h4 className="font-bold text-xs text-slate-900">ESC Monogram</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Bold geometric monogram in warm gold with drop shadow and crimson header ribbon representing <strong>ENGLISH STUDY CENTRE</strong>.
                </p>
              </div>

              {/* Element 2: White Open Book */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    📖
                  </span>
                  <h4 className="font-bold text-xs text-slate-900">White Open Book Symbol</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  3D fanned white book pages with soft line guides and a hanging crimson bookmark ribbon symbolizing quality academic learning.
                </p>
              </div>

              {/* Element 3: Blue & Red Colors */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs">
                    🎨
                  </span>
                  <h4 className="font-bold text-xs text-slate-900">Blue &amp; Red Palette</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Rich royal navy blue (<code className="font-mono text-[10px]">#091429</code> to <code className="font-mono text-[10px]">#1E3A8A</code>) with vibrant crimson (<code className="font-mono text-[10px]">#DC2626</code>) and gold trims.
                </p>
              </div>

              {/* Element 4: OMR Bubble Symbol */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    ⭕
                  </span>
                  <h4 className="font-bold text-xs text-slate-900">OMR Bubble Symbol</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Four testing bubbles <strong>[A] [B] [C] [D]</strong> with bubble A filled in crimson, directly identifying the Question Paper &amp; OMR engine.
                </p>
              </div>
            </div>

            {/* Android Mipmap Density Asset Manifest Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  Included Android Icon Densities &amp; Formats
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  100% Programmatically Generated
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-[11px]">
                <div className="grid grid-cols-4 px-4 py-2 items-center">
                  <span className="font-bold text-slate-800">mipmap-mdpi</span>
                  <span className="text-slate-600">48 × 48 px</span>
                  <span className="text-slate-500">Android 8.0 baseline</span>
                  <span className="text-emerald-700 font-bold">✓ Included</span>
                </div>
                <div className="grid grid-cols-4 px-4 py-2 items-center">
                  <span className="font-bold text-slate-800">mipmap-hdpi</span>
                  <span className="text-slate-600">72 × 72 px</span>
                  <span className="text-slate-500">High density phones</span>
                  <span className="text-emerald-700 font-bold">✓ Included</span>
                </div>
                <div className="grid grid-cols-4 px-4 py-2 items-center">
                  <span className="font-bold text-slate-800">mipmap-xhdpi</span>
                  <span className="text-slate-600">96 × 96 px</span>
                  <span className="text-slate-500">Extra-high density</span>
                  <span className="text-emerald-700 font-bold">✓ Included</span>
                </div>
                <div className="grid grid-cols-4 px-4 py-2 items-center">
                  <span className="font-bold text-slate-800">mipmap-xxhdpi</span>
                  <span className="text-slate-600">144 × 144 px</span>
                  <span className="text-slate-500">Full HD Android screens</span>
                  <span className="text-emerald-700 font-bold">✓ Included</span>
                </div>
                <div className="grid grid-cols-4 px-4 py-2 items-center">
                  <span className="font-bold text-slate-800">mipmap-xxxhdpi</span>
                  <span className="text-slate-600">192 × 192 px</span>
                  <span className="text-slate-500">QHD+ flagship phones</span>
                  <span className="text-emerald-700 font-bold">✓ Included</span>
                </div>
                <div className="grid grid-cols-4 px-4 py-2 items-center bg-blue-50/50">
                  <span className="font-bold text-blue-900">Google Play Store &amp; PWA</span>
                  <span className="text-blue-900 font-bold">512 × 512 px</span>
                  <span className="text-slate-500">Master Store &amp; WebAPK</span>
                  <span className="text-emerald-700 font-bold">✓ Included</span>
                </div>
                <div className="grid grid-cols-4 px-4 py-2 items-center bg-amber-50/50">
                  <span className="font-bold text-amber-950">Adaptive Vector Drawables</span>
                  <span className="text-amber-950 font-bold">108 × 108 dp</span>
                  <span className="text-slate-500">Foreground + Background XML</span>
                  <span className="text-emerald-700 font-bold">✓ Included</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleInstallApp}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install on Android Device Now</span>
              </button>

              <button
                onClick={handleExportIcons}
                disabled={isExportingIcons}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{isExportingIcons ? 'Preparing Package...' : 'Download Full Android Icon Package'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Genuine APK Build Workflow Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
            <Package className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Genuine Android APK Build Workflow
            </h3>
            <p className="text-xs text-slate-500">
              Because HTML files cannot compile themselves into binary APKs in-browser, follow these standard production methods:
            </p>
          </div>
        </div>

        {/* Method 1: Automated GitHub Actions Cloud Build */}
        <div className="bg-blue-50/60 rounded-xl border border-blue-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h4 className="font-bold text-blue-950 text-sm">
                Recommended: 1-Click Cloud APK Build (Free via GitHub Actions)
              </h4>
            </div>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Zero Local Software Needed
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            The project already includes a pre-configured GitHub Actions workflow in{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px]">
              .github/workflows/build-apk.yml
            </code>
            . When you push your code to GitHub, an Ubuntu runner automatically compiles the debug APK in ~2 minutes.
          </p>

          <ol className="text-xs text-slate-700 space-y-1.5 list-decimal pl-5">
            <li>Push the codebase to your GitHub repository.</li>
            <li>Go to the <strong>Actions</strong> tab on your GitHub repository.</li>
            <li>Select <strong>Build Android APK - English Study Centre</strong> and click <strong>Run workflow</strong>.</li>
            <li>Once finished, download the compiled <code className="font-bold text-blue-900">English_Study_Centre_Android_App.apk</code> from the Artifacts section!</li>
          </ol>
        </div>

        {/* Method 2: Local Build via Capacitor & Android Studio */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                Local Build via Terminal &amp; Android Studio
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(capacitorCommands, 1)}
              className="flex items-center gap-1 text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
            >
              {copiedIndex === 1 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Commands</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
            {capacitorCommands}
          </pre>
        </div>

        {/* Method 3: Instant Play Store APK / AAB via PWABuilder */}
        <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h4 className="font-bold text-amber-950 text-sm">
                Instant Google Play APK / AAB via Microsoft PWABuilder
              </h4>
            </div>
            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
            >
              <span>Visit PWABuilder</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Enter your deployed URL into PWABuilder. It validates the manifest and icon generated in this app and outputs an APK/AAB package ready for direct APK sideloading or Google Play Store publishing!
          </p>
        </div>
      </div>

      {/* Android Device Mockup Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="text-center max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-900">
            Android Smartphone Experience Preview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Both the Question Paper Generator and OMR Sheet Generator run seamlessly on Android devices.
          </p>
        </div>

        <div className="max-w-sm mx-auto bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-700 relative">
          {/* Speaker & Camera notch */}
          <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-950"></div>
            <div className="w-6 h-1 rounded-full bg-slate-700"></div>
          </div>

          {/* Simulated Mobile Screen */}
          <div className="bg-slate-100 rounded-[28px] overflow-hidden border border-slate-300 h-[480px] flex flex-col justify-between">
            {/* Top Android Status Bar */}
            <div className="bg-blue-950 text-white px-4 py-1.5 flex items-center justify-between text-[10px]">
              <span>9:41 AM</span>
              <span className="font-bold text-amber-300">ENGLISH STUDY CENTRE</span>
              <span>100% 🔋</span>
            </div>

            {/* App Content Preview */}
            <div className="p-3 overflow-y-auto space-y-3 flex-1 text-left font-sans">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold text-blue-950">
                  ENGLISH STUDY CENTRE
                </div>
                <div className="text-[9px] font-semibold text-red-600">
                  Dir. Deepak Sir • Akashi Sasaram
                </div>
                <div className="mt-2 text-[10px] bg-blue-50 text-blue-900 p-1.5 rounded font-medium">
                  ✓ 25 / 50 Questions Per Page Layout<br />
                  ✓ Authentic 1–100 OMR Answer Sheets<br />
                  ✓ Full Devanagari Hindi Unicode
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-800 mb-1">
                  1. He has been studying in this school ______ 2020.
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-700">
                  <div className="p-1 rounded bg-slate-50 border">(A) for</div>
                  <div className="p-1 rounded bg-slate-50 border">(B) since</div>
                  <div className="p-1 rounded bg-slate-50 border">(C) from</div>
                  <div className="p-1 rounded bg-slate-50 border">(D) by</div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around text-[10px] font-bold text-slate-600">
              <span className="text-blue-900">📄 Paper</span>
              <span className="text-red-600">⭕ OMR</span>
              <span className="text-emerald-700">📱 APK</span>
            </div>
          </div>

          {/* Android Home indicator bar */}
          <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2.5"></div>
        </div>
      </div>

      {/* Interactive Install Helper Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-red-500">
                  ESC
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">
                    ENGLISH STUDY CENTRE
                  </h4>
                  <p className="text-xs font-semibold text-red-600">
                    Dir. Deepak Sir • Android App
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Web App Manifest &amp; PWA Ready</span>
              </div>
              <p className="text-slate-600">
                The embedded manifest and service worker are active. When visited in Android Chrome, tapping below invokes the native install dialog directly.
              </p>
            </div>

            {deferredPrompt && (
              <button
                onClick={() => {
                  setShowInstallGuide(false);
                  handleInstallApp();
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Launch Android Install Prompt Now</span>
              </button>
            )}

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Direct Android Chrome Steps:
              </div>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4 leading-relaxed">
                <li>
                  Open this link in <strong>Google Chrome on your Android phone</strong>.
                </li>
                <li>
                  Tap the <strong>three dots menu (⋮)</strong> at top right corner.
                </li>
                <li>
                  Tap <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.
                </li>
                <li>
                  Android will download and install the app with official icon and offline access!
                </li>
              </ol>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
