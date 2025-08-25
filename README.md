# Sisa Plus - Food Sharing App

Aplikasi fullstack untuk berbagi makanan berlebih menggunakan Supabase (backend) dan Expo React Native + NativeWind (frontend).

## 🚀 Fitur Utama

- **Autentikasi Google** - Login mudah dengan akun Google
- **Donasi Makanan** - Bagikan makanan berlebih dengan foto dan detail
- **Pencarian & Filter** - Cari makanan berdasarkan kategori dan lokasi
- **Booking System** - Pesan makanan dengan notifikasi real-time
- **Push Notifications** - Notifikasi untuk booking baru dan reminder
- **Real-time Updates** - Sinkronisasi data secara real-time
- **Geolocation** - Temukan makanan terdekat dengan GPS

## 🛠 Tech Stack

### Backend (Supabase)
- **Database**: PostgreSQL dengan RLS (Row Level Security)
- **Authentication**: Supabase Auth dengan Google OAuth
- **Storage**: Supabase Storage untuk foto makanan
- **Edge Functions**: Deno TypeScript untuk business logic
- **Real-time**: Supabase Realtime untuk live updates

### Frontend (Expo React Native)
- **Framework**: Expo SDK 49+
- **Styling**: NativeWind (Tailwind CSS untuk React Native)
- **State Management**: Zustand
- **Navigation**: React Navigation v6
- **Push Notifications**: Expo Notifications
- **Image Handling**: Expo Image Picker
- **Location**: Expo Location

## 📁 Struktur Proyek

```
sisaplus/
├── supabase/
│   ├── functions/
│   │   ├── create-food/
│   │   ├── book-food/
│   │   ├── send-reminder/
│   │   ├── send-push-notification/
│   │   └── _shared/
│   └── migrations/
├── lib/
│   ├── supabase.ts
│   └── database.types.ts
├── store/
│   ├── authStore.ts
│   └── foodStore.ts
├── screens/
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── FoodDetailScreen.tsx
│   ├── AddFoodScreen.tsx
│   └── MyOrdersScreen.tsx
├── components/
├── supabase-schema.sql
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase Account
- Google Cloud Console (untuk OAuth)

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

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npx expo start
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

---

**Sisa Plus** - Mengurangi food waste, berbagi kebaikan! 🍽️💚