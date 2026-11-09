import JSZip from 'jszip';

/**
 * Downloads the single-file offline HTML web application.
 */
export async function downloadSingleFileApp(): Promise<void> {
  try {
    const res = await fetch('/english_study_centre_offline.html');
    if (!res.ok) throw new Error('Offline app template not found');
    const content = await res.text();
    
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ENGLISH_STUDY_CENTRE_Single_File_App.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading single file app:', err);
    window.open('/english_study_centre_offline.html', '_blank');
  }
}

/**
 * XML definition for Android Adaptive Icon Foreground Vector Drawable.
 */
const ANDROID_IC_LAUNCHER_FOREGROUND_XML = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Crimson header shield -->
    <path
        android:fillColor="#DC2626"
        android:pathData="M35,22 L73,22 Q76,22 76,26 L78,38 Q78,41 74,42 L54,48 L34,42 Q30,41 32,38 L34,26 Q34,22 35,22 Z" />
    <!-- Monogram plaque -->
    <path
        android:fillColor="#081329"
        android:strokeColor="#DC2626"
        android:strokeWidth="1.5"
        android:pathData="M28,42 L80,42 A4,4 0 0,1 84,46 L84,58 A4,4 0 0,1 80,62 L28,62 A4,4 0 0,1 24,58 L24,46 A4,4 0 0,1 28,42 Z" />
    <!-- ESC letter markers -->
    <!-- E -->
    <path
        android:fillColor="#F59E0B"
        android:pathData="M32,48 h10 v2.5 h-7.5 v2.5 h6 v2.5 h-6 v2.5 h7.5 v2.5 h-10 Z" />
    <!-- S -->
    <path
        android:fillColor="#F59E0B"
        android:pathData="M48,48 h10 v3 h-7.5 v2 h7.5 v7.5 h-10 v-3 h7.5 v-2 h-7.5 Z" />
    <!-- C -->
    <path
        android:fillColor="#F59E0B"
        android:pathData="M64,48 h10 v3 h-7.5 v6.5 h7.5 v3 h-10 Z" />
    <!-- White Open Book Symbol -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M54,66 C46,62 36,61 28,63 L28,76 C36,74 46,75 54,79 Z" />
    <path
        android:fillColor="#F1F5F9"
        android:pathData="M54,66 C62,62 72,61 80,63 L80,76 C72,74 62,75 54,79 Z" />
    <!-- Spine ribbon -->
    <path
        android:fillColor="#DC2626"
        android:pathData="M53.5,66 h1 v15 h-1 Z" />
    <!-- OMR Bubble Pill -->
    <path
        android:fillColor="#071228"
        android:strokeColor="#3B82F6"
        android:strokeWidth="1"
        android:pathData="M30,83 h48 a5,5 0 0,1 5,5 v0 a5,5 0 0,1 -5,5 h-48 a5,5 0 0,1 -5,-5 v0 a5,5 0 0,1 5,-5 Z" />
    <!-- Bubble A: Filled Red -->
    <path
        android:fillColor="#DC2626"
        android:pathData="M37,88 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0" />
    <!-- Bubble B -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M48,88 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0" />
    <!-- Bubble C -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M59,88 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0" />
    <!-- Bubble D -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M70,88 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0" />
</vector>`;

/**
 * XML definition for Android Adaptive Icon Background Vector Drawable.
 */
const ANDROID_IC_LAUNCHER_BACKGROUND_XML = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#091429"
        android:pathData="M0,0h108v108h-108z" />
    <path
        android:fillColor="#1E3A8A"
        android:pathData="M0,0 L108,108 L0,108 Z" />
</vector>`;

