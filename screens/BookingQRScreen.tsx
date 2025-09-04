import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRoute, useNavigation } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface RouteParams {
  bookingData: {
    id: string
    food_id: string
    user_id: string
    status: string
    pickup_time: string | null
    notes?: string
    created_at: string
    food: {
      id: string
      title: string
      pickup_address: string
      pickup_time_start: string
      pickup_time_end: string
      profiles: {
        full_name: string
      }
    }
  }
}

export default function BookingQRScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { bookingData } = route.params as RouteParams

  // Generate QR code data
  const qrData = JSON.stringify({
    bookingId: bookingData.id,
    foodId: bookingData.food_id,
    userId: bookingData.user_id,
    status: bookingData.status,
    pickupTime: bookingData.pickup_time,
    createdAt: bookingData.created_at,
    foodTitle: bookingData.food.title,
    donorName: bookingData.food.profiles.full_name,
    pickupAddress: bookingData.food.pickup_address,
    timestamp: Date.now() // For verification
  })

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Bukti Booking SisaPlus\n\nMakanan: ${bookingData.food.title}\nDonatur: ${bookingData.food.profiles.full_name}\nAlamat Pickup: ${bookingData.food.pickup_address}\nWaktu Pickup: ${format(new Date(bookingData.food.pickup_time_start), 'dd MMM yyyy, HH:mm', { locale: id })} - ${format(new Date(bookingData.food.pickup_time_end), 'HH:mm', { locale: id })}\n\nBooking ID: ${bookingData.id}`,
        title: 'Bukti Booking SisaPlus'
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleSaveToGallery = () => {
    Alert.alert(
      'Simpan QR Code',
      'Fitur simpan ke galeri akan segera tersedia. Saat ini Anda bisa menggunakan screenshot untuk menyimpan QR code.',
      [{ text: 'OK' }]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Bukti Booking</Text>
        <TouchableOpacity onPress={handleShare} className="p-2 -mr-2">
          <Ionicons name="share-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Message */}
        <View className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center mr-3">
              <Ionicons name="checkmark" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-green-800 font-semibold text-base">Booking Berhasil!</Text>
              <Text className="text-green-600 text-sm mt-1">
                Tunjukkan QR code ini kepada donatur saat pengambilan makanan
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code */}
        <View className="mx-6 mt-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Text className="text-center text-lg font-bold text-gray-900 mb-4">
            QR Code Booking
          </Text>
          
          <View className="items-center justify-center p-6 bg-gray-50 rounded-xl">
            <QRCode
              value={qrData}
              size={200}
              color="#000000"
              backgroundColor="#ffffff"
            />
          </View>
          
          <Text className="text-center text-sm text-gray-500 mt-4">
            Booking ID: {bookingData.id}
          </Text>
          
          <TouchableOpacity
            onPress={handleSaveToGallery}
            className="mt-4 py-3 px-4 bg-blue-50 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="download-outline" size={20} color="#3b82f6" />
            <Text className="text-blue-600 font-medium ml-2">Simpan QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Booking Details */}
        <View className="mx-6 mt-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">Detail Booking</Text>
          
          {/* Food Info */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Makanan</Text>
            <Text className="text-base font-semibold text-gray-900">{bookingData.food.title}</Text>
          </View>
          
          {/* Donor Info */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Donatur</Text>
            <Text className="text-base font-semibold text-gray-900">{bookingData.food.profiles.full_name}</Text>
          </View>
          
          {/* Pickup Address */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Alamat Pickup</Text>
            <Text className="text-base text-gray-900">{bookingData.food.pickup_address}</Text>
          </View>
          
          {/* Pickup Time */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Waktu Pickup</Text>
            <Text className="text-base text-gray-900">
              {format(new Date(bookingData.food.pickup_time_start), 'dd MMM yyyy, HH:mm', { locale: id })} - {format(new Date(bookingData.food.pickup_time_end), 'HH:mm', { locale: id })}
            </Text>
          </View>
          
          {/* Status */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Status</Text>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${
                bookingData.status === 'confirmed' ? 'bg-green-500' :
                bookingData.status === 'pending' ? 'bg-yellow-500' :
                bookingData.status === 'completed' ? 'bg-blue-500' :
                'bg-gray-500'
              }`} />
              <Text className={`text-base font-medium ${
                bookingData.status === 'confirmed' ? 'text-green-600' :
                bookingData.status === 'pending' ? 'text-yellow-600' :
                bookingData.status === 'completed' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {bookingData.status === 'confirmed' ? 'Dikonfirmasi' :
                 bookingData.status === 'pending' ? 'Menunggu Konfirmasi' :
                 bookingData.status === 'completed' ? 'Selesai' :
                 bookingData.status}
              </Text>
            </View>
          </View>
          
          {/* Notes */}
          {bookingData.notes && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Catatan</Text>
              <Text className="text-base text-gray-900">{bookingData.notes}</Text>
            </View>
          )}
          
          {/* Booking Time */}
          <View>
            <Text className="text-sm text-gray-500 mb-1">Waktu Booking</Text>
            <Text className="text-base text-gray-900">
              {format(new Date(bookingData.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View className="mx-6 mt-6 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3b82f6" className="mt-0.5" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-800 font-semibold text-sm mb-2">Petunjuk Pengambilan:</Text>
              <Text className="text-blue-700 text-sm leading-5">
                1. Datang sesuai waktu yang telah ditentukan{"\n"}
                2. Tunjukkan QR code ini kepada donatur{"\n"}
                3. Donatur akan memverifikasi booking Anda{"\n"}
                4. Ambil makanan dan ucapkan terima kasih
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}