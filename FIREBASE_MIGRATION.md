# Firebase Migration Guide

## Overview
Panduan ini menjelaskan langkah-langkah untuk migrasi dari SQLite ke Firebase di masa depan.

## Persiapan Migrasi

### 1. Firebase Setup
- [ ] Buat project Firebase baru
- [ ] Setup Firebase Authentication
- [ ] Setup Firestore Database
- [ ] Setup Firebase Storage (untuk gambar makanan)
- [ ] Konfigurasi Firebase SDK

### 2. Dependencies yang Diperlukan
```bash
npm install firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/storage
```

### 3. Struktur Database Firestore

#### Collections:

**users**
```javascript
{
  id: string,
  email: string,
  full_name: string,
  phone: string,
  address: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

**foods**
```javascript
{
  id: string,
  title: string,
  description: string,
  unit: string,
  pickup_address: string,
  pickup_time_start: timestamp,
  pickup_time_end: timestamp,
  dietary_info: string,
  allergen_info: string,
  preparation_notes: string,
  price_type: 'free' | 'paid',
  price: number,
  is_featured: boolean,
  view_count: number,
  donor_id: string,
  image_urls: array,
  status: 'available' | 'booked' | 'completed' | 'expired' | 'cancelled',
  created_at: timestamp,
  updated_at: timestamp
}
```

**bookings**
```javascript
{
  id: string,
  food_id: string,
  user_id: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  pickup_time: timestamp,
  notes: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 4. File yang Perlu Dimodifikasi

1. **lib/firebase.ts** (baru)
   - Konfigurasi Firebase
   - Helper functions untuk Firestore operations

2. **store/foodStore.ts**
   - Ganti SQLite operations dengan Firestore
   - Implementasi real-time listeners

3. **store/authStore.ts**
   - Ganti SQLite auth dengan Firebase Auth
   - Implementasi Google/Facebook login

4. **screens/*.tsx**
   - Update untuk menggunakan Firebase types
   - Implementasi upload gambar ke Firebase Storage

### 5. Fitur Tambahan dengan Firebase

- **Real-time Updates**: Gunakan Firestore listeners
- **Push Notifications**: Firebase Cloud Messaging
- **Analytics**: Firebase Analytics
- **Crash Reporting**: Firebase Crashlytics
- **Image Upload**: Firebase Storage
- **Social Login**: Google, Facebook, Apple

### 6. Data Migration Strategy

1. Export data dari SQLite
2. Transform data format untuk Firestore
3. Batch upload ke Firestore
4. Verify data integrity
5. Switch to Firebase backend

### 7. Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Foods are readable by all, writable by owner
    match /foods/{foodId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.donor_id;
    }
    
    // Bookings are readable/writable by food owner and booking user
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         request.auth.uid == get(/databases/$(database)/documents/foods/$(resource.data.food_id)).data.donor_id);
    }
  }
}
```

## Timeline Estimasi

- **Week 1**: Firebase setup dan konfigurasi
- **Week 2**: Migrasi authentication
- **Week 3**: Migrasi food dan booking data
- **Week 4**: Testing dan deployment

## Catatan Penting

- Backup data SQLite sebelum migrasi
- Test thoroughly di development environment
- Implementasi gradual rollout
- Monitor performance dan costs