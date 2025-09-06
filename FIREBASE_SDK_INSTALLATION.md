# Firebase SDK Installation Guide

## Overview

Panduan ini menjelaskan cara menambahkan Firebase SDK ke project React Native/Expo dengan berbagai workflow.

## 🚀 Quick Start

### 1. Install Firebase SDK

#### Untuk Expo Managed Workflow:

```bash
# Install Firebase SDK
npm install firebase

# Install dependencies tambahan untuk Expo
npx expo install expo-auth-session expo-crypto expo-web-browser
```

#### Untuk React Native CLI / Bare Workflow:

```bash
# Install Firebase SDK (Web)
npm install firebase

# ATAU install React Native Firebase (Native)
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/storage
```

### 2. Pilih Firebase Implementation

| Feature | Firebase Web SDK | React Native Firebase |
|---------|------------------|------------------------|
| **Bundle Size** | Lebih besar | Lebih kecil |
| **Performance** | Good | Excellent |
| **Offline Support** | Limited | Full |
| **Setup Complexity** | Simple | Complex |
| **Expo Compatibility** | ✅ Full | ❌ Bare workflow only |
| **Real-time Updates** | ✅ | ✅ |

**Rekomendasi:**
- **Expo Managed**: Gunakan Firebase Web SDK
- **React Native CLI**: Gunakan React Native Firebase untuk performa terbaik

## 📱 Setup untuk Expo Managed Workflow

### 1. Install Dependencies

```bash
npm install firebase
npx expo install expo-auth-session expo-crypto expo-web-browser
```

### 2. Buat Firebase Config

```typescript
// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
```

### 3. Setup Environment Variables

```bash
# .env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Install AsyncStorage

```bash
npx expo install @react-native-async-storage/async-storage
```

## 🔧 Setup untuk React Native CLI

### Option A: Firebase Web SDK

```bash
npm install firebase
npm install @react-native-async-storage/async-storage
```

Gunakan konfigurasi yang sama seperti Expo di atas.

### Option B: React Native Firebase (Recommended)

#### 1. Install Dependencies

```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
```

#### 2. Android Setup

**a. Download google-services.json:**
1. Di Firebase Console → Project Settings → Your apps
2. Klik Android app atau "Add app" → Android
3. Masukkan package name (dari `android/app/build.gradle`)
4. Download `google-services.json`
5. Simpan di `android/app/google-services.json`

**b. Update android/build.gradle:**
```gradle
buildscript {
  dependencies {
    // Add this line
    classpath 'com.google.gms:google-services:4.3.15'
  }
}
```

**c. Update android/app/build.gradle:**
```gradle
// Add to the bottom of the file
apply plugin: 'com.google.gms.google-services'
```

#### 3. iOS Setup

**a. Download GoogleService-Info.plist:**
1. Di Firebase Console → Project Settings → Your apps
2. Klik iOS app atau "Add app" → iOS
3. Masukkan Bundle ID (dari `ios/YourApp/Info.plist`)
4. Download `GoogleService-Info.plist`
5. Drag file ke Xcode project (target: main app, bukan Tests)

**b. Install Pods:**
```bash
cd ios && pod install
```

#### 4. React Native Firebase Config

```typescript
// config/firebase.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export { auth, firestore as db };
```

## 🔍 Mendapatkan Firebase Configuration

### 1. Buat Web App di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Klik ⚙️ **Project Settings**
4. Scroll ke **Your apps**
5. Klik **Add app** → **Web** (🌐)
6. Masukkan app nickname (contoh: "sisaplus-web")
7. **Jangan** centang "Also set up Firebase Hosting"
8. Klik **Register app**
9. Copy konfigurasi yang muncul

### 2. Format untuk Environment Variables

```javascript
// Firebase config yang muncul:
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Convert ke .env format:
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## ✅ Verifikasi Installation

### 1. Test Firebase Connection

```typescript
// App.tsx atau component utama
import React, { useEffect } from 'react';
import { auth, db } from './config/firebase';

export default function App() {
  useEffect(() => {
    // Test Firebase connection
    console.log('🔥 Firebase Auth:', !!auth);
    console.log('🔥 Firebase Firestore:', !!db);
    
    // Test auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('👤 Auth state changed:', user ? 'Logged in' : 'Logged out');
    });
    
    return unsubscribe;
  }, []);
  
  return (
    // Your app components
  );
}
```

### 2. Test Firestore Connection

```typescript
import { collection, getDocs } from 'firebase/firestore';
// atau untuk React Native Firebase:
// import firestore from '@react-native-firebase/firestore';

// Test Firestore
const testFirestore = async () => {
  try {
    // Firebase Web SDK
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('✅ Firestore connected, docs:', querySnapshot.size);
    
    // React Native Firebase
    // const snapshot = await firestore().collection('test').get();
    // console.log('✅ Firestore connected, docs:', snapshot.size);
  } catch (error) {
    console.error('❌ Firestore error:', error);
  }
};
```

## 🚨 Troubleshooting

### Common Issues

**1. "Firebase app not initialized"**
```typescript
// Pastikan import firebase config di App.tsx
import './config/firebase'; // Add this line
```

**2. "Auth persistence error"**
```bash
# Install AsyncStorage
npx expo install @react-native-async-storage/async-storage
```

**3. "Google Services plugin not found" (Android)**
```gradle
// android/build.gradle - pastikan ada di dependencies
classpath 'com.google.gms:google-services:4.3.15'

// android/app/build.gradle - pastikan ada di bottom
apply plugin: 'com.google.gms.google-services'
```

**4. "GoogleService-Info.plist not found" (iOS)**
- Pastikan file di-drag ke Xcode project
- Pastikan target adalah main app (bukan Tests)
- Jalankan `cd ios && pod install`

### Debug Commands

```bash
# Clear cache
npx expo start --clear

# Reset Metro cache
npx react-native start --reset-cache

# Clean build (Android)
cd android && ./gradlew clean

# Clean build (iOS)
cd ios && xcodebuild clean
```

## 📚 Next Steps

Setelah Firebase SDK terinstall:

1. ✅ Setup Authentication
2. ✅ Setup Firestore Database
3. ✅ Setup Security Rules
4. ✅ Test semua fitur

Lihat `FIREBASE_SETUP.md` untuk langkah selanjutnya.