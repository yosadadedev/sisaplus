# Firebase Migration Guide

## Overview
Panduan ini menjelaskan langkah-langkah untuk migrasi dari SQLite lokal ke Firebase sebagai backend cloud untuk aplikasi Sisa Plus.

## Prerequisites
- Firebase project sudah dibuat
- Firebase SDK sudah diinstall
- Konfigurasi Firebase sudah disiapkan

## Migration Steps

### 1. Install Firebase Dependencies
```bash
npm install firebase @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

### 2. Firebase Configuration
Buat file `lib/firebase.ts` dengan konfigurasi Firebase:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 3. Data Migration Strategy

#### Users Collection
```typescript
// Firestore structure
users: {
  [userId]: {
    email: string,
    full_name: string,
    phone: string,
    address: string,
    created_at: Timestamp,
    updated_at: Timestamp
  }
}
```

#### Foods Collection
```typescript
// Firestore structure
foods: {
  [foodId]: {
    title: string,
    description: string,
    unit: string,
    pickup_address: string,
    pickup_time_start: Timestamp,
    pickup_time_end: Timestamp,
    expired_at: Timestamp,
    dietary_info: string,
    allergen_info: string,
    preparation_notes: string,
    price_type: 'free' | 'paid',
    price: number,
    is_featured: boolean,
    view_count: number,
    donor_id: string,
    created_at: Timestamp,
    updated_at: Timestamp
  }
}
```

#### Bookings Collection
```typescript
// Firestore structure
bookings: {
  [bookingId]: {
    food_id: string,
    user_id: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    pickup_time: Timestamp,
    notes: string,
    created_at: Timestamp,
    updated_at: Timestamp
  }
}
```

### 4. Store Migration

#### Auth Store Migration
- Replace SQLite user management with Firebase Auth
- Update login/register functions to use Firebase Auth
- Implement real-time auth state listener

#### Food Store Migration
- Replace SQLite queries with Firestore operations
- Implement real-time listeners for foods and bookings
- Add proper error handling for network operations

### 5. Security Rules
Implement Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Foods are readable by all authenticated users
    match /foods/{foodId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.donor_id;
    }
    
    // Bookings are accessible by food donor and booking user
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         request.auth.uid == get(/databases/$(database)/documents/foods/$(resource.data.food_id)).data.donor_id);
    }
  }
}
```

### 6. Data Export/Import
Buat script untuk export data dari SQLite dan import ke Firestore:
```typescript
// scripts/migrate-data.ts
import { db as sqliteDb } from '../lib/database';
import { db as firestoreDb } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function migrateData() {
  // Export users from SQLite
  const users = sqliteDb.getAllSync('SELECT * FROM users');
  
  // Import to Firestore
  for (const user of users) {
    await addDoc(collection(firestoreDb, 'users'), {
      ...user,
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at)
    });
  }
  
  // Repeat for foods and bookings
}
```

### 7. Testing Strategy
- Test authentication flow
- Test CRUD operations for all collections
- Test real-time updates
- Test offline capabilities
- Performance testing with larger datasets

### 8. Deployment Considerations
- Environment-specific Firebase configs
- Backup strategy for Firestore data
- Monitoring and analytics setup
- Error tracking and logging

## Benefits of Firebase Migration
- Real-time data synchronization
- Built-in authentication
- Scalable cloud infrastructure
- Offline support
- Cross-platform compatibility
- Built-in security rules

## Potential Challenges
- Network dependency
- Cost considerations for large datasets
- Learning curve for Firestore queries
- Data structure optimization for NoSQL

## Timeline Estimation
- Setup and configuration: 1-2 days
- Store migration: 3-4 days
- UI updates and testing: 2-3 days
- Data migration: 1 day
- Security rules and testing: 1-2 days

**Total estimated time: 8-12 days**

## Next Steps
1. Create Firebase project
2. Install dependencies
3. Setup development environment
4. Begin with auth store migration
5. Implement data migration scripts
6. Test thoroughly before production deployment