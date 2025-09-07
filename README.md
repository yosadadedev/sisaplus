# 🍽️ Sisa Plus - Food Sharing App

**Sisa Plus** adalah aplikasi mobile berbasis React Native yang memungkinkan pengguna untuk berbagi makanan berlebih dengan komunitas sekitar. Aplikasi ini dikembangkan dengan bantuan **IBM Granite AI** untuk menciptakan solusi inovatif dalam mengurangi food waste dan membantu sesama.

## 👨‍💻 Developer Information

**Developer**: Yosada Dede Aressa  
**Email**: masyosad@gmail.com  
**LinkedIn**: [www.linkedin.com/in/yosadade](https://www.linkedin.com/in/yosadade)  
**AI Assistant**: IBM Granite  

## 📱 Tentang Aplikasi

**Sisa Plus** adalah platform food sharing yang menghubungkan donatur makanan dengan penerima di sekitar lokasi mereka. Aplikasi ini bertujuan untuk:

- 🌱 **Mengurangi Food Waste**: Membantu mengurangi pemborosan makanan dengan mendistribusikan makanan berlebih
- 🤝 **Membangun Komunitas**: Menciptakan jaringan saling membantu antar tetangga
- 📍 **Berbasis Lokasi**: Menggunakan GPS untuk menemukan makanan terdekat
- 🔔 **Real-time**: Notifikasi instant untuk update booking dan makanan baru

## 🎯 Target Pengguna

- **Rumah Tangga**: Yang memiliki makanan berlebih dari acara atau masakan harian
- **Restoran/Cafe**: Yang ingin mendonasikan makanan yang masih layak konsumsi
- **Mahasiswa**: Yang membutuhkan akses makanan dengan budget terbatas
- **Komunitas**: Yang peduli dengan isu food waste dan sustainability

## 🎬 Demo & Screenshots

### 📸 Preview Aplikasi

```
🏠 Home Screen          📝 Add Food Screen       📋 Food Detail Screen
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  🍽️ Sisa Plus   │    │  📷 Upload Foto  │    │  🍕 Pizza Sisa   │
│                 │    │                 │    │                 │
│ 🔍 [Search...]  │    │ 📝 Judul:       │    │ 👤 Donatur: John │
│                 │    │ [Pizza Sisa]    │    │ 📍 500m dari Anda│
│ 📍 Makanan Dekat│    │                 │    │                 │
│                 │    │ 📝 Deskripsi:   │    │ ⏰ Expired: 2 jam│
│ 🍕 Pizza Sisa   │    │ [Pizza dari...] │    │                 │
│ 👤 John - 500m  │    │                 │    │ [📞 Book Sekarang]│
│ ⏰ 2 jam lagi   │    │ 📍 Lokasi:      │    │                 │
│                 │    │ [Current GPS]   │    │ ⭐⭐⭐⭐⭐ (4.8) │
│ 🥗 Salad Segar  │    │                 │    │                 │
│ 👤 Sarah - 1km  │    │ [✅ Post Food]   │    │ 💬 "Masih hangat"│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🎥 Demo Flow

1. **Onboarding & Login**
   - Welcome screen dengan penjelasan konsep food sharing
   - Login dengan Google OAuth untuk kemudahan akses
   - Setup profil dan preferensi lokasi

2. **Browse Makanan**
   - Lihat daftar makanan tersedia di sekitar lokasi
   - Filter berdasarkan kategori (makanan berat, snack, minuman)
   - Sorting berdasarkan jarak dan waktu posting

3. **Detail & Booking**
   - Lihat foto, deskripsi, dan informasi donatur
   - Chat dengan donatur untuk koordinasi pickup
   - Booking makanan dengan konfirmasi waktu pengambilan

4. **Donasi Makanan**
   - Upload foto makanan dengan kamera atau galeri
   - Isi detail makanan (nama, deskripsi, expired time)
   - Set lokasi pickup dan availability

5. **Tracking & Notifikasi**
   - Notifikasi real-time untuk booking baru
   - Reminder sebelum makanan expired
   - History donasi dan booking

Aplikasi fullstack untuk berbagi makanan berlebih menggunakan Firebase (backend) dan Expo React Native + NativeWind (frontend).

## 🚀 Fitur Utama

### 🔐 Autentikasi & Keamanan
- **Firebase Authentication** - Login aman dengan Google OAuth
- **Session Management** - Auto-login dan session persistence
- **User Profiles** - Profil lengkap dengan foto dan rating

### 🍽️ Manajemen Makanan
- **Upload Makanan** - Foto, deskripsi, kategori, dan expired time
- **Real-time Listing** - Daftar makanan update secara real-time
- **Kategori Makanan** - Makanan berat, snack, minuman, dessert
- **Status Tracking** - Available, booked, completed, expired

### 📍 Fitur Lokasi
- **GPS Integration** - Deteksi lokasi otomatis
- **Proximity Search** - Cari makanan dalam radius tertentu
- **Distance Calculation** - Tampilkan jarak ke lokasi pickup
- **Map Integration** - Lihat lokasi di peta

### 📱 Booking & Komunikasi
- **Instant Booking** - Book makanan dengan satu tap
- **Chat System** - Komunikasi langsung dengan donatur
- **Booking History** - Riwayat donasi dan booking
- **Rating System** - Review dan rating untuk user

### 🔔 Notifikasi
- **Push Notifications** - FCM untuk notifikasi real-time
- **Booking Alerts** - Notifikasi booking baru untuk donatur
- **Reminder System** - Pengingat sebelum makanan expired
- **Status Updates** - Update status booking secara real-time

### 🎨 User Experience
- **Modern UI/UX** - Design modern dengan NativeWind
- **Responsive Design** - Optimal di berbagai ukuran layar
- **Smooth Animations** - Transisi halus antar screen

## 🛠 Tech Stack

### Backend (Firebase)
- **Database**: Cloud Firestore dengan security rules
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage untuk foto makanan
- **Cloud Functions**: Node.js untuk business logic
- **Push Notifications**: Firebase Cloud Messaging (FCM) (cooming soon!,)
- **Analytics**: Firebase Analytics untuk tracking

### Frontend (Expo React Native)
- **Framework**: Expo SDK 51+ dengan Expo Router
- **Styling**: NativeWind (Tailwind CSS untuk React Native)
- **State Management**: Zustand untuk global state
- **Navigation**: React Navigation v6
- **Notifications**: @react-native-firebase/messaging
- **Image Handling**: Expo Image Picker & Image Manipulator
- **Location**: Expo Location dengan Maps integration
- **Camera**: Expo Camera untuk foto real-time

### Development Tools
- **TypeScript**: Type safety dan better DX
- **ESLint & Prettier**: Code formatting dan linting
- **Expo Dev Tools**: Hot reload dan debugging
- **Firebase Emulator**: Local development environment

## 📁 Struktur Proyek

```
sisaplus/
├── config/
│   └── firebase.ts              # Firebase configuration
├── components/
│   ├── ConfirmationModal.tsx    # Reusable modal components
│   ├── ErrorModal.tsx
│   ├── Logo.tsx
│   └── PhoneInput.tsx
├── screens/
│   ├── OnboardingScreen.tsx     # Welcome & intro screens
│   ├── LoginScreen.tsx          # Authentication
│   ├── RegisterScreen.tsx
│   ├── HomeScreen.tsx           # Main food listing
│   ├── FoodDetailScreen.tsx     # Food detail & booking
│   ├── AddFoodScreen.tsx        # Upload new food
│   ├── MyOrdersScreen.tsx       # Booking history
│   ├── ProfileScreen.tsx        # User profile
│   └── EditProfileScreen.tsx
├── store/
│   ├── authStore.ts             # Authentication state
│   └── foodStore.ts             # Food data state
├── services/
│   ├── firebaseAuth.ts          # Auth service layer
│   ├── firebaseService.ts       # Database operations
│   └── imageService.ts          # Image upload handling
├── types/
│   ├── firebase.ts              # Firebase type definitions
│   └── navigation.ts            # Navigation types
├── lib/
│   └── database.ts              # Database schema types
├── assets/                      # Images, icons, fonts
├── .env                         # Environment variables
├── app.json                     # Expo configuration
├── firebase.json                # Firebase project config
├── package.json
└── README.md
```

## 🤖 IBM Granite AI Contribution

Aplikasi **Sisa Plus** dikembangkan dengan bantuan **IBM Granite AI** yang memberikan kontribusi signifikan dalam:

### 🧠 AI-Powered Development
- **Code Generation**: Granite AI membantu generate boilerplate code dan komponen React Native
- **Architecture Design**: Saran arsitektur aplikasi yang scalable dan maintainable
- **Best Practices**: Implementasi best practices untuk React Native dan Firebase
- **Problem Solving**: Debugging dan troubleshooting issues kompleks

### 📝 Documentation & Planning
- **Technical Documentation**: Pembuatan dokumentasi teknis yang komprehensif
- **Feature Planning**: Perencanaan fitur dan user flow yang optimal
- **Code Comments**: Komentar kode yang informatif dan mudah dipahami
- **Testing Strategy**: Strategi testing yang efektif

### 🔧 Technical Implementation
- **Firebase Integration**: Setup dan konfigurasi Firebase services
- **State Management**: Implementasi Zustand untuk state management
- **UI/UX Components**: Desain komponen yang reusable dan responsive
- **Performance Optimization**: Optimasi performa aplikasi

## 🚀 Roadmap Pengembangan

### Phase 1: Core Features ✅
- [x] Authentication dengan Firebase
- [x] CRUD operations untuk food items
- [x] Basic booking system
- [x] Push notifications
- [x] Location-based search

### Phase 2: Enhanced Features 🚧
- [ ] Chat system antar user
- [ ] Rating dan review system
- [ ] Advanced filtering dan sorting
- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Push Notifikasi

### Phase 3: Advanced Features 📋
- [ ] AI-powered food categorization
- [ ] Predictive analytics untuk food waste
- [ ] Integration dengan delivery services
- [ ] Community challenges dan gamification
- [ ] Admin dashboard untuk monitoring

### Phase 4: Scale & Monetization 💰
- [ ] Business partnerships
- [ ] Premium features
- [ ] Analytics dashboard
- [ ] Multi-city expansion
- [ ] API untuk third-party integration

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 atau lebih baru) - [Download](https://nodejs.org/)
- **npm** atau **yarn** - Package manager
- **Expo CLI** - React Native development platform
- **Android Studio** / **Xcode** - Untuk testing di emulator
- **Firebase Account** - Untuk backend services
- **Expo Go App** - Untuk testing di device fisik
- **Google Cloud Console** - Untuk OAuth configuration

### 📱 Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/sisaplus.git
cd sisaplus
```

#### 2. Install Dependencies
```bash
# Menggunakan npm
npm install

# Atau menggunakan yarn
yarn install

# Install Expo CLI globally (jika belum)
npm install -g @expo/cli
```

#### 3. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login ke Firebase
firebase login

# Initialize Firebase project (opsional)
firebase init
```

#### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env dengan konfigurasi Firebase Anda
# FIREBASE_API_KEY=your_api_key
# FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# FIREBASE_PROJECT_ID=your_project_id
# FIREBASE_STORAGE_BUCKET=your_project.appspot.com
# FIREBASE_MESSAGING_SENDER_ID=your_sender_id
# FIREBASE_APP_ID=your_app_id
```

#### 5. Start Development Server
```bash
# Start Expo development server
npx expo start

# Atau dengan cache clearing
npx expo start --clear

# Untuk web development
npx expo start --web
```

#### 6. Testing Options

**📱 Physical Device:**
- Install **Expo Go** dari App Store/Play Store
- Scan QR code dari terminal

**💻 Emulator:**
```bash
# Android Emulator
npx expo start --android

# iOS Simulator (Mac only)
npx expo start --ios

# Web Browser
npx expo start --web
```

### 🔧 Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check

# Clear cache
npm run clear-cache
```

### 1. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL schema:
   ```sql
   -- Copy dan paste isi dari supabase-schema.sql
   ```
3. Setup Google OAuth di Authentication > Providers
4. Deploy Edge Functions:
   ```bash
   supabase functions deploy create-food
   supabase functions deploy book-food
   supabase functions deploy send-reminder
   supabase functions deploy send-push-notification
   ```

### 2. Setup Environment

1. Copy `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```

2. Isi environment variables:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   EXPO_PUBLIC_EXPO_PROJECT_ID=your_expo_project_id
   ```

## 📊 Database Schema

### Tables

#### `profiles`
- User profile information
- Linked to Supabase Auth
- Stores name, avatar, phone, location

#### `foods`
- Food donation listings
- Includes title, description, category, quantity
- Geolocation data for proximity search
- Status tracking (available, booked, completed, expired)

#### `bookings`
- Food booking requests
- Links users to food items
- Status workflow (pending → confirmed → completed)
- Optional message from receiver

#### `notifications`
- Push notification history
- Tracks delivery status
- Links to related food/booking

#### `reviews`
- User rating system
- Feedback for completed transactions

### Indexes

```sql
-- Performance optimization
CREATE INDEX idx_foods_donor_id ON foods(donor_id);
CREATE INDEX idx_foods_status ON foods(status);
CREATE INDEX idx_foods_expired_at ON foods(expired_at);
CREATE INDEX idx_foods_location ON foods USING GIST(ll_to_earth(latitude, longitude));
CREATE INDEX idx_bookings_receiver_id ON bookings(receiver_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

## 🔐 Security (RLS Policies)

### Row Level Security

Semua tabel menggunakan RLS untuk keamanan data:

- **profiles**: User hanya bisa akses/edit profil sendiri
- **foods**: Public read, owner dapat edit/delete
- **bookings**: User bisa lihat booking sendiri, donor bisa lihat booking untuk food mereka
- **notifications**: User hanya bisa akses notifikasi sendiri

### API Security

- Semua Edge Functions menggunakan JWT verification
- Rate limiting pada endpoint sensitif
- Input validation dan sanitization

## 📱 Best Practices

### Performance Optimization

#### 1. Database
- **Pagination**: Implementasi cursor-based pagination
  ```typescript
  const { data } = await supabase
    .from('foods')
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 19) // Load 20 items
  ```

- **Indexing**: Gunakan index untuk query yang sering digunakan
- **Connection Pooling**: Supabase otomatis handle connection pooling

#### 2. Frontend
- **Image Optimization**: Compress gambar sebelum upload
  ```typescript
  const options = {
    quality: 0.8,
    allowsEditing: true,
    aspect: [4, 3]
  }
  ```

- **Lazy Loading**: Load data sesuai kebutuhan
- **Caching**: Gunakan Zustand persist untuk cache data

#### 3. Real-time Subscriptions
- **Selective Subscriptions**: Hanya subscribe channel yang diperlukan
  ```typescript
  // Subscribe hanya untuk foods yang available
  const subscription = supabase
    .channel('foods')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'foods',
      filter: 'status=eq.available'
    }, handleFoodUpdate)
    .subscribe()
  ```

### Scalability Strategies

#### 1. Database Scaling
- **Read Replicas**: Untuk read-heavy operations
- **Partitioning**: Partition tabel berdasarkan tanggal
- **Archiving**: Archive data lama secara berkala

#### 2. Caching Strategy
- **Redis**: Cache untuk data yang sering diakses
- **CDN**: Untuk static assets dan images
- **Application Cache**: Cache di level aplikasi

#### 3. Monitoring
- **Supabase Dashboard**: Monitor database performance
- **Expo Analytics**: Track app usage dan crashes
- **Custom Metrics**: Track business metrics

## 🔔 Push Notifications

### Setup

1. **Expo Push Notifications**:
   ```typescript
   import * as Notifications from 'expo-notifications'
   
   // Request permissions
   const { status } = await Notifications.requestPermissionsAsync()
   
   // Get push token
   const token = await Notifications.getExpoPushTokenAsync({
     projectId: process.env.EXPO_PUBLIC_EXPO_PROJECT_ID
   })
   ```

2. **Server-side Sending**:
   ```typescript
   // Edge Function: send-push-notification
   const response = await fetch('https://exp.host/--/api/v2/push/send', {
     method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json'
     },
     body: JSON.stringify(messages)
   })
   ```

### Notification Types

- **New Food Available**: Notifikasi untuk user di sekitar lokasi
- **Booking Request**: Notifikasi untuk donor saat ada booking baru
- **Booking Confirmed**: Notifikasi untuk receiver saat booking dikonfirmasi
- **Pickup Reminder**: Reminder sebelum makanan expired

## 🚀 Deployment

### Supabase Production

1. **Database**:
   - Upgrade ke plan berbayar untuk production
   - Setup backup schedule
   - Configure connection limits

2. **Edge Functions**:
   ```bash
   # Deploy ke production
   supabase functions deploy --project-ref your-project-ref
   ```

3. **Environment Variables**:
   ```bash
   # Set secrets untuk Edge Functions
   supabase secrets set EXPO_ACCESS_TOKEN=your_token
   ```

### Expo Production

1. **Build Configuration**:
   ```json
   // app.json
   {
     "expo": {
       "name": "Sisa Plus",
       "slug": "sisa-plus",
       "version": "1.0.0",
       "platforms": ["ios", "android"],
       "extra": {
         "eas": {
           "projectId": "your-project-id"
         }
       }
     }
   }
   ```

2. **EAS Build**:
   ```bash
   # Install EAS CLI
   npm install -g @expo/eas-cli
   
   # Configure build
   eas build:configure
   
   # Build for production
   eas build --platform all
   ```

3. **App Store Deployment**:
   ```bash
   # Submit to stores
   eas submit --platform all
   ```

## 🧪 Testing

### Unit Testing
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

### E2E Testing
```bash
# Install Detox
npm install --save-dev detox

