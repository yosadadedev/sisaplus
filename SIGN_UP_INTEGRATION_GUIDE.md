# Sign Up Integration dengan Firestore Database

Panduan lengkap tentang bagaimana integrasi sign up bekerja dengan Firestore database di aplikasi SisaPlus.

## 🔄 Alur Sign Up Process

### 1. **User Interface (RegisterScreen.tsx)**

Form registrasi mengumpulkan data berikut:
```typescript
// Data yang dikumpulkan dari form
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [fullName, setFullName] = useState('');
const [whatsapp, setWhatsapp] = useState('+62');
const [address, setAddress] = useState('');
const [status, setStatus] = useState(''); // entrepreneur, student, employee, dll
```

**Status Options yang tersedia:**
- 🏢 Pengusaha (entrepreneur)
- 🎓 Mahasiswa (student) 
- 💼 Pekerja (employee)
- 🏠 Ibu Rumah Tangga (housewife)
- ⏰ Pensiunan (retired)
- 💻 Freelancer (freelancer)
- ➕ Lainnya (others)

### 2. **State Management (authStore.ts)**

Ketika user submit form, dipanggil fungsi `signUp`:
```typescript
const { signUp, loading } = useAuthStore();

// Fungsi signUp menerima parameter:
signUp: (
  email: string,
  password: string, 
  fullName: string,
  phone?: string,
  address?: string
) => Promise<{ success: boolean; error?: string; data?: any }>
```

### 3. **Authentication Layer (firebaseAuth.ts)**

Data dikirim ke `firebaseAuth.register()` dengan struktur:
```typescript
const registerData: RegisterData = {
  email,
  password,
  name: fullName,
  phone,
};

const result = await firebaseAuth.register(registerData);
```

### 4. **Database Layer (firebaseService.ts)**

Setelah Firebase Auth berhasil, data user disimpan ke Firestore:
```typescript
// userService.createUser() dipanggil untuk membuat dokumen user
async createUser(
  userData: Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
    ...userData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}
```

## 🗄️ Struktur Data di Firestore

### **Collection: `users`**

Setiap dokumen user memiliki struktur:
```typescript
interface FirebaseUser {
  id: string;                    // Auto-generated document ID
  uid: string;                   // Firebase Auth UID
  email: string;                 // Email user
  name: string;                  // Nama lengkap
  phone?: string;                // Nomor WhatsApp
  address?: string;              // Alamat lengkap
  status?: string;               // Status pekerjaan
  profilePicture?: string;       // URL foto profil
  createdAt: Timestamp;          // Waktu pembuatan
  updatedAt: Timestamp;          // Waktu update terakhir
}
```

### **Contoh Dokumen User di Firestore:**
```json
{
  "uid": "abc123xyz789",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phone": "+6281234567890",
  "address": "Jl. Merdeka No. 123, Jakarta",
  "status": "student",
  "profilePicture": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## 🔄 Step-by-Step Integration Flow

### **Step 1: Form Submission**
```typescript
// RegisterScreen.tsx
const handleSignUp = async () => {
  const result = await signUp(
    email,
    password,
    fullName,
    whatsapp,
    address
  );
  
  if (result.success) {
    // Redirect ke home atau show success
  } else {
    // Show error message
  }
};
```

### **Step 2: Auth Store Processing**
```typescript
// authStore.ts
signUp: async (email, password, fullName, phone, address) => {
  set({ loading: true });
  
  try {
    // 1. Register dengan Firebase Auth
    const result = await firebaseAuth.register({
      email, password, name: fullName, phone
    });
    
    if (result.success && result.user) {
      // 2. Update data tambahan (address)
      if (address) {
        await userService.updateUser(result.user.uid, { address });
      }
      
      // 3. Get updated user data
      const userData = await firebaseAuth.getUserData(result.user.uid);
      
      // 4. Convert dan simpan ke local state
      const localUser = convertFirebaseUserToLocal(result.user, userData);
      set({ user: localUser, firebaseUser: result.user });
      
      // 5. Simpan ke AsyncStorage
      await AsyncStorage.setItem('currentUser', JSON.stringify(localUser));
      
      return { success: true, data: localUser };
    }
  } catch (error) {
    return { success: false, error: 'Registration failed' };
  } finally {
    set({ loading: false });
  }
}
```

### **Step 3: Firebase Auth Registration**
```typescript
// firebaseAuth.ts
register: async (data: RegisterData) => {
  try {
    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, data.email, data.password
    );
    
    // 2. Create Firestore user document
    await userService.createUser({
      uid: userCredential.user.uid,
      email: data.email,
      name: data.name,
      phone: data.phone
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### **Step 4: Firestore Document Creation**
```typescript
// firebaseService.ts
createUser: async (userData) => {
  const now = Timestamp.now();
  
  // Tambahkan timestamp dan simpan ke collection 'users'
  const docRef = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: now,
    updatedAt: now,
  });
  
  return docRef.id; // Return document ID
}
```

## 🔐 Security Rules

Firestore rules untuk collection users:
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // User dapat read/write data mereka sendiri
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.uid;
      
      // Allow create untuk user baru
      allow create: if request.auth != null && 
                   request.auth.uid == request.resource.data.uid;
    }
  }
}
```

## 🔄 Real-time Updates

Setelah user terdaftar, data dapat diupdate real-time:
```typescript
// Update profile user
const updateProfile = async (updates: Partial<User>) => {
  if (user?.id) {
    await userService.updateUser(user.id, updates);
    // State akan terupdate otomatis
  }
};
```

## 🧪 Testing Integration

### **1. Test Manual di Aplikasi:**
```bash
# Jalankan aplikasi
npm start

