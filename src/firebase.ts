import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBuCCrpy1rFuxNZboEbUJsas8gMekSzX4Y",
  authDomain: "gen-lang-client-0625991995.firebaseapp.com",
  projectId: "gen-lang-client-0625991995",
  storageBucket: "gen-lang-client-0625991995.firebasestorage.app",
  messagingSenderId: "1088291887100",
  appId: "1:1088291887100:web:350e7651d32e2450620479"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-99namesofallah3d-022f5727-8905-4e8d-a3ef-1ca2cb4a29c3");
