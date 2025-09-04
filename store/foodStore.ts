import { create } from 'zustand';
import { db, initializeDatabase, generateId, getCurrentTimestamp, Food, Booking, BookingWithFood, Donor } from '../lib/database';

// Dummy donors
const DUMMY_DONORS: Donor[] = [
  {
    id: 'donor1',
    email: 'donor1@example.com',
    full_name: 'Warung Bu Sari',
    name: 'Warung Bu Sari',
    phone: '+62812345678',
    address: 'Jl. Malioboro No. 123, Yogyakarta',
    rating: 4.8,
    total_donations: 45,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'donor2',
    email: 'donor2@example.com',
    full_name: 'Soto Lamongan Pak Hadi',
    name: 'Soto Lamongan Pak Hadi',
    phone: '+62823456789',
    address: 'Jl. Sudirman No. 456, Jakarta Pusat',
    rating: 4.5,
    total_donations: 23,
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-15T08:30:00Z'
  },
  {
    id: 'donor3',
    email: 'donor3@example.com',
    full_name: 'Gado-gado Ibu Tini',
    name: 'Gado-gado Ibu Tini',
    phone: '+62834567890',
    address: 'Jl. Thamrin No. 789, Jakarta Pusat',
    rating: 4.7,
    total_donations: 67,
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-15T09:15:00Z'
  },
  {
    id: 'donor4',
    email: 'donor4@example.com',
    full_name: 'Rumah Makan Padang Sederhana',
    name: 'Rumah Makan Padang Sederhana',
    phone: '+62845678901',
    address: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
    rating: 4.9,
    total_donations: 89,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-15T16:00:00Z'
  },
  {
    id: 'donor5',
    email: 'donor5@example.com',
    full_name: 'Bakso Malang Pak Bambang',
    name: 'Bakso Malang Pak Bambang',
    phone: '+62856789012',
    address: 'Jl. Diponegoro No. 202, Malang',
    rating: 4.6,
    total_donations: 34,
    created_at: '2024-01-13T00:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'donor6',
    email: 'donor6@example.com',
    full_name: 'Healthy Corner Cafe',
    name: 'Healthy Corner Cafe',
    phone: '+62867890123',
    address: 'Jl. Kemang Raya No. 88, Jakarta Selatan',
    rating: 4.4,
    total_donations: 28,
    created_at: '2024-01-14T00:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  },
  {
    id: 'donor7',
    email: 'donor7@example.com',
    full_name: 'Roti Bakar Abang Joko',
    name: 'Roti Bakar Abang Joko',
    phone: '+62878901234',
    address: 'Jl. Cikini Raya No. 12, Jakarta Pusat',
    rating: 4.3,
    total_donations: 15,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T13:00:00Z'
  },
  {
    id: 'donor8',
    email: 'donor8@example.com',
    full_name: 'Juice Bar Segar',
    name: 'Juice Bar Segar',
    phone: '+62889012345',
    address: 'Jl. Senopati No. 67, Jakarta Selatan',
    rating: 4.7,
    total_donations: 52,
    created_at: '2024-01-11T00:00:00Z',
    updated_at: '2024-01-15T12:00:00Z'
  },
  {
    id: 'donor9',
    email: 'donor9@example.com',
    full_name: 'Mie Ayam Pak Udin',
    name: 'Mie Ayam Pak Udin',
    phone: '+62890123456',
    address: 'Jl. Mangga Besar No. 234, Jakarta Barat',
    rating: 4.5,
    total_donations: 41,
    created_at: '2024-01-09T00:00:00Z',
    updated_at: '2024-01-15T14:00:00Z'
  },
  {
    id: 'donor10',
    email: 'donor10@example.com',
    full_name: 'Warung Sayur Bu Ningsih',
    name: 'Warung Sayur Bu Ningsih',
    phone: '+62801234567',
    address: 'Jl. Kebon Sirih No. 156, Jakarta Pusat',
    rating: 4.6,
    total_donations: 19,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T15:30:00Z'
  }
];

// Dummy data
const DUMMY_FOODS: Food[] = [
  {
    id: '1',
    title: 'Nasi Gudeg Yogya',
    description: 'Gudeg khas Yogyakarta dengan ayam dan telur, masih hangat dan segar. Dimasak dengan santan kelapa muda dan gula jawa asli.',
    unit: 'porsi',
    pickup_address: 'Jl. Malioboro No. 123, Yogyakarta',
    pickup_time_start: '2024-01-15T18:00:00.000Z',
    pickup_time_end: '2024-01-15T20:00:00.000Z',
    dietary_info: 'Halal, tidak pedas, mengandung santan',
    allergen_info: 'Mengandung telur, santan kelapa',
    preparation_notes: 'Disajikan dengan nasi putih hangat, sambal krecek, dan kerupuk',
    price_type: 'free',
    price: null,
    is_featured: true,
    view_count: 45,
    donor_id: 'donor1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    expired_at: '2024-01-16T20:00:00Z',
    quantity: 8,
    category: 'makanan-berat',
    location: 'Jl. Malioboro No. 123, Yogyakarta',
    distance_km: 2.5,
    status: 'available',
    profiles: {
      full_name: 'Warung Bu Sari',
      avatar_url: undefined
    }
  },
  {
    id: '2',
    title: 'Soto Ayam Lamongan',
    description: 'Soto ayam dengan kuah bening yang segar, dilengkapi dengan telur rebus, kerupuk, dan sambal. Kuah dibuat dari kaldu ayam kampung asli.',
    unit: 'mangkok',
    pickup_address: 'Jl. Sudirman No. 456, Jakarta Pusat',
    pickup_time_start: '2024-01-15T11:00:00.000Z',
    pickup_time_end: '2024-01-15T13:00:00.000Z',
    dietary_info: 'Halal, sedikit pedas, bebas MSG',
    allergen_info: 'Mengandung telur dan gluten (mie)',
    preparation_notes: 'Kuah masih panas, siap santap. Sambal dan kerupuk terpisah.',
    price_type: 'free',
    price: null,
    is_featured: false,
    view_count: 23,
    donor_id: 'donor2',
    created_at: '2024-01-15T08:30:00Z',
    updated_at: '2024-01-15T08:30:00Z',
    expired_at: '2024-01-16T13:00:00Z',
    quantity: 12,
    category: 'makanan-berat',
    location: 'Jl. Sudirman No. 456, Jakarta Pusat',
    distance_km: 1.8,
    status: 'available',
    profiles: {
      full_name: 'Soto Lamongan Pak Hadi',
      avatar_url: undefined
    }
  },
  {
    id: '3',
    title: 'Gado-gado Jakarta',
    description: 'Gado-gado dengan sayuran segar (kangkung, tauge, timun, tahu, tempe) dan bumbu kacang yang gurih. Sayuran dipetik pagi hari.',
    unit: 'porsi',
    pickup_address: 'Jl. Thamrin No. 789, Jakarta Pusat',
    pickup_time_start: '2024-01-15T12:00:00.000Z',
    pickup_time_end: '2024-01-15T14:00:00.000Z',
    dietary_info: 'Vegetarian, halal, rendah kalori',
    allergen_info: 'Mengandung kacang tanah',
    preparation_notes: 'Bumbu kacang terpisah untuk menjaga kesegaran sayuran. Kerupuk disediakan.',
    price_type: 'paid',
    price: 15000,
    is_featured: true,
    view_count: 67,
    donor_id: 'donor3',
    created_at: '2024-01-15T09:15:00Z',
    updated_at: '2024-01-15T09:15:00Z',
    expired_at: '2024-01-16T14:00:00Z',
    quantity: 6,
    category: 'sayuran',
    location: 'Jl. Thamrin No. 789, Jakarta Pusat',
    distance_km: 0.9,
    status: 'booked',
    profiles: {
      full_name: 'Gado-gado Ibu Tini',
      avatar_url: undefined
    }
  },
  {
    id: '4',
    title: 'Nasi Padang Komplit',
    description: 'Nasi Padang lengkap dengan rendang daging, ayam pop, sambal ijo, perkedel kentang, dan sayur nangka. Bumbu autentik Minangkabau.',
    unit: 'porsi',
    pickup_address: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
    pickup_time_start: '2024-01-15T19:00:00.000Z',
    pickup_time_end: '2024-01-15T21:00:00.000Z',
    dietary_info: 'Halal, pedas sedang, kaya rempah',
    allergen_info: 'Mengandung santan kelapa',
    preparation_notes: 'Masakan masih hangat, nasi pulen. Sambal terpisah untuk yang tidak suka pedas.',
    price_type: 'free',
    price: null,
    is_featured: true,
    view_count: 89,
    donor_id: 'donor4',
    created_at: '2024-01-15T16:00:00Z',
    updated_at: '2024-01-15T16:00:00Z',
    expired_at: '2024-01-16T21:00:00Z',
    quantity: 15,
    category: 'makanan-berat',
    location: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
    distance_km: 3.2,
    status: 'available',
    profiles: {
      full_name: 'Rumah Makan Padang Sederhana',
      avatar_url: undefined
    }
  },
  {
    id: '5',
    title: 'Bakso Malang Jumbo',
    description: 'Bakso Malang dengan berbagai isian (bakso urat, bakso telur, tahu bakso), kuah kaldu sapi yang gurih, dan mie kuning.',
    unit: 'mangkok',
    pickup_address: 'Jl. Diponegoro No. 202, Malang',
    pickup_time_start: '2024-01-15T17:30:00.000Z',
    pickup_time_end: '2024-01-15T19:30:00.000Z',
    dietary_info: 'Halal, tidak pedas, kaldu sapi asli',
    allergen_info: 'Mengandung gluten (mie), telur',
    preparation_notes: 'Kuah panas, bakso fresh dibuat hari ini. Sambal dan kecap manis tersedia.',
    price_type: 'paid',
    price: 20000,
    is_featured: false,
    view_count: 34,
    donor_id: 'donor5',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    expired_at: '2024-01-16T19:30:00Z',
    quantity: 10,
    category: 'makanan-berat',
    location: 'Jl. Diponegoro No. 202, Malang',
    distance_km: 85.4,
    status: 'available',
    profiles: {
      full_name: 'Bakso Malang Pak Bambang',
      avatar_url: undefined
    }
  },
  {
    id: '6',
    title: 'Salad Buah Segar',
    description: 'Salad buah dengan campuran apel, jeruk, anggur, melon, dan semangka. Dressing yogurt madu yang menyegarkan.',
    unit: 'cup',
    pickup_address: 'Jl. Kemang Raya No. 88, Jakarta Selatan',
    pickup_time_start: '2024-01-15T14:00:00.000Z',
    pickup_time_end: '2024-01-15T16:00:00.000Z',
    dietary_info: 'Vegetarian, rendah kalori, kaya vitamin C',
    allergen_info: 'Mengandung produk susu (yogurt)',
    preparation_notes: 'Buah dipotong fresh, dressing terpisah. Disimpan dalam kulkas hingga pengambilan.',
    price_type: 'paid',
    price: 12000,
    is_featured: false,
    view_count: 28,
    donor_id: 'donor6',
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z',
    expired_at: '2024-01-15T18:00:00Z',
    quantity: 20,
    category: 'buah',
    location: 'Jl. Kemang Raya No. 88, Jakarta Selatan',
    distance_km: 4.1,
    status: 'available',
    profiles: {
      full_name: 'Healthy Corner Cafe',
      avatar_url: undefined
    }
  },
  {
    id: '7',
    title: 'Roti Bakar Cokelat Keju',
    description: 'Roti bakar dengan topping cokelat meses dan keju cheddar yang melted. Roti gandum yang sehat dan mengenyangkan.',
    unit: 'potong',
    pickup_address: 'Jl. Cikini Raya No. 12, Jakarta Pusat',
    pickup_time_start: '2024-01-15T15:00:00.000Z',
    pickup_time_end: '2024-01-15T17:00:00.000Z',
    dietary_info: 'Vegetarian, mengandung gluten',
    allergen_info: 'Mengandung gluten, susu, mungkin kacang',
    preparation_notes: 'Roti dipanggang fresh saat order. Masih hangat dan crispy.',
    price_type: 'paid',
    price: 8000,
    is_featured: false,
    view_count: 15,
    donor_id: 'donor7',
    created_at: '2024-01-15T13:00:00Z',
    updated_at: '2024-01-15T13:00:00Z',
    expired_at: '2024-01-15T20:00:00Z',
    quantity: 8,
    category: 'snack',
    location: 'Jl. Cikini Raya No. 15, Jakarta Pusat',
    distance_km: 2.3,
    status: 'available',
    profiles: {
      full_name: 'Roti Bakar Abang Joko',
      avatar_url: undefined
    }
  },
  {
    id: '8',
    title: 'Jus Alpukat Madu',
    description: 'Jus alpukat segar dengan madu asli dan susu kental manis. Dibuat dari alpukat pilihan yang matang sempurna.',
    unit: 'gelas',
    pickup_address: 'Jl. Senopati No. 67, Jakarta Selatan',
    pickup_time_start: '2024-01-15T13:30:00.000Z',
    pickup_time_end: '2024-01-15T15:30:00.000Z',
    dietary_info: 'Vegetarian, kaya vitamin E, energi tinggi',
    allergen_info: 'Mengandung susu',
    preparation_notes: 'Dibuat fresh tanpa pengawet. Disajikan dingin dengan es batu.',
    price_type: 'free',
    price: null,
    is_featured: true,
    view_count: 52,
    donor_id: 'donor8',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    expired_at: '2024-01-15T18:00:00Z',
    quantity: 25,
    category: 'minuman',
    location: 'Jl. Senopati No. 67, Jakarta Selatan',
    distance_km: 3.7,
    status: 'available',
    profiles: {
      full_name: 'Juice Bar Sehat',
      avatar_url: undefined
    }
  },
  {
    id: '9',
    title: 'Mie Ayam Bakso',
    description: 'Mie ayam dengan topping ayam suwir, bakso, pangsit goreng, dan sayuran. Kuah kaldu ayam yang gurih dan mie yang kenyal.',
    unit: 'mangkok',
    pickup_address: 'Jl. Mangga Besar No. 234, Jakarta Barat',
    pickup_time_start: '2024-01-15T16:00:00.000Z',
    pickup_time_end: '2024-01-15T18:00:00.000Z',
    dietary_info: 'Halal, tidak terlalu pedas',
    allergen_info: 'Mengandung gluten (mie), telur (pangsit)',
    preparation_notes: 'Mie dan kuah terpisah untuk menjaga tekstur. Sambal dan acar tersedia.',
    price_type: 'free',
    price: null,
    is_featured: false,
    view_count: 42,
    donor_id: 'donor9',
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z',
    expired_at: '2024-01-16T18:00:00Z',
    quantity: 18,
    category: 'makanan-berat',
    location: 'Jl. Mangga Besar No. 234, Jakarta Barat',
    distance_km: 5.2,
    status: 'available',
    profiles: {
      full_name: 'Mie Ayam Pak Udin',
      avatar_url: undefined
    }
  },
  {
    id: '10',
    title: 'Sayur Asem Betawi',
    description: 'Sayur asem khas Betawi dengan jagung muda, kacang panjang, labu siam, dan kemangi. Kuah asam segar yang menyehatkan.',
    unit: 'mangkok',
    pickup_address: 'Jl. Kebon Sirih No. 156, Jakarta Pusat',
    pickup_time_start: '2024-01-15T17:00:00.000Z',
    pickup_time_end: '2024-01-15T19:00:00.000Z',
    dietary_info: 'Vegan, halal, rendah kalori, kaya serat',
    allergen_info: 'Tidak mengandung alergen utama',
    preparation_notes: 'Sayuran masih segar dan renyah. Kuah asam manis yang menyegarkan.',
    price_type: 'free',
    price: null,
    is_featured: false,
    view_count: 19,
    donor_id: 'donor10',
    created_at: '2024-01-15T15:30:00Z',
    updated_at: '2024-01-15T15:30:00Z',
    expired_at: '2024-01-16T19:00:00Z',
    quantity: 14,
    category: 'sayuran',
    location: 'Jl. Kebon Sirih No. 156, Jakarta Pusat',
    distance_km: 1.6,
    status: 'available',
    profiles: {
      full_name: 'Warung Sayur Bu Ningsih',
      avatar_url: undefined
    }
  }
];

const DUMMY_MY_DONATIONS: Food[] = [
  {
    id: '4',
    title: 'Rendang Padang',
    description: 'Rendang daging sapi khas Padang yang empuk dan bumbu meresap',
    unit: 'porsi',
    pickup_address: 'Jl. Asia Afrika No. 101, Bandung',
    pickup_time_start: '2024-01-14T19:00:00.000Z',
    pickup_time_end: '2024-01-14T21:00:00.000Z',
    dietary_info: 'Halal, pedas sedang',
    allergen_info: 'Tidak ada',
    preparation_notes: 'Masih hangat, siap untuk dibagikan',
    price_type: 'free',
    price: null,
    is_featured: false,
    view_count: 12,
    donor_id: 'current_user',
    created_at: '2024-01-14T16:00:00Z',
    updated_at: '2024-01-14T16:00:00Z',
    expired_at: '2024-01-15T21:00:00Z'
  },
  {
    id: '5',
    title: 'Bakso Malang',
    description: 'Bakso dengan berbagai isian, kuah hangat dan mie',
    unit: 'mangkok',
    pickup_address: 'Jl. Diponegoro No. 202, Malang',
    pickup_time_start: '2024-01-14T17:30:00.000Z',
    pickup_time_end: '2024-01-14T19:30:00.000Z',
    dietary_info: 'Halal',
    allergen_info: 'Mengandung gluten',
    preparation_notes: 'Kuah panas, bakso fresh',
    price_type: 'free',
    price: null,
    is_featured: true,
    view_count: 34,
    donor_id: 'current_user',
    created_at: '2024-01-14T14:30:00Z',
    updated_at: '2024-01-14T14:30:00Z',
    expired_at: '2024-01-15T19:30:00Z'
  }
];

const DUMMY_USER_BOOKINGS: BookingWithFood[] = [
  {
    id: 'booking1',
    food_id: '1',
    user_id: 'current_user',
    status: 'confirmed',
    pickup_time: '2024-01-15T19:00:00Z',
    notes: 'Akan datang tepat waktu',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:30:00Z',
    food: DUMMY_FOODS[0]
  },
  {
    id: 'booking2',
    food_id: '2',
    user_id: 'current_user',
    status: 'pending',
    pickup_time: null,
    notes: 'Menunggu konfirmasi dari donor',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    food: DUMMY_FOODS[1]
  },
  {
    id: 'booking3',
    food_id: '3',
    user_id: 'current_user',
    status: 'completed',
    pickup_time: '2024-01-14T13:00:00Z',
    notes: 'Makanan sudah diambil, terima kasih',
    created_at: '2024-01-14T11:00:00Z',
    updated_at: '2024-01-14T13:30:00Z',
    food: DUMMY_FOODS[2]
  }
];

interface FoodStore {
  foods: Food[];
  filteredFoods: Food[];
  selectedCategory: string | null;
  myDonations: Food[];
  userBookings: BookingWithFood[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadFoods: (category?: string, searchQuery?: string) => Promise<void>;
  loadMyDonations: () => Promise<void>;
  loadUserBookings: () => Promise<void>;
  createFood: (food: Omit<Food, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  bookFood: (foodId: string, userId: string, notes?: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  initDatabase: () => Promise<void>;
  setCategory: (category: string | null) => void;
  getCategories: () => string[];
}

// Insert dummy data into database
const insertDummyData = async () => {
  try {
    // Check if data already exists
      const existingFoods = db.getAllSync('SELECT COUNT(*) as count FROM foods') as { count: number }[];
      if (existingFoods[0]?.count > 0) {
      console.log('Dummy data already exists, skipping insertion');
      return;
    }

    // Insert dummy foods
    for (const food of DUMMY_FOODS) {
      db.runSync(
        `INSERT INTO foods (
          id, title, description, unit, pickup_address, pickup_time_start, pickup_time_end,
          dietary_info, allergen_info, preparation_notes, price_type, price, is_featured,
          view_count, donor_id, created_at, updated_at, expired_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          food.id, food.title, food.description, food.unit, food.pickup_address,
          food.pickup_time_start, food.pickup_time_end, food.dietary_info, food.allergen_info,
          food.preparation_notes, food.price_type, food.price, food.is_featured ? 1 : 0,
          food.view_count, food.donor_id, food.created_at, food.updated_at, food.expired_at
        ]
      );
    }

    console.log('Dummy data inserted successfully');
  } catch (error) {
    console.error('Failed to insert dummy data:', error);
  }
};

// Insert dummy donors into database
const insertDummyDonors = async () => {
  try {
    // Check if donors already exist
      const existingDonors = db.getAllSync('SELECT COUNT(*) as count FROM users') as { count: number }[];
      if (existingDonors[0]?.count > 0) {
      console.log('Dummy donors already exist, skipping insertion');
      return;
    }

    // Insert dummy donors as users
    for (const donor of DUMMY_DONORS) {
      db.runSync(
        `INSERT INTO users (
          id, email, full_name, phone, address, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          donor.id, `${donor.id}@example.com`, donor.name, donor.phone,
          donor.address, donor.created_at, donor.updated_at
        ]
      );
    }

    console.log('Dummy donors inserted successfully');
  } catch (error) {
    console.error('Failed to insert dummy donors:', error);
  }
};

export const useFoodStore = create<FoodStore>((set, get) => ({
  foods: [],
  filteredFoods: [],
  selectedCategory: null,
  myDonations: [],
  userBookings: [],
  isLoading: false,
  error: null,

  initDatabase: async () => {
    try {
      await initializeDatabase();
      console.log('Database initialized successfully');
      
      // Insert dummy data
      await insertDummyData();
      await insertDummyDonors();
      
      // Load foods
      await get().loadFoods();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      set({ error: 'Failed to initialize database' });
    }
  },

  loadFoods: async (category?: string, searchQuery?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // For now, use dummy data as SQLite implementation
      let allFoods = [...DUMMY_FOODS];
      let filteredFoods = [...DUMMY_FOODS];
      
      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredFoods = filteredFoods.filter(food => 
          food.title.toLowerCase().includes(query) ||
          (food.description && food.description.toLowerCase().includes(query))
        );
      }
      
      // Apply category filter - use parameter category or selectedCategory from state
      const { selectedCategory } = get();
      const activeCategory = category !== undefined ? category : selectedCategory;
      
      if (activeCategory && activeCategory !== 'all') {
        filteredFoods = filteredFoods.filter(food => food.category === activeCategory);
      }
      
      set({ foods: allFoods, filteredFoods: filteredFoods, isLoading: false });
    } catch (error) {
      console.error('Error loading foods:', error);
      // Fallback to dummy data on error
      set({ foods: DUMMY_FOODS, filteredFoods: DUMMY_FOODS, error: 'Failed to load foods', isLoading: false });
    }
  },

  loadMyDonations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // For now, use dummy data
      set({ myDonations: DUMMY_MY_DONATIONS, isLoading: false });
    } catch (error) {
      console.error('Error loading my donations:', error);
      set({ myDonations: [], error: 'Failed to load donations', isLoading: false });
    }
  },

  loadUserBookings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // For now, use dummy data
      set({ userBookings: DUMMY_USER_BOOKINGS, isLoading: false });
    } catch (error) {
      console.error('Error loading user bookings:', error);
      set({ userBookings: [], error: 'Failed to load bookings', isLoading: false });
    }
  },

  createFood: async (foodData) => {
    set({ isLoading: true, error: null });
    
    try {
      const newFood: Food = {
        ...foodData,
        id: generateId(),
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
      };
      
      // For now, just add to dummy data
      const currentFoods = get().foods;
      set({ foods: [...currentFoods, newFood], isLoading: false });
      
      // Also add to myDonations if it's from current user
      const currentDonations = get().myDonations;
      set({ myDonations: [...currentDonations, newFood] });
      
    } catch (error) {
      console.error('Error creating food:', error);
      set({ error: 'Failed to create food', isLoading: false });
    }
  },

  bookFood: async (foodId: string, userId: string, notes?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const newBooking: Booking = {
        id: generateId(),
        food_id: foodId,
        user_id: userId,
        status: 'pending',
        pickup_time: null,
        notes: notes || null,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
      };
      
      // Find the food item
      const food = get().foods.find(f => f.id === foodId);
      if (!food) {
        throw new Error('Food not found');
      }
      
      const bookingWithFood: BookingWithFood = {
        ...newBooking,
        food
      };
      
      // Add to user bookings
      const currentBookings = get().userBookings;
      set({ userBookings: [...currentBookings, bookingWithFood], isLoading: false });
      
    } catch (error) {
      console.error('Error booking food:', error);
      set({ error: 'Failed to book food', isLoading: false });
    }
  },

  updateBookingStatus: async (bookingId: string, status: Booking['status']) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentBookings = get().userBookings;
      const updatedBookings = currentBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status, updated_at: getCurrentTimestamp() }
          : booking
      );
      
      set({ userBookings: updatedBookings, isLoading: false });
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      set({ error: 'Failed to update booking status', isLoading: false });
    }
  },

  setCategory: (category: string | null) => {
    const { foods } = get();
    const filteredFoods = category && category !== 'all'
      ? foods.filter(food => food.category === category)
      : foods;
    
    set({ 
      selectedCategory: category,
      filteredFoods 
    });
  },

  getCategories: () => {
    const { foods } = get();
    const categories = [...new Set(foods.map(food => food.category).filter(Boolean))] as string[];
    return categories.sort();
  }
}));