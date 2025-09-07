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