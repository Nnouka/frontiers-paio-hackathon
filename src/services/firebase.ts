import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signInAnonymously } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "frontiers-paio-dev.firebaseapp.com",
  projectId: "frontiers-paio-dev",
  storageBucket: "frontiers-paio-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Enable local Firebase Emulators automatically in development mode or when explicitly flagged
const USE_EMULATORS = import.meta.env.DEV || import.meta.env.VITE_USE_EMULATORS === "true";

let emulatorsConnected = false;

export function initEmulators() {
  if (USE_EMULATORS && !emulatorsConnected) {
    try {
      const emulatorHost = window.location.hostname || "127.0.0.1";
      
      connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(db, emulatorHost, 8080);
      connectFunctionsEmulator(functions, emulatorHost, 5001);
      connectStorageEmulator(storage, emulatorHost, 9199);

      emulatorsConnected = true;
      console.log("[Firebase] Successfully connected to local Firebase Emulator Suite on", emulatorHost);
    } catch (err) {
      console.warn("[Firebase] Emulators already connected or failed to connect:", err);
    }
  }
}

initEmulators();

// Keep last plan/reminder data available in browser offline mode.
enableIndexedDbPersistence(db).catch((err) => {
  // failed-precondition occurs when multiple tabs are open; offline is still optional.
  console.warn("[Firebase] IndexedDB persistence unavailable:", err);
});

// Demo bootstrap: sign users in anonymously if no active auth session.
if (!auth.currentUser) {
  signInAnonymously(auth).catch((err) => {
    console.warn("[Firebase] Anonymous sign-in unavailable:", err);
  });
}
