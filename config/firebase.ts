import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyBQpSouNYHv6Rg3aOrtjd14XqHNwEJs-9g',
  authDomain: 'sisaplus-d70b7.firebaseapp.com',
  projectId: 'sisaplus-d70b7',
  storageBucket: 'sisaplus-d70b7.firebasestorage.app',
  messagingSenderId: '455331509433',
  appId: '1:455331509433:web:190eccb7eee2c857555768',
  measurementId: 'G-8HC0RD2T98',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
// Note: AsyncStorage persistence warning is expected in development
// Auth state will persist automatically in production builds
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
