<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b3ef0b55-43b8-476d-9c53-2a5d64e18da0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Android APK build
Push to `main` or `master`, or run the **Build Android APK** workflow manually from GitHub Actions. Download `English-Study-Centre-Android-APK` from the workflow run Artifacts. The workflow builds a signed debug APK with Capacitor and Android Gradle that can be installed directly on Android.
