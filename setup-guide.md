# 🚀 Setup Guide untuk Sisa Plus

## 1. Environment Variables Setup

Untuk menjalankan aplikasi, Anda perlu mengkonfigurasi file `.env` dengan kredensial Supabase yang valid.

### Langkah-langkah:

1. **Buat project Supabase baru** di [supabase.com](https://supabase.com)

2. **Copy file `.env.example` ke `.env`**:
   ```bash
   cp .env.example .env
   ```

3. **Update file `.env` dengan kredensial Anda**:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
   ```

4. **Setup database schema**:
   - Jalankan SQL dari file `supabase-schema.sql` di Supabase SQL Editor
   - Ini akan membuat semua tabel, RLS policies, dan functions yang diperlukan

5. **Deploy Edge Functions**:
   ```bash
   npx supabase functions deploy
   ```

## 2. Google OAuth Setup

1. Buat project di [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Buat OAuth 2.0 credentials
4. Tambahkan client ID ke file `.env`

## 3. Expo Push Notifications

1. Buat account di [expo.dev](https://expo.dev)
2. Buat project baru
3. Copy project ID ke file `.env`

## 4. Menjalankan Aplikasi

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

## 5. Testing

- Gunakan Expo Go app untuk testing di device
- Atau gunakan iOS Simulator / Android Emulator
- Untuk push notifications, gunakan development build

## 🔧 Troubleshooting

### Error: "supabaseUrl is required"
- Pastikan file `.env` sudah dibuat dan berisi kredensial yang valid
- Restart development server setelah mengubah environment variables

### Push notifications tidak bekerja di Expo Go
- Ini normal, push notifications memerlukan development build
- Gunakan `eas build` untuk membuat development build

### Database connection error
- Pastikan RLS policies sudah diaktifkan
- Cek apakah anon key memiliki permissions yang tepat