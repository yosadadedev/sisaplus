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
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { useFoodStore } from '../store/foodStore'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow, format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Food, Booking } from '../lib/database'
import { MyOrdersScreenNavigationProp } from '../types/navigation'

type TabType = 'donations' | 'orders'

type BookingWithFood = Booking & {
  food?: Food
}

type FoodWithBookings = Food & {
  bookings?: Booking[]
}

export default function MyOrdersScreen() {
  const isFocused = useIsFocused()
  const navigation = useNavigation<MyOrdersScreenNavigationProp>()
  const { user } = useAuthStore()
  const { 
    foods, 
    userBookings, 
    myDonations, 
    isLoading, 
    loadUserBookings, 
    loadMyDonations,
    updateBookingStatus 
  } = useFoodStore()
  
  const [activeTab, setActiveTab] = useState<TabType>('orders')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.id && isFocused) {
      // Add small delay to ensure navigation context is ready
      const timer = setTimeout(() => {
        loadUserBookings()
        loadMyDonations()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [user?.id, isFocused])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      if (user?.id) {
        await loadUserBookings()
        await loadMyDonations()
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Aktivitas Saya</Text>
        <Text className="text-gray-600 mt-1">Kelola pesanan dan donasi Anda</Text>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white px-4 py-2 border-b border-gray-200">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 rounded-lg mr-2 ${
              activeTab === 'orders' ? 'bg-blue-500' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-center font-medium ${
              activeTab === 'orders' ? 'text-white' : 'text-gray-700'
            }`}>
              Pesanan Saya
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('donations')}
            className={`flex-1 py-3 px-4 rounded-lg ml-2 ${
              activeTab === 'donations' ? 'bg-blue-500' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-center font-medium ${
              activeTab === 'donations' ? 'text-white' : 'text-gray-700'
            }`}>
              Donasi Saya
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === 'orders' ? (
          userBookings.length === 0 ? (
            <View className="flex-1 justify-center items-center px-4">
              <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
                Belum ada pesanan
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Pesanan Anda akan muncul di sini
              </Text>
            </View>
          ) : (
            <ScrollView 
              className="flex-1 px-4" 
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {userBookings.map((booking) => {
                const food = foods.find(f => f.id === booking.food_id)
                return (
                  <View key={booking.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
                    <View className="flex-row">
                      <View className="w-16 h-16 bg-gray-200 rounded-lg mr-3 justify-center items-center">
                         <Ionicons name="restaurant" size={24} color="#9CA3AF" />
                       </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 text-base">
                          {food?.title || 'Makanan tidak ditemukan'}
                        </Text>
                        <Text className="text-gray-600 text-sm mt-1">
                           Status: {booking.status}
                         </Text>
                        <Text className="text-gray-500 text-xs mt-1">
                          {booking.created_at ? formatDistanceToNow(new Date(booking.created_at), { 
                            addSuffix: true, 
                            locale: id 
                          }) : 'Waktu tidak tersedia'}
                        </Text>
                      </View>
                      <View className="items-end justify-between">
                        <View className={`px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100' :
                          booking.status === 'pending' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          <Text className={`text-xs font-medium ${
                            booking.status === 'confirmed' ? 'text-green-800' :
                            booking.status === 'pending' ? 'text-yellow-800' :
                            'text-red-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Dikonfirmasi' :
                             booking.status === 'pending' ? 'Menunggu' :
                             'Dibatalkan'}
                          </Text>
                        </View>
                        {booking.status === 'pending' && (
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
                                    onPress: () => updateBookingStatus(booking.id, 'cancelled')
                                  }
                                ]
                              )
                            }}
                            className="bg-red-500 px-3 py-1 rounded-lg mt-2"
                          >
                            <Text className="text-white text-xs font-medium">Batalkan</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                )
              })}
            </ScrollView>
          )
        ) : (
          myDonations.length === 0 ? (
            <View className="flex-1 justify-center items-center px-4">
              <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
                Belum ada donasi
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Donasi Anda akan muncul di sini
              </Text>
            </View>
          ) : (
            <ScrollView 
              className="flex-1 px-4" 
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {myDonations.map((donation) => {
                const bookingsCount = userBookings.filter(b => b.food_id === donation.id).length
                return (
                  <TouchableOpacity
                    key={donation.id}
                    onPress={() => navigation.navigate('FoodDetail', { foodId: donation.id })}
                    className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
                  >
                    <View className="flex-row">
                      <View className="w-16 h-16 bg-gray-200 rounded-lg mr-3 justify-center items-center">
                         <Ionicons name="restaurant" size={24} color="#9CA3AF" />
                       </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 text-base">
                          {donation.title}
                        </Text>
                        <Text className="text-gray-600 text-sm mt-1">
                           Berlaku sampai: {new Date(donation.expired_at).toLocaleDateString('id-ID')}
                         </Text>
                        <Text className="text-gray-500 text-xs mt-1">
                          {donation.created_at ? formatDistanceToNow(new Date(donation.created_at), { 
                            addSuffix: true, 
                            locale: id 
                          }) : 'Waktu tidak tersedia'}
                        </Text>
                      </View>
                      <View className="items-end justify-between">
                        <View className="px-2 py-1 rounded-full bg-green-100">
                           <Text className="text-xs font-medium text-green-800">
                             Aktif
                           </Text>
                         </View>
                        <Text className="text-blue-600 text-xs font-medium mt-1">
                          {bookingsCount} pesanan
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          )
        )}
      </View>
    </SafeAreaView>
  )
}