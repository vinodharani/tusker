/* ============================================================
   Tusker — Firebase configuration

   ONE-TIME SETUP (see FIREBASE_SETUP.md):
   1. Create a free project at https://console.firebase.google.com
   2. Add a Web app (<\/>) and copy its config object below.
   3. Enable Authentication → Sign-in method → Anonymous.
   4. Create a Firestore database (production mode is fine).
   Until the config is filled in, Tusker runs exactly as before,
   storing data only in this device's browser.
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCs_zJUMC1xi3J8KhAfw2PhRWiNKY3xBWY",
  authDomain: "tusker-d5ce9.firebaseapp.com",
  projectId: "tusker-d5ce9",
  storageBucket: "tusker-d5ce9.firebasestorage.app",
  messagingSenderId: "383080212770",
  appId: "1:383080212770:web:c76c5b6bb2700eb468dd7b",
};

function firebaseConfigured() {
  return FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("PASTE_");
}