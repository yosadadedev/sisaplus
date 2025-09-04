# SHA-1 Fingerprint Guide untuk Firebase

## Apa itu SHA-1 Fingerprint?

SHA-1 fingerprint adalah identifikasi unik untuk aplikasi Android yang digunakan Firebase untuk memverifikasi identitas aplikasi. Ini diperlukan untuk:

- ✅ Google Sign-in authentication
- ✅ Firebase Dynamic Links
- ✅ Firebase App Check
- ✅ Google Play Games integration
- ✅ Firebase Cloud Messaging (FCM)

## Cara Mendapatkan SHA-1 Fingerprint

### 1. Untuk Expo Managed Workflow

```bash
# Install Expo CLI jika belum ada
npm install -g @expo/cli

# Masuk ke direktori project
cd /path/to/your/expo/project

# Dapatkan SHA-1 fingerprint
expo credentials:manager
```

**Langkah-langkah:**
1. Pilih platform: `Android`
2. Pilih `Keystore: Manage everything needed to build your project`
3. Pilih `Download credentials`
4. SHA-1 akan ditampilkan di output

### 2. Untuk React Native CLI / Bare Workflow

#### Debug Keystore (Development)

```bash
# Cek apakah debug keystore sudah ada
ls ~/.android/debug.keystore

# Jika belum ada, buat debug keystore
keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000

# Dapatkan SHA-1 dari debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### Production Keystore

```bash
# Untuk keystore production
keytool -list -v -keystore /path/to/your/release-key.keystore -alias your-key-alias
```

### 3. Menggunakan Android Studio

1. Buka Android Studio
2. Buka project Android Anda
3. Klik **Build** > **Generate Signed Bundle/APK**
4. Pilih **APK** dan klik **Next**
5. Pilih keystore atau buat baru
6. SHA-1 akan muncul di build output atau Gradle console

### 4. Menggunakan Gradle (untuk React Native)

```bash
# Masuk ke folder android
cd android

# Jalankan signing report
./gradlew signingReport
```

### 5. Untuk EAS Build (Expo)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login ke Expo
eas login

# Lihat credentials
eas credentials
```

## Output SHA-1 Fingerprint

Setelah menjalankan command di atas, Anda akan melihat output seperti ini:

```
Certificate fingerprints:
         MD5:  XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
         SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
         SHA256: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

**Yang Anda butuhkan adalah nilai SHA1** (20 byte dalam format XX:XX:XX...)

## Menambahkan SHA-1 ke Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Klik ⚙️ **Project Settings**
4. Scroll ke bagian **Your apps**
5. Pilih aplikasi Android Anda
6. Klik **Add fingerprint**
7. Paste SHA-1 fingerprint yang sudah Anda dapatkan
8. Klik **Save**

## Troubleshooting

### Debug Keystore Tidak Ada

Jika `~/.android/debug.keystore` tidak ada:

```bash
# Buat folder .android jika belum ada
mkdir -p ~/.android

# Generate debug keystore
keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

### Keytool Command Not Found

Jika command `keytool` tidak ditemukan:

```bash
# Untuk macOS dengan Homebrew
brew install openjdk

# Atau gunakan Java yang sudah terinstall
export PATH="$JAVA_HOME/bin:$PATH"
```

### Multiple SHA-1 untuk Different Builds

Untuk aplikasi production, Anda mungkin perlu menambahkan multiple SHA-1:

- **Debug SHA-1**: Untuk development dan testing
- **Release SHA-1**: Untuk production build
- **Play Store SHA-1**: Google Play akan re-sign aplikasi Anda

## Tips

1. **Simpan SHA-1**: Catat SHA-1 fingerprint di tempat yang aman
2. **Multiple Environments**: Tambahkan SHA-1 untuk debug dan release
3. **Team Development**: Setiap developer mungkin punya debug keystore berbeda
4. **CI/CD**: Pastikan CI/CD menggunakan keystore yang sama

## Untuk Development Tanpa SHA-1

Jika Anda hanya menggunakan Email/Password authentication, SHA-1 fingerprint **opsional**. Anda bisa:

1. Skip SHA-1 untuk development awal
2. Tambahkan nanti saat butuh Google Sign-in
3. Firebase akan tetap berfungsi untuk fitur dasar

---

**Catatan**: SHA-1 fingerprint berbeda untuk setiap keystore. Pastikan Anda menggunakan keystore yang sama untuk development dan production.