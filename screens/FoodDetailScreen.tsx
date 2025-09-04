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
      
      Alert.alert(
        'Berhasil!',
        'Makanan berhasil dipesan. Donor akan segera menghubungi Anda.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowBookingModal(false)
              navigation.goBack()
            }
          }
        ]
      )
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
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 justify-center items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-gray-800">Detail Makanan</Text>
        
        <TouchableOpacity className="w-10 h-10 justify-center items-center">
          <Ionicons name="share-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View className="h-64 bg-gray-200">
          {food.image_url ? (
            <Image
              source={{ uri: food.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full justify-center items-center">
              <Ionicons name="image" size={64} color="#9ca3af" />
              <Text className="text-gray-500 mt-2">Tidak ada foto</Text>
            </View>
          )}
        </View>

        <View className="p-4">
          {/* Status Badge */}
          <View className="flex-row justify-between items-start mb-4">
            <View className={`px-3 py-1 rounded-full ${getStatusColor(food.status)}`}>
              <Text className="text-white font-medium text-sm">
                {getStatusText(food.status)}
              </Text>
            </View>
            
            {isExpired && (
              <View className="bg-danger-100 px-3 py-1 rounded-full">
                <Text className="text-danger-800 font-medium text-sm">
                  Kedaluwarsa
                </Text>
              </View>
            )}
          </View>

          {/* Title and Description */}
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {food.title}
          </Text>
          
          <Text className="text-gray-600 text-base leading-6 mb-6">
            {food.description}
          </Text>

          {/* Info Cards */}
          <View className="space-y-4 mb-6">
            {/* Quantity */}
            <View className="bg-primary-50 p-4 rounded-xl">
              <View className="flex-row items-center">
                <Ionicons name="restaurant" size={20} color="#0ea5e9" />
                <Text className="text-primary-800 font-semibold ml-2">Jumlah Porsi</Text>
              </View>
              <Text className="text-primary-700 text-lg font-bold mt-1">
                {food.quantity} porsi
              </Text>
            </View>

            {/* Category */}
            <View className="bg-secondary-50 p-4 rounded-xl">
              <View className="flex-row items-center">
                <Ionicons name="pricetag" size={20} color="#eab308" />
                <Text className="text-secondary-800 font-semibold ml-2">Kategori</Text>
              </View>
              <Text className="text-secondary-700 text-lg font-bold mt-1 capitalize">
                {food.category ? food.category.replace('-', ' ') : 'Tidak ada kategori'}
              </Text>
            </View>

            {/* Location */}
            <View className="bg-success-50 p-4 rounded-xl">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={20} color="#22c55e" />
                    <Text className="text-success-800 font-semibold ml-2">Lokasi</Text>
                  </View>
                  <Text className="text-success-700 text-base mt-1">
                    {food.location}
                  </Text>
                  {food.distance_km && (
                    <Text className="text-success-600 text-sm mt-1">
                      {food.distance_km.toFixed(1)} km dari Anda
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity
                  onPress={handleGetDirections}
                  className="bg-success-500 px-3 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium text-sm">Rute</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expiry Time */}
            <View className="bg-orange-50 p-4 rounded-xl">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#f97316" />
                <Text className="text-orange-800 font-semibold ml-2">Kedaluwarsa</Text>
              </View>
              <Text className="text-orange-700 text-base mt-1">
                {food.expired_at ? format(new Date(food.expired_at), 'dd MMMM yyyy, HH:mm', { locale: id }) : 'Tanggal tidak valid'}
              </Text>
              <Text className="text-orange-600 text-sm mt-1">
                {food.expired_at ? formatDistanceToNow(new Date(food.expired_at), {
                  addSuffix: true,
                  locale: id,
                }) : 'Waktu tidak valid'}
              </Text>
            </View>
          </View>

          {/* Donor Info */}
          <View className="bg-gray-50 p-4 rounded-xl mb-6">
            <Text className="text-gray-800 font-semibold mb-3">Donor</Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-primary-100 rounded-full justify-center items-center mr-3">
                  {food.profiles?.avatar_url ? (
                    <Image
                      source={{ uri: food.profiles.avatar_url }}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={20} color="#0ea5e9" />
                  )}
                </View>
                
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    {food.profiles?.full_name || 'Anonymous'}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Bergabung {food.created_at ? formatDistanceToNow(new Date(food.created_at), {
                      addSuffix: true,
                      locale: id,
                    }) : 'tanggal tidak diketahui'}
                  </Text>
                </View>
              </View>
              
              {!isOwner && (
                <TouchableOpacity
                  onPress={handleContactDonor}
                  className="bg-success-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium text-sm">Hubungi</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {canBook && (
        <View className="p-4 border-t border-gray-100">
          <TouchableOpacity
            onPress={() => setShowBookingModal(true)}
            disabled={isLoading}
            className="bg-primary-500 py-4 rounded-xl justify-center items-center"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">Pesan Makanan</Text>
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
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Pesan Makanan</Text>
              <TouchableOpacity
                onPress={() => setShowBookingModal(false)}
                className="w-8 h-8 justify-center items-center"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-4">
              Kirim pesan kepada donor (opsional):
            </Text>

            <TextInput
              value={bookingMessage}
              onChangeText={setBookingMessage}
              placeholder="Contoh: Saya akan mengambil makanan dalam 30 menit..."
              multiline
              numberOfLines={4}
              className="bg-gray-100 p-4 rounded-xl text-gray-800 mb-6"
              textAlignVertical="top"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-200 py-4 rounded-xl justify-center items-center"
              >
                <Text className="text-gray-700 font-semibold">Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleBookFood}
                disabled={bookingLoading}
                className="flex-1 bg-primary-500 py-4 rounded-xl justify-center items-center"
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold">Konfirmasi Pesanan</Text>
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
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Rute ke Lokasi</Text>
            <TouchableOpacity
              onPress={() => setShowWebView(false)}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <WebView
            source={{ uri: mapUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#22c55e" />
                <Text className="text-gray-600 mt-2">Memuat peta...</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}