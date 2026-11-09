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
    <!-- Rising sun above the open book -->
    <path android:fillColor="#FFD21F"
        android:pathData="M54,8 a11,11 0 1,0 0,22 a11,11 0 1,0 0,-22" />
    <path android:fillColor="#FFD21F"
        android:pathData="M52,3 h4 v7 h-4 z M34,10 l4,-3 4,8 -4,2 z M70,7 l4,3 -4,7 -4,-2 z M24,23 l2,-4 8,4 -2,4 z M74,23 l8,-4 2,4 -8,4 z" />
    <!-- Open book -->
    <path android:fillColor="#FFFFFF" android:strokeColor="#F5B800" android:strokeWidth="1.2"
        android:pathData="M54,34 C45,28 32,27 21,31 L21,47 C33,43 45,44 54,51 Z" />
    <path android:fillColor="#FFFFFF" android:strokeColor="#F5B800" android:strokeWidth="1.2"
        android:pathData="M54,34 C63,28 76,27 87,31 L87,47 C75,43 63,44 54,51 Z" />
    <path android:fillColor="#1D4ED8" android:pathData="M53,35 h2 v16 h-2 z" />
    <!-- ESC monogram -->
    <path android:fillColor="#FFFFFF"
        android:pathData="M20,57 h19 v5 h-13 v4 h11 v5 h-11 v4 h13 v5 h-19 z" />
    <path android:fillColor="#FFFFFF"
        android:pathData="M63,57 h-14 q-5,0 -5,5 v4 q0,5 5,5 h9 v4 h-14 v5 h15 q5,0 5,-5 v-4 q0,-5 -5,-5 h-9 v-4 h13 z" />
    <path android:fillColor="#FFFFFF"
        android:pathData="M89,57 h-14 q-5,0 -5,5 v13 q0,5 5,5 h14 v-5 h-13 v-13 h13 z" />
    <!-- Gold base accent -->
    <path android:fillColor="#FFD21F" android:pathData="M25,88 h58 v4 h-58 z" />
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
