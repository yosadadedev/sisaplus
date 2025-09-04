# Firebase Setup Guide

Panduan ini menjelaskan cara setup Firebase untuk aplikasi SisaPlus.

## Prerequisites

1. Node.js dan npm terinstall
2. Firebase CLI terinstall (`npm install -g firebase-tools`)
3. Akun Google untuk Firebase Console

## Setup Firebase Project

### 1. Buat Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Create a project"
3. Masukkan nama project: `sisaplus-app`
4. Pilih apakah ingin menggunakan Google Analytics (opsional)
5. Klik "Create project"

### 1.1 Add Firebase SDK ke Project

#### Untuk Expo Managed Workflow:

```bash
# Install Firebase SDK
npm install firebase

# Install Expo Firebase dependencies (jika diperlukan)
npx expo install expo-auth-session expo-crypto
```

#### Untuk React Native CLI / Bare Workflow:

```bash
# Install Firebase SDK
npm install firebase

# Untuk Android - install Google Services
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore

# iOS setup (jika menggunakan iOS)
cd ios && pod install
```

#### Setup Firebase Configuration:

1. **Buat file konfigurasi Firebase:**
   ```typescript
   // config/firebase.ts
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';
   
   const firebaseConfig = {
     apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
   };
   
   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   export default app;
   ```

2. **Setup Environment Variables:**
   ```bash
   # .env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Dapatkan Firebase Config:**
   - Di Firebase Console, klik ⚙️ **Project Settings**
   - Scroll ke bagian **Your apps**
   - Klik **Add app** > **Web** (🌐)
   - Masukkan app nickname (contoh: "sisaplus-web")
   - **Jangan** centang "Also set up Firebase Hosting"
   - Klik **Register app**
   - Copy konfigurasi yang muncul ke file `.env`

#### Setup untuk Android (React Native CLI):

1. **Download google-services.json:**
   - Di Firebase Console, tambahkan Android app
   - Masukkan package name (contoh: `com.sisaplus.app`)
   - Download `google-services.json`
   - Simpan di `android/app/google-services.json`

2. **Update android/build.gradle:**
   ```gradle
   buildscript {
     dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
     }
   }
   ```

3. **Update android/app/build.gradle:**
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

#### Setup untuk iOS (React Native CLI):

1. **Download GoogleService-Info.plist:**
   - Di Firebase Console, tambahkan iOS app
   - Masukkan Bundle ID (contoh: `com.sisaplus.app`)
   - Download `GoogleService-Info.plist`
   - Drag file ke Xcode project (target: main app)

2. **Install pods:**
   ```bash
   cd ios && pod install
   ```

#### Verifikasi Installation:

```typescript
// App.tsx atau file utama
import { auth, db } from './config/firebase';

console.log('Firebase initialized:', {
  auth: !!auth,
  firestore: !!db
});
```

### 2. Setup Authentication

1. Di Firebase Console, pilih project yang baru dibuat
2. Klik "Authentication" di sidebar kiri
3. Klik tab "Sign-in method"
4. Enable "Email/Password" provider
5. Enable "Google Sign-in" (opsional)
6. Klik "Save"

#### 2.1 Setup Android App (Untuk Google Sign-in)
1. Di Firebase Console, pilih **Project Settings** > **General**
2. Scroll ke bagian **Your apps** dan klik **Add app** > **Android**
3. Masukkan package name aplikasi (biasanya `com.yourcompany.sisaplus`)
4. Untuk **Debug signing certificate SHA-1** (opsional tapi direkomendasikan):

   **Cara mendapatkan SHA-1 fingerprint:**
   
   a. **Jika menggunakan Expo managed workflow:**
   ```bash
   # Install Expo CLI jika belum ada
   npm install -g @expo/cli
   
   # Dapatkan SHA-1 fingerprint
   expo credentials:manager
   ```
   
   b. **Jika menggunakan React Native CLI atau bare workflow:**
   ```bash
   # Untuk debug keystore (development)
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Jika debug keystore belum ada, buat dulu:
   keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
   ```
   
   c. **Untuk production keystore:**
   ```bash
   keytool -list -v -keystore /path/to/your/keystore.jks -alias your-alias
   ```
   
   **Catatan:** SHA-1 fingerprint diperlukan untuk:
   - Google Sign-in authentication
   - Firebase Dynamic Links
   - Firebase App Check
   - Google Play Games integration

5. Download file `google-services.json` dan simpan di folder `android/app/`

### 2.3 Alternatif Cara Mendapatkan SHA-1

**Untuk Expo Development Build:**
```bash
# Jika menggunakan EAS Build
eas credentials
```

**Untuk testing tanpa SHA-1:**
- Anda bisa skip SHA-1 fingerprint untuk development awal
- Firebase akan tetap berfungsi untuk Email/Password authentication
- SHA-1 hanya wajib untuk Google Sign-in dan fitur tertentu

**Jika menggunakan Android Studio:**
1. Buka Android Studio
2. Pilih **Build** > **Generate Signed Bundle/APK**
3. Pilih **APK** > **Next**
4. Klik **Create new...** untuk membuat keystore baru
5. Atau gunakan existing keystore dan lihat SHA-1 di build output

### 3. Setup Firestore Database

1. Klik "Firestore Database" di sidebar kiri
2. Klik "Create database"
3. Pilih "Start in test mode" (akan diubah ke production mode nanti)
4. Pilih lokasi server (pilih yang terdekat dengan pengguna)
5. Klik "Done"

### 4. Setup Web App

1. Di Firebase Console, klik ikon gear (Settings) > "Project settings"
2. Scroll ke bawah ke bagian "Your apps"
3. Klik ikon web (</>) untuk "Add app"
4. Masukkan app nickname: `sisaplus-web`
5. Centang "Also set up Firebase Hosting" (opsional)
6. Klik "Register app"
7. Copy konfigurasi Firebase yang diberikan
8. Paste ke file `lib/firebaseConfig.ts` (ganti konfigurasi yang ada)

### 5. Install Firebase CLI dan Login

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login ke Firebase
firebase login

# Initialize Firebase di project
firebase init
```

