import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useFoodStore } from '../store/foodStore'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow, format } from 'date-fns'
import { id } from 'date-fns/locale'
import { WebView } from 'react-native-webview'

interface RouteParams {
  foodId: string
}

export default function FoodDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { foodId } = route.params as RouteParams
  const { user } = useAuthStore()
  const { foods, bookFood, isLoading } = useFoodStore()
  
  const [food, setFood] = useState<any>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showWebView, setShowWebView] = useState(false)
  const [mapUrl, setMapUrl] = useState('')

  useEffect(() => {
    const foundFood = foods.find(f => f.id === foodId)
    setFood(foundFood)
  }, [foodId, foods])

  const handleBookFood = async () => {
    if (!food || !user) return

    try {
      setBookingLoading(true)
      await bookFood(food.id, user.id, bookingMessage)
      
      // Create booking data for QR code
      const bookingData = {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        food_id: food.id,
        user_id: user.id,
        status: 'confirmed',
        pickup_time: food.pickup_time_start,
        notes: bookingMessage,
        created_at: new Date().toISOString(),
        food: {
          id: food.id,
          title: food.title,
          pickup_address: food.pickup_address,
          pickup_time_start: food.pickup_time_start,
          pickup_time_end: food.pickup_time_end,
          profiles: {
            full_name: food.profiles?.full_name || 'Donatur'
          }
        }
      }
      
      setShowBookingModal(false)
      
      // Navigate to QR code screen
       ;(navigation as any).navigate('BookingQR', { bookingData })
      
    } catch (error) {
      console.error('Booking error:', error)
      Alert.alert(
        'Error',
        'Terjadi kesalahan saat memesan makanan. Silakan coba lagi.',
        [{ text: 'OK' }]
      )
    } finally {
      setBookingLoading(false)
    }
  }

  const handleContactDonor = () => {
    if (!food?.profiles?.phone) {
      Alert.alert(
        'Info',
        'Nomor telepon donor tidak tersedia.',
        [{ text: 'OK' }]
      )
      return
    }

    Alert.alert(
      'Hubungi Donor',
      `Hubungi ${food.profiles.full_name} melalui WhatsApp?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'WhatsApp',
          onPress: () => {
            const message = `Halo, saya tertarik dengan makanan "${food.title}" yang Anda bagikan di Sisa Plus.`
            const url = `whatsapp://send?phone=${food.profiles.phone}&text=${encodeURIComponent(message)}`
            Linking.openURL(url).catch(() => {
              Alert.alert('Error', 'WhatsApp tidak terinstall di perangkat Anda.')
            })
          }
        }
      ]
    )
  }

  const handleGetDirections = () => {
    if (!food?.latitude || !food?.longitude) {
      Alert.alert(
        'Info',
        'Lokasi tidak tersedia.',
        [{ text: 'OK' }]
      )
      return
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${food.latitude},${food.longitude}`
    setMapUrl(url)
    setShowWebView(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success-500'
      case 'booked':
        return 'bg-secondary-500'
      case 'completed':
        return 'bg-gray-500'
      case 'expired':
        return 'bg-danger-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia'
      case 'booked':
        return 'Sudah Dipesan'
      case 'completed':
        return 'Selesai'
      case 'expired':
        return 'Kedaluwarsa'
      default:
        return status
    }
  }

  const isExpired = food && new Date(food.expired_at) < new Date()
  const isOwner = food && user && food.donor_id === user.id
  const canBook = food && food.status === 'available' && !isExpired && !isOwner

  if (!food) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="mt-4 text-gray-600">Memuat detail makanan...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 justify-center items-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-gray-900">Detail Makanan</Text>
        
        <TouchableOpacity className="w-10 h-10 justify-center items-center rounded-full bg-gray-100">
          <Ionicons name="share-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View className="h-80 bg-gray-100 mx-6 mt-4 rounded-2xl overflow-hidden">
          {food.image_url ? (
            <Image
              source={{ uri: food.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full justify-center items-center">
              <View className="w-20 h-20 bg-gray-200 rounded-full justify-center items-center mb-3">
                <Ionicons name="image" size={32} color="#9ca3af" />
              </View>
              <Text className="text-gray-500 font-medium">Tidak ada foto</Text>
            </View>
          )}
        </View>

        <View className="px-6 py-6">
          {/* Status Badge */}
          <View className="flex-row justify-between items-center mb-6">
            <View className={`px-4 py-2 rounded-full ${getStatusColor(food.status)}`}>
              <Text className="text-white font-semibold text-sm">
                {getStatusText(food.status)}
              </Text>
            </View>
            
            {isExpired && (
              <View className="bg-red-100 px-4 py-2 rounded-full">
                <Text className="text-red-700 font-semibold text-sm">
                  Kedaluwarsa
                </Text>
              </View>
            )}
          </View>

          {/* Title and Description */}
          <Text className="text-3xl font-bold text-gray-900 mb-3">
            {food.title}
          </Text>
          
          <Text className="text-gray-600 text-lg leading-7 mb-8">
            {food.description}
          </Text>

          {/* Info Cards */}
          <View className="mb-8">
            {/* Quick Info Row */}
            <View className="flex-row mb-6">
              <View className="flex-1 bg-blue-50 p-4 rounded-2xl mr-3">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-blue-500 rounded-full justify-center items-center">
                    <Ionicons name="restaurant" size={16} color="white" />
                  </View>
                  <Text className="text-blue-900 font-semibold ml-2 text-sm">Porsi</Text>
                </View>
                <Text className="text-blue-800 text-xl font-bold">
                  {food.quantity}
                </Text>
              </View>

              <View className="flex-1 bg-purple-50 p-4 rounded-2xl">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-purple-500 rounded-full justify-center items-center">
                    <Ionicons name="pricetag" size={16} color="white" />
                  </View>
                  <Text className="text-purple-900 font-semibold ml-2 text-sm">Kategori</Text>
                </View>
                <Text className="text-purple-800 text-sm font-bold capitalize" numberOfLines={1}>
                  {food.category ? food.category.replace('-', ' ') : 'Lainnya'}
                </Text>
              </View>
            </View>

            {/* Location Card */}
            <View className="bg-green-50 p-5 rounded-2xl mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 bg-green-500 rounded-full justify-center items-center">
                      <Ionicons name="location" size={16} color="white" />
                    </View>
                    <Text className="text-green-900 font-bold ml-2">Lokasi Pengambilan</Text>
                  </View>
                  <Text className="text-green-800 text-base font-medium mb-1">
                    {food.location}
                  </Text>
                  {food.distance_km && (
                    <Text className="text-green-600 text-sm">
                      {food.distance_km.toFixed(1)} km dari lokasi Anda
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity
                  onPress={handleGetDirections}
                  className="bg-green-500 px-4 py-3 rounded-xl ml-3"
                >
                  <Ionicons name="navigate" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Expiry Time Card */}
            <View className="bg-orange-50 p-5 rounded-2xl">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-orange-500 rounded-full justify-center items-center">
                  <Ionicons name="time" size={16} color="white" />
                </View>
                <Text className="text-orange-900 font-bold ml-2">Batas Waktu</Text>
              </View>
              <Text className="text-orange-800 text-base font-semibold mb-1">
                {food.expired_at ? format(new Date(food.expired_at), 'EEEE, dd MMMM yyyy', { locale: id }) : 'Tanggal tidak valid'}
              </Text>
              <Text className="text-orange-600 text-sm">
                {food.expired_at ? formatDistanceToNow(new Date(food.expired_at), {
                  addSuffix: true,
                  locale: id,
                }) : 'Waktu tidak valid'}
              </Text>
            </View>
          </View>

          {/* Donor Info */}
          <View className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <Text className="text-gray-900 font-bold text-lg mb-4">Informasi Donor</Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-14 h-14 bg-blue-100 rounded-full justify-center items-center mr-4">
                  {food.profiles?.avatar_url ? (
                    <Image
                      source={{ uri: food.profiles.avatar_url }}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={24} color="#3b82f6" />
                  )}
                </View>
                
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    {food.profiles?.full_name || 'Anonymous'}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Berbagi {food.created_at ? formatDistanceToNow(new Date(food.created_at), {
                      addSuffix: true,
                      locale: id,
                    }) : 'baru-baru ini'}
                  </Text>
                </View>
              </View>
              
              {!isOwner && (
                <TouchableOpacity
                  onPress={handleContactDonor}
                  className="bg-green-500 px-5 py-3 rounded-xl"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="chatbubble" size={16} color="white" />
                    <Text className="text-white font-semibold text-sm ml-1">Chat</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {canBook && (
        <View className="px-6 py-6 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={() => setShowBookingModal(true)}
            disabled={isLoading}
            className="bg-blue-500 py-4 rounded-2xl justify-center items-center shadow-lg"
            style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="restaurant" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Pesan Makanan Ini</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">Konfirmasi Pesanan</Text>
              <TouchableOpacity
                onPress={() => setShowBookingModal(false)}
                className="w-10 h-10 justify-center items-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Food Summary */}
            <View className="bg-gray-50 p-4 rounded-2xl mb-6">
              <Text className="text-gray-900 font-bold text-lg mb-1">{food.title}</Text>
              <Text className="text-gray-600">{food.quantity} porsi • {food.location}</Text>
            </View>

            <Text className="text-gray-700 font-semibold mb-3">
              Pesan untuk donor (opsional):
            </Text>

            <TextInput
              value={bookingMessage}
              onChangeText={setBookingMessage}
              placeholder="Contoh: Saya akan mengambil makanan dalam 30 menit..."
              multiline
              numberOfLines={4}
              className="bg-gray-50 p-4 rounded-2xl text-gray-800 mb-6 border border-gray-200"
              textAlignVertical="top"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-100 py-4 rounded-2xl justify-center items-center"
              >
                <Text className="text-gray-700 font-bold">Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleBookFood}
                disabled={bookingLoading}
                className="flex-1 bg-blue-500 py-4 rounded-2xl justify-center items-center"
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold">Konfirmasi Pesanan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Google Maps WebView Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">Rute ke Lokasi</Text>
            <TouchableOpacity
              onPress={() => setShowWebView(false)}
              className="w-10 h-10 justify-center items-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <WebView
            source={{ uri: mapUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 justify-center items-center bg-gray-50">
                <View className="w-16 h-16 bg-green-100 rounded-full justify-center items-center mb-4">
                  <ActivityIndicator size="large" color="#22c55e" />
                </View>
                <Text className="text-gray-700 font-semibold">Memuat peta...</Text>
                <Text className="text-gray-500 text-sm mt-1">Mohon tunggu sebentar</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}