# Run E2E tests
detox test
```

## 📈 Monitoring & Analytics

### Performance Monitoring
- **Expo Analytics**: Built-in crash reporting
- **Supabase Metrics**: Database performance
- **Custom Events**: Business metrics tracking

### Error Tracking
```typescript
// Sentry integration
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: 'your-sentry-dsn'
})
```

## 🔧 Troubleshooting

### Common Issues

1. **Supabase Connection**:
   - Periksa environment variables
   - Pastikan RLS policies benar
   - Check network connectivity

2. **Push Notifications**:
   - Verify Expo project ID
   - Check notification permissions
   - Test dengan Expo push tool

3. **Google OAuth**:
   - Pastikan client ID benar
   - Check redirect URLs
   - Verify OAuth consent screen

### Debug Mode
```typescript
// Enable debug logging
if (__DEV__) {
  console.log('Debug mode enabled')
}
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

Untuk pertanyaan dan dukungan:
- Email: support@sisaplus.app
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)

## 📊 Database Schema

Aplikasi menggunakan Firebase Firestore dengan struktur berikut:

### Collections

#### `users`
```typescript
{
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  fcmToken?: string;        // For push notifications
  notificationSettings: {
    orderUpdates: boolean;
    newFoodAlerts: boolean;
    reminders: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `foods`
```typescript
{
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'makanan-berat' | 'snack' | 'minuman' | 'buah' | 'sayuran' | 'roti' | 'lainnya';
  quantity: number;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  pickupTime: {
    start: Timestamp;
    end: Timestamp;
  };
  userId: string;           // Reference to users collection
  status: 'available' | 'booked' | 'completed' | 'expired';
  tags?: string[];          // Additional categorization
  allergens?: string[];     // Allergy information
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `bookings`
```typescript
{
  id: string;
  foodId: string;           // Reference to foods collection
  userId: string;           // Reference to users collection (booker)
  ownerId: string;          // Reference to users collection (food owner)
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pickupTime: Timestamp;
  notes?: string;
  rating?: number;          // 1-5 stars
  review?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `notifications`
```typescript
{
  id: string;
  userId: string;           // Recipient
  title: string;
  body: string;
  type: 'booking' | 'reminder' | 'update' | 'general';
  data?: any;               // Additional payload
  read: boolean;
  createdAt: Timestamp;
}
```

### Security Rules

Firestore security rules memastikan:
- ✅ Users hanya bisa mengakses data mereka sendiri
- ✅ Food items bisa dibaca semua user, tapi hanya bisa diubah oleh owner
- ✅ Bookings hanya bisa diakses oleh food owner dan booker
- ✅ Notifications hanya bisa diakses oleh penerima
- ✅ Validasi data type dan required fields

## 🤝 Contributing

Kami menyambut kontribusi dari komunitas! Untuk berkontribusi:

### 📋 Guidelines
1. **Fork** repository ini
2. **Clone** fork ke local machine
3. **Create** feature branch (`git checkout -b feature/amazing-feature`)
4. **Follow** coding standards dan conventions
5. **Write** tests untuk fitur baru
6. **Commit** dengan pesan yang jelas (`git commit -m 'feat: add amazing feature'`)
7. **Push** ke branch (`git push origin feature/amazing-feature`)
8. **Open** Pull Request dengan deskripsi lengkap

### 🎯 Areas for Contribution
- 🐛 **Bug Fixes**: Report dan fix bugs
- ✨ **New Features**: Implementasi fitur baru
- 📚 **Documentation**: Improve dokumentasi
- 🎨 **UI/UX**: Design improvements
- 🧪 **Testing**: Tambah test coverage
- 🌐 **Localization**: Multi-language support
- ♿ **Accessibility**: Improve accessibility

### 📝 Commit Convention
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 📄 License

Project ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detail lengkap.

```
MIT License

Copyright (c) 2024 Yosada Dede Aressa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

## 👨‍💻 Developer

<div align="center">

### **Yosada Dede Aressa**

*Full Stack Developer & Mobile App Enthusiast*

[![Email](https://img.shields.io/badge/Email-masyosad%40gmail.com-red?style=for-the-badge&logo=gmail&logoColor=white)](mailto:masyosad@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Yosada%20Dede-blue?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yosadade)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yosadade)

</div>

### 🎯 About the Developer

**Yosada Dede Aressa** adalah seorang passionate developer yang fokus pada pengembangan aplikasi mobile dan web yang memberikan dampak positif bagi masyarakat. Dengan pengalaman dalam React Native, Firebase, dan modern web technologies, Yosada berkomitmen untuk menciptakan solusi teknologi yang sustainable dan user-friendly.

**Specializations:**
- 📱 React Native & Expo Development
- 🔥 Firebase & Backend Services
- ⚛️ React.js & Next.js
- 🎨 UI/UX Design Implementation
- 🤖 AI-Assisted Development

## 📞 Contact & Support

### 💬 Get in Touch

Punya pertanyaan, saran, atau ingin berkolaborasi? Jangan ragu untuk menghubungi:

- **📧 Email**: [masyosad@gmail.com](mailto:masyosad@gmail.com)
- **💼 LinkedIn**: [linkedin.com/in/yosadade](https://www.linkedin.com/in/yosadade)
- **🐙 GitHub**: [@yosadade](https://github.com/yosadade)

### 🆘 Support

Jika mengalami issues atau butuh bantuan:
1. **Check** [Issues](https://github.com/yourusername/sisaplus/issues) yang sudah ada
2. **Create** new issue dengan template yang sesuai
3. **Join** diskusi di [Discussions](https://github.com/yourusername/sisaplus/discussions)
4. **Email** langsung untuk urgent matters

### 🌟 Show Your Support

Jika project ini bermanfaat, berikan ⭐ di GitHub dan share ke teman-teman!

---

<div align="center">

### **Sisa Plus** 🌱

*Mengurangi food waste, satu makanan pada satu waktu!*

**"Technology for Sustainability, Innovation for Impact"**

---

*Built with ❤️ by [Yosada Dede Aressa](https://linkedin.com/in/yosadade) | Powered by 🤖 IBM Granite AI*

</div>