### 5.1 Firebase Init Setup Guide

Ketika menjalankan `firebase init`, ikuti langkah berikut:

**1. Select Firebase features:**
```
? Which Firebase features do you want to set up for this directory?
❯ ◯ Firestore: Configure security rules and indexes files for Firestore
  ◯ Functions: Configure a Cloud Functions directory and its files
  ◯ Hosting: Configure files for Firebase Hosting and (optionally) GitHub Action deploys
  ◯ Hosting: Set up GitHub Action deploys
  ◯ Storage: Configure a security rules file for Cloud Storage
  ◯ Emulators: Set up local emulators for Firebase products
```
**Pilih:** `Firestore`, `Hosting`, dan `Emulators` (gunakan Space untuk select, Enter untuk confirm)

**2. Project Setup:**
```
? Please select an option:
❯ Use an existing project
  Create a new project
  Add Firebase to an existing Google Cloud Platform project
  Don't set up a default project
```
**Pilih:** `Use an existing project`

**3. Select your Firebase project:**
```
? Select a default Firebase project for this directory:
❯ your-project-id (Your Project Name)
```
**Pilih:** Project yang sudah Anda buat di Firebase Console

**4. Firestore Setup:**
```
? What file should be used for Firestore Rules? (firestore.rules)
? File firestore.rules already exists. Do you want to overwrite it? (y/N)
```
**Jawab:** `N` (karena kita sudah punya rules yang bagus)

```
? What file should be used for Firestore indexes? (firestore.indexes.json)
? File firestore.indexes.json already exists. Do you want to overwrite it? (y/N)
```
**Jawab:** `N` (karena kita sudah punya indexes)

**5. Hosting Setup:**
```
? What do you want to use as your public directory? (public)
```
**Jawab:** `dist` atau `build` (tergantung build output Anda)

```
? Configure as a single-page app (rewrite all urls to /index.html)? (y/N)
```
**Jawab:** `y` (untuk React/Expo web app)

```
? Set up automatic builds and deploys with GitHub? (y/N)
```
**Jawab:** `N` (setup manual dulu)

**6. Emulators Setup:**
```
? Which Firebase emulators do you want to set up?
❯ ◯ Authentication Emulator
  ◯ Functions Emulator
  ◯ Firestore Emulator
  ◯ Database Emulator
  ◯ Hosting Emulator
  ◯ Pub/Sub Emulator
  ◯ Storage Emulator
```
**Pilih:** `Authentication Emulator`, `Firestore Emulator`, `Hosting Emulator`

```
? Which port do you want to use for the auth emulator? (9099)
? Which port do you want to use for the firestore emulator? (8080)
? Which port do you want to use for the hosting emulator? (5000)
? Would you like to enable the Emulator UI? (Y/n)
? Which port do you want to use for the Emulator UI (leave empty to use any available port)?
```
**Gunakan:** Port default atau sesuaikan dengan kebutuhan

