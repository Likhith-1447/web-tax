import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANcONvBqdpUHYswcBhuCaMjEQ6ofCQK-w",
  authDomain: "login-c385f.firebaseapp.com",
  projectId: "login-c385f",
  storageBucket: "login-c385f.firebasestorage.app",
  messagingSenderId: "756832983963",
  appId: "1:756832983963:web:0243b8ed6cad95d0a69f3e",
  measurementId: "G-C620PL35RG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);