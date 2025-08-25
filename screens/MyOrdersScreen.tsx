import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useFoodStore } from '../store/foodStore'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow, format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Food, Booking } from '../lib/database.types'
import { MyOrdersScreenNavigationProp } from '../types/navigation'

type TabType = 'donations' | 'orders'

interface BookingWithFood extends Omit<Booking, 'foods'> {
  foods?: {
    id: string
    title: string
    description: string | null
    category: string
    quantity: number
    unit: string
    image_urls: string[] | null
    pickup_location: unknown
    pickup_address: string
    pickup_time_start: string
    pickup_time_end: string
    expired_at: string
    status: 'available' | 'booked' | 'completed' | 'expired' | 'cancelled'
    dietary_info: string[] | null
    allergen_info: string[] | null
    preparation_notes: string | null
    price_type: 'free' | 'paid'
    price: number
    is_featured: boolean
    view_count: number
    created_at: string
    updated_at: string
    donor_id: string
    profiles?: {
      full_name: string | null
      avatar_url: string | null
    }
    distance_km?: number
  }
}

interface FoodWithBookings {
  id: string
  title: string
  description: string | null
  category: string
  quantity: number
  unit: string
  image_urls: string[] | null
  pickup_location: unknown
  pickup_address: string
  pickup_time_start: string
  pickup_time_end: string
  expired_at: string
  status: 'available' | 'booked' | 'completed' | 'expired' | 'cancelled'
  dietary_info: string[] | null
  allergen_info: string[] | null
  preparation_notes: string | null
  price_type: 'free' | 'paid'
  price: number
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string
  donor_id: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
  distance_km?: number
  bookings?: Booking[]
}