```
? Would you like to download the emulators now? (Y/n)
```
**Jawab:** `Y`

### 6.3 Deploy Status

✅ **Firestore Rules & Indexes berhasil di-deploy!**

Project Console: https://console.firebase.google.com/project/sisaplus-d70b7/overview

**Note tentang Hosting:**
Hosting sementara dinonaktifkan karena aplikasi ini adalah React Native/Expo app yang memiliki dependensi native yang tidak kompatibel dengan web build. Untuk web deployment, pertimbangkan:

1. **Expo Web Build** (memerlukan refactoring untuk menghapus native dependencies)
2. **Separate Web App** (buat aplikasi web terpisah)
3. **PWA dengan Expo** (gunakan Expo untuk PWA)

### 6.4 Useful Firebase CLI Commands

**Deploy Commands:**
```bash
# Deploy semua
firebase deploy

# Deploy hanya Firestore rules
firebase deploy --only firestore:rules

# Deploy hanya Firestore indexes
firebase deploy --only firestore:indexes

# Deploy hanya hosting
firebase deploy --only hosting
```

**Emulator Commands:**
```bash
# Start semua emulators
firebase emulators:start

# Start emulator dengan UI
firebase emulators:start --import=./emulator-data

# Export emulator data
firebase emulators:export ./emulator-data

# Start hanya Firestore emulator
firebase emulators:start --only firestore
```

**Project Management:**
```bash
# List projects
firebase projects:list

# Switch project
firebase use project-id

# Add project alias
firebase use --add

# Show current project
firebase use
```

**Firestore Commands:**
```bash
# Backup Firestore data
firebase firestore:delete --all-collections --yes

# Import data
firebase firestore:delete --shallow --yes
```

### 6. Deploy Firestore Rules dan Indexes

```bash
# Deploy rules dan indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Konfigurasi Security Rules

File `firestore.rules` sudah dikonfigurasi dengan aturan keamanan:

- **Users**: User hanya bisa read/write data mereka sendiri
- **Foods**: Semua user bisa read, hanya seller yang bisa create/update/delete makanan mereka
- **Bookings**: User hanya bisa melihat booking mereka (sebagai buyer atau seller)

## Database Indexes

File `firestore.indexes.json` berisi indeks untuk query yang efisien:

- Query makanan berdasarkan availability dan tanggal
- Query makanan berdasarkan seller
- Query booking berdasarkan buyer/seller dan status

## Environment Variables

Pastikan file `.env` berisi konfigurasi Firebase yang benar:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Testing dengan Firebase Emulator

Untuk development dan testing lokal:

```bash
# Start Firebase emulators
firebase emulators:start

# Atau hanya Firestore dan Auth
firebase emulators:start --only firestore,auth
```

Emulator akan berjalan di:
- Firestore: http://localhost:8080
- Auth: http://localhost:9099
- Emulator UI: http://localhost:4000

## Production Deployment

Setelah testing selesai, deploy ke production:

```bash
# Deploy semua
firebase deploy

# Atau deploy spesifik
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only hosting
```

## Monitoring dan Analytics

1. Setup Firebase Analytics (opsional)
2. Monitor usage di Firebase Console
3. Setup alerts untuk quota dan billing
4. Review security rules secara berkala

## Troubleshooting

### Common Issues:

1. **Permission denied**: Periksa security rules
2. **Index required**: Deploy indexes yang diperlukan
3. **Quota exceeded**: Monitor usage dan upgrade plan jika perlu
4. **Network errors**: Periksa koneksi internet dan konfigurasi

### Useful Commands:

```bash
# Check Firebase project
firebase projects:list

# Switch project
firebase use project-id

# View logs
firebase functions:log

# Test security rules
firebase emulators:exec --only firestore "npm test"
```

## Security Best Practices

1. Selalu gunakan security rules yang ketat
2. Validasi data di client dan server
3. Gunakan indexes untuk query yang efisien
4. Monitor usage dan set up billing alerts
5. Regular review dan update security rules
6. Gunakan environment variables untuk sensitive data
7. Enable audit logging untuk production

## Support

Jika ada masalah:
1. Cek [Firebase Documentation](https://firebase.google.com/docs)
2. Cek [Firebase Status Page](https://status.firebase.google.com/)
3. Tanya di [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
4. Buka issue di repository ini