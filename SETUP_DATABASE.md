# Setup Database Supabase - Panduan Lengkap

## Masalah yang Terjadi

Error yang muncul:
```
ERROR Sign up error: [AuthApiError: Database error saving new user]
ERROR Error loading foods: {"code": "PGRST205", "message": "Could not find the table 'public.foods' in the schema cache"}
```

**Penyebab:** Schema database belum dijalankan di Supabase Dashboard.

## Langkah-langkah Perbaikan

### 1. Buka Supabase Dashboard

1. Kunjungi [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Login dengan akun Anda
3. Pilih project: `othvvzsvgszxzupdjvxl`

### 2. Jalankan Schema Database

1. **Buka SQL Editor:**
   - Di sidebar kiri, klik **"SQL Editor"**
   - Klik **"New Query"**

2. **Copy dan Paste Schema:**
   - Buka file `supabase-schema.sql` di project ini
   - Copy seluruh isi file
   - Paste ke SQL Editor

3. **Jalankan Query:**
   - Klik tombol **"Run"** atau tekan `Ctrl+Enter`
   - Tunggu hingga selesai (biasanya 10-30 detik)

### 3. Setup Profile Auto-Creation Trigger

1. **Buka Query Baru:**
   - Klik **"New Query"** lagi

2. **Copy dan Paste Trigger:**
   - Buka file `setup-profile-trigger.sql` di project ini
   - Copy seluruh isi file
   - Paste ke SQL Editor

3. **Jalankan Query:**
   - Klik tombol **"Run"**
   - Pastikan tidak ada error

### 4. Verifikasi Setup

1. **Cek Tabel:**
   - Di sidebar kiri, klik **"Table Editor"**
   - Pastikan tabel berikut ada:
     - `profiles`
     - `foods`
     - `bookings`
     - `notifications`
     - `reviews`

2. **Cek Trigger:**
   - Kembali ke **"SQL Editor"**
   - Jalankan query ini untuk verifikasi:
   ```sql
   SELECT 
     trigger_name,
     event_manipulation,
     event_object_table
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```
   - Harus mengembalikan 1 row

### 5. Test Registrasi

1. **Restart Expo App:**
   - Di terminal, tekan `Ctrl+C` untuk stop
   - Jalankan `npx expo start` lagi

2. **Test Registrasi User Baru:**
   - Buka aplikasi di simulator/device
   - Coba registrasi dengan email baru
   - Seharusnya tidak ada error lagi

## Troubleshooting

### Jika Masih Error "Database error saving new user"

1. **Cek RLS (Row Level Security):**
   ```sql
   -- Disable RLS sementara untuk testing
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```

2. **Cek Permissions:**
   - Pastikan anon role punya akses INSERT ke profiles
   ```sql
   GRANT INSERT ON profiles TO anon;
   GRANT INSERT ON profiles TO authenticated;
   ```

### Jika Error "Could not find function get_nearby_foods"

1. **Pastikan function sudah dibuat:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'get_nearby_foods';
   ```

2. **Jika belum ada, jalankan ulang schema lengkap**

## Konfigurasi Email Confirmation

1. **Buka Authentication Settings:**
   - Di Supabase Dashboard → **Authentication** → **Settings**

2. **Aktifkan Email Confirmation:**
   - Scroll ke **"Email Confirmation"**
   - Toggle **"Confirm email"** = ON

3. **Set Redirect URLs:**
   - Di **"Redirect URLs"**, tambahkan:
     - `sisaplus://auth/callback`
     - `sisaplus://*`
   - Hapus atau disable `http://localhost:3000`

## Selesai!

Setelah mengikuti semua langkah di atas:
- ✅ Database schema sudah setup
- ✅ Profile auto-creation sudah aktif
- ✅ Email confirmation sudah dikonfigurasi
- ✅ Aplikasi siap digunakan

Jika masih ada masalah, cek console log untuk error detail dan pastikan semua environment variables sudah benar di file `.env`.