export default function MyOrdersScreen() {
  const navigation = useNavigation<MyOrdersScreenNavigationProp>()
  const { user } = useAuthStore()
  const { 
    foods, 
    userBookings, 
    myDonations, 
    loadUserBookings, 
    loadMyDonations,
    updateBookingStatus,
    loading 
  } = useFoodStore()
  
  const [activeTab, setActiveTab] = useState<TabType>('donations')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadUserBookings()
      loadMyDonations(user.id)
    }
  }, [user?.id])

  const onRefresh = async () => {
    if (!user) return
    
    setRefreshing(true)
    try {
      if (user?.id) {
        await loadUserBookings()
        await loadMyDonations(user.id)
      }
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { success, error } = await updateBookingStatus(bookingId, status)
      
      if (success) {
        Alert.alert(
          'Berhasil!',
          `Status booking berhasil diubah menjadi ${getStatusText(status)}.`,
          [{ text: 'OK' }]
        )
        // Refresh data
        onRefresh()
      } else {
        Alert.alert(
          'Error',
          error?.message || 'Gagal mengubah status booking.',
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      console.error('Update booking status error:', error)
      Alert.alert(
        'Error',
        'Terjadi kesalahan. Silakan coba lagi.',
        [{ text: 'OK' }]
      )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-secondary-500'
      case 'confirmed':
        return 'bg-primary-500'
      case 'completed':
        return 'bg-success-500'
      case 'cancelled':
        return 'bg-danger-500'
      case 'available':
        return 'bg-success-500'
      case 'booked':
        return 'bg-secondary-500'
      case 'expired':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu'
      case 'confirmed':
        return 'Dikonfirmasi'
      case 'completed':
        return 'Selesai'
      case 'cancelled':
        return 'Dibatalkan'
      case 'available':
        return 'Tersedia'
      case 'booked':
        return 'Sudah Dipesan'
      case 'expired':
        return 'Kedaluwarsa'
      default:
        return status
    }
  }

  const renderBookingActions = (booking: BookingWithFood) => {
    if (activeTab === 'orders') {
      // Actions for receiver (user who made the booking)
      switch (booking.status) {
        case 'pending':
          return (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Batalkan Pesanan',
                  'Apakah Anda yakin ingin membatalkan pesanan ini?',
                  [
                    { text: 'Tidak', style: 'cancel' },
                    {
                      text: 'Ya, Batalkan',
                      style: 'destructive',
                      onPress: () => handleUpdateBookingStatus(booking.id, 'cancelled')
                    }
                  ]
                )
              }}
              className="bg-danger-500 px-3 py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-sm">Batalkan</Text>
            </TouchableOpacity>
          )
        case 'confirmed':
          return (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Konfirmasi Pengambilan',
                  'Apakah Anda sudah mengambil makanan ini?',
                  [
                    { text: 'Belum', style: 'cancel' },
                    {
                      text: 'Ya, Sudah',
                      onPress: () => handleUpdateBookingStatus(booking.id, 'completed')
                    }
                  ]
                )
              }}
              className="bg-success-500 px-3 py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-sm">Selesai</Text>
            </TouchableOpacity>
          )
        default:
          return null
      }
    } else {
      // Actions for donor (user who posted the food)
      switch (booking.status) {
        case 'pending':
          return (
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                className="bg-danger-500 px-3 py-2 rounded-lg"
              >
                <Text className="text-white font-medium text-sm">Tolak</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                className="bg-primary-500 px-3 py-2 rounded-lg"
              >
                <Text className="text-white font-medium text-sm">Terima</Text>
              </TouchableOpacity>
            </View>
          )
        default:
          return null
      }
    }
  }

  const renderBookingCard = (booking: BookingWithFood) => {
    const food = booking.foods
    if (!food) return null

    return (
      <View key={booking.id} className="bg-white p-4 rounded-xl border border-gray-100 mb-3">
        <View className="flex-row">
          {/* Food Image */}
          <View className="w-20 h-20 bg-gray-200 rounded-lg mr-3">
            {food.image_urls && food.image_urls.length > 0 ? (
              <Image
                source={{ uri: food.image_urls[0] }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full justify-center items-center">
                <Ionicons name="image" size={24} color="#9ca3af" />
              </View>
            )}
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-gray-800 font-semibold text-base flex-1 mr-2">
                {food.title}
              </Text>
              <View className={`px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                <Text className="text-white font-medium text-xs">
                  {getStatusText(booking.status)}
                </Text>
              </View>
            </View>

            <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
              {food.description}
            </Text>

            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1" numberOfLines={1}>
                {food.pickup_address}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-gray-500 text-xs">
                {formatDistanceToNow(new Date(booking.created_at), {
                  addSuffix: true,
                  locale: id,
                })}
              </Text>
              
              {renderBookingActions(booking)}
            </View>

            {booking.message && (
              <View className="bg-gray-50 p-3 rounded-lg mt-3">
                <Text className="text-gray-700 text-sm italic">
                  &ldquo;{booking.message}&rdquo;
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  const renderDonationCard = (food: FoodWithBookings) => {
    const bookingsCount = food.bookings?.length || 0
    const pendingBookings = food.bookings?.filter(b => b.status === 'pending').length || 0

    return (
      <View key={food.id} className="bg-white p-4 rounded-xl border border-gray-100 mb-3">
        <View className="flex-row">
          {/* Food Image */}
          <View className="w-20 h-20 bg-gray-200 rounded-lg mr-3">
            {food.image_urls && food.image_urls.length > 0 ? (
              <Image
                source={{ uri: food.image_urls[0] }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full justify-center items-center">
                <Ionicons name="image" size={24} color="#9ca3af" />
              </View>
            )}
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-gray-800 font-semibold text-base flex-1 mr-2">
                {food.title}
              </Text>
              <View className={`px-2 py-1 rounded-full ${getStatusColor(food.status)}`}>
                <Text className="text-white font-medium text-xs">
                  {getStatusText(food.status)}
                </Text>
              </View>
            </View>

            <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
              {food.description}
            </Text>

            <View className="flex-row items-center mb-2">
              <Ionicons name="restaurant" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {food.quantity} porsi
              </Text>
              <Ionicons name="time" size={14} color="#6b7280" className="ml-3" />
              <Text className="text-gray-500 text-sm ml-1">
                {format(new Date(food.expired_at), 'dd MMM, HH:mm', { locale: id })}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-gray-500 text-xs">
                  {bookingsCount} pesanan
                </Text>
                {pendingBookings > 0 && (
                  <View className="bg-secondary-100 px-2 py-1 rounded-full ml-2">
                    <Text className="text-secondary-800 font-medium text-xs">
                      {pendingBookings} menunggu
                    </Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                onPress={() => navigation.navigate('FoodDetail', { foodId: food.id })}
                className="bg-primary-500 px-3 py-2 rounded-lg"
              >
                <Text className="text-white font-medium text-sm">Detail</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pending Bookings */}
        {pendingBookings > 0 && food.bookings && (
          <View className="mt-4 pt-4 border-t border-gray-100">
            <Text className="text-gray-700 font-medium mb-3">Pesanan Menunggu:</Text>
            {food.bookings
              .filter(booking => booking.status === 'pending')
              .map(booking => (
                <View key={booking.id} className="bg-gray-50 p-3 rounded-lg mb-2">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-gray-800 font-medium">
                        {booking.profiles?.full_name || 'Anonymous'}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {formatDistanceToNow(new Date(booking.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </Text>
                      {booking.message && (
                        <Text className="text-gray-600 text-sm mt-1 italic">
                          &ldquo;{booking.message}&rdquo;
                        </Text>
                      )}
                    </View>
                    
                    <View className="flex-row space-x-2 ml-3">
                      <TouchableOpacity
                        onPress={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                        className="bg-danger-500 px-3 py-2 rounded-lg"
                      >
                        <Text className="text-white font-medium text-sm">Tolak</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                        className="bg-primary-500 px-3 py-2 rounded-lg"
                      >
                        <Text className="text-white font-medium text-sm">Terima</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            }
          </View>
        )}
      </View>
    )
  }

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="mt-4 text-gray-600">Memuat data...</Text>
        </View>
      )
    }

    if (activeTab === 'donations') {
      if (myDonations.length === 0) {
        return (
          <View className="flex-1 justify-center items-center px-8">
            <Ionicons name="restaurant" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
              Belum Ada Donasi
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Mulai berbagi makanan dengan menambahkan donasi pertama Anda
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddFood' as never)}
              className="bg-primary-500 px-6 py-3 rounded-xl mt-6"
            >
              <Text className="text-white font-semibold">Tambah Makanan</Text>
            </TouchableOpacity>
          </View>
        )
      }

      return (
        <ScrollView 
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {myDonations.map(renderDonationCard)}
        </ScrollView>
      )
    } else {
      if (userBookings.length === 0) {
        return (
          <View className="flex-1 justify-center items-center px-8">
            <Ionicons name="receipt" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
              Belum Ada Pesanan
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Jelajahi makanan yang tersedia dan buat pesanan pertama Anda
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home' as never)}
              className="bg-primary-500 px-6 py-3 rounded-xl mt-6"
            >
              <Text className="text-white font-semibold">Jelajahi Makanan</Text>
            </TouchableOpacity>
          </View>
        )
      }

      return (
        <ScrollView 
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {(userBookings as BookingWithFood[]).map(renderBookingCard)}
        </ScrollView>
      )
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-800 text-center">
          Aktivitas Saya
        </Text>
      </View>

      {/* Tabs */}
      <View className="bg-white px-4 py-2">
        <View className="flex-row bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab('donations')}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'donations' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              activeTab === 'donations' ? 'text-primary-600' : 'text-gray-600'
            }`}>
              Donasi Saya
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('orders')}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'orders' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              activeTab === 'orders' ? 'text-primary-600' : 'text-gray-600'
            }`}>
              Pesanan Saya
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  )
}