# Buka di simulator/device
# Navigate ke Register Screen
# Isi form dan submit
```

### **2. Verifikasi di Firebase Console:**
1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project `sisaplus-d70b7`
3. Go to **Authentication** → **Users** (cek user baru)
4. Go to **Firestore Database** → **users collection** (cek dokumen user)

### **3. Test dengan Emulator:**
```bash
# Start Firebase emulators
firebase emulators:start

# Aplikasi akan connect ke local emulator
# Data tersimpan di emulator, bukan production
```

## 🐛 Troubleshooting

### **Error: "User document not found"**
```typescript
// Pastikan createUser dipanggil setelah Firebase Auth
if (result.success && result.user) {
  await userService.createUser({
    uid: result.user.uid,
    email: data.email,
    name: data.name,
    phone: data.phone
  });
}
```

### **Error: "The query requires an index"**
```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Atau buat index manual di Firebase Console
# Link akan muncul di error message
```

**Solusi:**
- Index sudah dikonfigurasi di `firestore.indexes.json`
- Index untuk collection `foods` dengan field `isAvailable` dan `createdAt`
- Index untuk collection `foods` dengan field `sellerId` dan `createdAt` - untuk query "my donations"
- Deploy otomatis saat `firebase deploy`

### **Error: "User not found" saat Create Food** ✅ **FIXED**

**Masalah:** Saat membuat food baru, muncul error "User not found" meskipun user sudah login.

**Penyebab:** Mismatch antara Firebase Auth UID dan Firestore document ID:
- `authStore.ts` menggunakan `firebaseUser.uid` sebagai `user.id`
- `userService.createUser` sebelumnya menggunakan `addDoc` yang menghasilkan auto-generated ID
- Saat `createFood` mencari user dengan `donor_id` (Firebase Auth UID), dokumen tidak ditemukan

**Solusi yang Diterapkan:**
1. **Update `userService.createUser`:**
   - Menambahkan parameter `userId` opsional
   - Menggunakan `setDoc` dengan Firebase Auth UID sebagai document ID
   - Fallback ke `addDoc` jika `userId` tidak disediakan

2. **Update `firebaseAuth.register`:**
   - Memanggil `userService.createUser` dengan `user.uid` sebagai parameter kedua
   - Memastikan document ID di Firestore sama dengan Firebase Auth UID

3. **Hasil:**
   - User document di Firestore menggunakan Firebase Auth UID sebagai document ID
   - `getUserById(donor_id)` dapat menemukan user dengan benar
   - Create food berfungsi normal

### **Error: "Permission denied"**
- Cek Firestore rules
- Pastikan user sudah authenticated
- Verifikasi UID match dengan document

### **Warning: AsyncStorage persistence**
```
@firebase/auth: Auth (12.2.0): You are initializing Firebase Auth 
for React Native without providing AsyncStorage.
```

**Penjelasan:**
- Warning ini muncul di development mode
- Auth state tetap berfungsi normal
- Di production build, persistence otomatis aktif
- Tidak mempengaruhi fungsi sign up/login

**Solusi (opsional):**
```typescript
// Untuk menghilangkan warning, gunakan initializeAuth
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

### **Error: "Network error"**
- Cek koneksi internet
- Verifikasi Firebase config
- Cek Firebase project status

## 📊 Monitoring & Analytics

### **Firebase Analytics Events:**
```typescript
// Track successful registration
analytics().logEvent('sign_up', {
  method: 'email',
  user_type: status // entrepreneur, student, etc
});
```

### **Error Tracking:**
```typescript
// Log registration errors
console.error('Registration failed:', error);
crashlytics().recordError(error);
```

## 🚀 Best Practices

1. **Validasi Input:**
   - Email format validation
   - Password strength check
   - Phone number format

2. **Error Handling:**
   - User-friendly error messages
   - Retry mechanism untuk network errors
   - Fallback untuk offline scenarios

3. **Security:**
   - Jangan simpan password di Firestore
   - Gunakan Firebase Auth untuk authentication
   - Implement proper Firestore rules

4. **Performance:**
   - Batch writes untuk multiple operations
   - Use indexes untuk queries
   - Implement pagination untuk large datasets

5. **User Experience:**
   - Loading states
   - Success/error feedback
   - Smooth navigation flow

Dengan implementasi ini, sign up process terintegrasi penuh dengan Firestore database dan menyediakan foundation yang solid untuk aplikasi SisaPlus! 🎯