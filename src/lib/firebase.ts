import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBmfQ9R3mvtqB0atQLByt1_XxyiaNRhlPg",
  authDomain: "valamiki.firebaseapp.com",
  databaseURL: "https://valamiki-default-rtdb.firebaseio.com",
  projectId: "valamiki",
  storageBucket: "valamiki.firebasestorage.app",
  messagingSenderId: "603268214018",
  appId: "1:603268214018:web:c12aa3dde1f69888d5261b",
  measurementId: "G-TQDLY9QHR1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Analytics only runs in the browser
if (typeof window !== 'undefined') {
  isSupported().then(yes => { if (yes) getAnalytics(app); });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