const ANDROID_IC_LAUNCHER_ADAPTIVE_XML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`;

/**
 * Creates and downloads a ready-to-build Android Capacitor Project ZIP with
 * the official ENGLISH STUDY CENTRE launcher icon embedded across all mipmaps.
 */
export async function exportCapacitorAndroidZip(): Promise<void> {
  const zip = new JSZip();

  // 1. capacitor.config.json
  const capacitorConfig = {
    appId: 'com.englishstudycentre.deepaksir',
    appName: 'ENGLISH STUDY CENTRE',
    webDir: 'www',
    bundledWebRuntime: false,
    server: {
      androidScheme: 'https'
    },
    android: {
      allowMixedContent: true,
      captureInput: true,
      webContentsDebuggingEnabled: true
    }
  };
  zip.file('capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));

  // 2. package.json
  const packageJson = {
    name: 'english-study-centre-android',
    version: '1.0.0',
    description: 'Android APK project for English Study Centre (Dir. Deepak Sir)',
    scripts: {
      'android:init': 'npx cap add android',
      'android:sync': 'npx cap sync android',
      'android:open': 'npx cap open android',
      'android:build-debug': 'npx cap sync android && cd android && ./gradlew assembleDebug',
      'android:build-release': 'npx cap sync android && cd android && ./gradlew assembleRelease'
    },
    dependencies: {
      '@capacitor/core': '^6.0.0',
      '@capacitor/android': '^6.0.0'
    },
    devDependencies: {
      '@capacitor/cli': '^6.0.0'
    }
  };
  zip.file('package.json', JSON.stringify(packageJson, null, 2));

  // 3. AndroidManifest template with custom icon config
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.englishstudycentre.deepaksir">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="ENGLISH STUDY CENTRE"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="ENGLISH STUDY CENTRE"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>
    </application>

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
</manifest>`;
  zip.file('android_template/AndroidManifest.xml', androidManifest);

  // 4. Android Adaptive Vector Drawables & XMLs
  zip.file('android_template/res/drawable/ic_launcher_foreground.xml', ANDROID_IC_LAUNCHER_FOREGROUND_XML);
  zip.file('android_template/res/drawable/ic_launcher_background.xml', ANDROID_IC_LAUNCHER_BACKGROUND_XML);
  zip.file('android_template/res/mipmap-anydpi-v26/ic_launcher.xml', ANDROID_IC_LAUNCHER_ADAPTIVE_XML);
  zip.file('android_template/res/mipmap-anydpi-v26/ic_launcher_round.xml', ANDROID_IC_LAUNCHER_ADAPTIVE_XML);
  zip.file('android_template/res/values/strings.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">ENGLISH STUDY CENTRE</string>
    <string name="title_activity_main">ENGLISH STUDY CENTRE</string>
    <string name="package_name">com.englishstudycentre.deepaksir</string>
    <string name="director_name">Dir. Deepak Sir</string>
</resources>`);

  // 5. Embed High-Res PNG & SVG Launcher Icons across all mipmap folders
  try {
    const [png192Res, png512Res, svgRes] = await Promise.all([
      fetch('/pwa-192x192.png'),
      fetch('/pwa-512x512.png'),
      fetch('/icon.svg')
    ]);

    if (png192Res.ok) {
      const b192 = await png192Res.arrayBuffer();
      // Mipmap density buckets
      zip.file('android_template/res/mipmap-mdpi/ic_launcher.png', b192);
      zip.file('android_template/res/mipmap-hdpi/ic_launcher.png', b192);
      zip.file('android_template/res/mipmap-xhdpi/ic_launcher.png', b192);
      zip.file('android_template/res/mipmap-xxhdpi/ic_launcher.png', b192);
      zip.file('android_template/res/mipmap-xxxhdpi/ic_launcher.png', b192);

      zip.file('android_template/res/mipmap-mdpi/ic_launcher_round.png', b192);
      zip.file('android_template/res/mipmap-hdpi/ic_launcher_round.png', b192);
      zip.file('android_template/res/mipmap-xhdpi/ic_launcher_round.png', b192);
      zip.file('android_template/res/mipmap-xxhdpi/ic_launcher_round.png', b192);
      zip.file('android_template/res/mipmap-xxxhdpi/ic_launcher_round.png', b192);

      zip.file('www/pwa-192x192.png', b192);
    }

    if (png512Res.ok) {
      const b512 = await png512Res.arrayBuffer();
      zip.file('android_template/ic_launcher-playstore.png', b512);
      zip.file('www/pwa-512x512.png', b512);
    }

    if (svgRes.ok) {
      const svgText = await svgRes.text();
      zip.file('www/icon.svg', svgText);
    }
  } catch (err) {
    console.warn('Could not fetch binary icon assets for ZIP, skipping raw images:', err);
  }

  // 6. Embed Manifest in www/
  try {
    const manRes = await fetch('/manifest.json');
    if (manRes.ok) {
      const manText = await manRes.text();
      zip.file('www/manifest.json', manText);
    }
  } catch (e) {
    // ignore
  }

  // 7. Embed the single-file offline app inside www/index.html
  try {
    const res = await fetch('/english_study_centre_offline.html');
    if (res.ok) {
      const htmlContent = await res.text();
      zip.file('www/index.html', htmlContent);
    }
  } catch (e) {
    zip.file('www/index.html', '<h1>ENGLISH STUDY CENTRE</h1>');
  }

  // 8. Instructions README
  const readme = `# ENGLISH STUDY CENTRE – Android APK Build Guide
Dir. Deepak Sir • Akashi Sasaram (Mob: 7050492611)

This package contains the complete Android Capacitor project to compile your real Android APK with the custom ENGLISH STUDY CENTRE launcher icon (ESC monogram, open book, and OMR bubbles).

### Option 1: 1-Click Cloud APK Build (Free via GitHub Actions)
1. Push this folder to your GitHub repository.
2. The workflow file \`.github/workflows/build-apk.yml\` will automatically run.
3. Click "Actions" tab -> "Build Android APK" -> Download the finished \`English_Study_Centre_Android_App.apk\`!

### Option 2: Local Build via Android Studio or Terminal
1. Install Node.js and Android Studio on your computer.
2. In this folder, run:
   \`\`\`bash
   npm install
   npx cap add android
   npx cap sync android
   \`\`\`
3. To build APK directly from terminal:
   \`\`\`bash
   cd android
   ./gradlew assembleDebug
   \`\`\`
   The APK will be generated at: \`android/app/build/outputs/apk/debug/app-debug.apk\`.
4. Or open Android Studio:
   \`\`\`bash
   npx cap open android
   \`\`\`
   Then click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
`;
  zip.file('README_BUILD_APK.md', readme);

  // 9. Generate ZIP and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ENGLISH_STUDY_CENTRE_Capacitor_Android_Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a standalone package containing all Android App Launcher Icon assets.
 */
export async function exportAndroidIconPack(): Promise<void> {
  const zip = new JSZip();

  zip.file('res/drawable/ic_launcher_foreground.xml', ANDROID_IC_LAUNCHER_FOREGROUND_XML);
  zip.file('res/drawable/ic_launcher_background.xml', ANDROID_IC_LAUNCHER_BACKGROUND_XML);
  zip.file('res/mipmap-anydpi-v26/ic_launcher.xml', ANDROID_IC_LAUNCHER_ADAPTIVE_XML);
  zip.file('res/mipmap-anydpi-v26/ic_launcher_round.xml', ANDROID_IC_LAUNCHER_ADAPTIVE_XML);

  try {
    const [png192, png512, maskable512, svg, maskSvg, foreSvg, backSvg] = await Promise.all([
      fetch('/pwa-192x192.png').then(r => r.arrayBuffer()),
      fetch('/pwa-512x512.png').then(r => r.arrayBuffer()),
      fetch('/pwa-maskable-512x512.png').then(r => r.arrayBuffer()),
      fetch('/icon.svg').then(r => r.text()),
      fetch('/icon-maskable.svg').then(r => r.text()),
      fetch('/adaptive-icon-foreground.svg').then(r => r.text()),
      fetch('/adaptive-icon-background.svg').then(r => r.text())
    ]);

    zip.file('res/mipmap-xxxhdpi/ic_launcher.png', png192);
    zip.file('res/mipmap-xxhdpi/ic_launcher.png', png192);
    zip.file('res/mipmap-xhdpi/ic_launcher.png', png192);
    zip.file('res/mipmap-hdpi/ic_launcher.png', png192);
    zip.file('res/mipmap-mdpi/ic_launcher.png', png192);

    zip.file('res/mipmap-xxxhdpi/ic_launcher_round.png', maskable512);
    zip.file('playstore_icon_512x512.png', png512);

    zip.file('vector_assets/icon.svg', svg);
    zip.file('vector_assets/icon-maskable.svg', maskSvg);
    zip.file('vector_assets/adaptive-icon-foreground.svg', foreSvg);
    zip.file('vector_assets/adaptive-icon-background.svg', backSvg);
  } catch (err) {
    console.error('Error bundling icon assets:', err);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ENGLISH_STUDY_CENTRE_Android_Launcher_Icons.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
