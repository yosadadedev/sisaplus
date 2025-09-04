import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useFoodStore } from '../store/foodStore'
import { useAuthStore } from '../store/authStore'

interface ScannedBookingData {
  bookingId: string
  foodId: string
  userId: string
  status: string
  pickupTime: string | null
  createdAt: string
  foodTitle: string
  donorName: string
  pickupAddress: string
  timestamp: number
}

export default function QRScannerScreen() {
  const navigation = useNavigation()
  const { updateBookingStatus } = useFoodStore()
  const { user } = useAuthStore()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [scannedData, setScannedData] = useState<ScannedBookingData | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true)
    
    try {
      const bookingData: ScannedBookingData = JSON.parse(data)
      
      // Validate QR code structure
      if (!bookingData.bookingId || !bookingData.foodId || !bookingData.userId) {
        Alert.alert(
          'QR Code Tidak Valid',
          'QR code yang dipindai bukan QR code booking SisaPlus yang valid.',
          [
            {
              text: 'Scan Lagi',
              onPress: () => setScanned(false)
            }
          ]
        )
        return
      }
      
      // Check if QR code is not too old (24 hours)
      const qrAge = Date.now() - bookingData.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      
      if (qrAge > maxAge) {
        Alert.alert(
          'QR Code Kedaluwarsa',
          'QR code ini sudah kedaluwarsa. Silakan minta receiver untuk generate QR code baru.',
          [
            {
              text: 'Scan Lagi',
              onPress: () => setScanned(false)
            }
          ]
        )
        return
      }
      
      setScannedData(bookingData)
      setShowVerificationModal(true)
      
    } catch (error) {
      Alert.alert(
        'QR Code Tidak Valid',
        'Format QR code tidak dapat dibaca. Pastikan ini adalah QR code booking SisaPlus.',
        [
          {
            text: 'Scan Lagi',
            onPress: () => setScanned(false)
          }
        ]
      )
    }
  }

  const handleVerifyBooking = async () => {
    if (!scannedData) return
    
    setIsVerifying(true)
    
    try {
      // Update booking status to completed
      await updateBookingStatus(scannedData.bookingId, 'completed')
      
      Alert.alert(
        'Verifikasi Berhasil!',
        'Booking telah diverifikasi dan makanan dapat diserahkan kepada receiver.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowVerificationModal(false)
              navigation.goBack()
            }
          }
        ]
      )
    } catch (error) {
      console.error('Verification error:', error)
      Alert.alert(
        'Error Verifikasi',
        'Terjadi kesalahan saat memverifikasi booking. Silakan coba lagi.',
        [{ text: 'OK' }]
      )
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRejectBooking = () => {
    Alert.alert(
      'Tolak Booking',
      'Apakah Anda yakin ingin menolak booking ini? Tindakan ini tidak dapat dibatalkan.',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Tolak',
          style: 'destructive',
          onPress: async () => {
            if (!scannedData) return
            
            setIsVerifying(true)
            try {
              await updateBookingStatus(scannedData.bookingId, 'cancelled')
              Alert.alert(
                'Booking Ditolak',
                'Booking telah ditolak.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setShowVerificationModal(false)
                      navigation.goBack()
                    }
                  }
                ]
              )
            } catch (error) {
              Alert.alert('Error', 'Terjadi kesalahan saat menolak booking.')
            } finally {
              setIsVerifying(false)
            }
          }
        }
      ]
    )
  }

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Meminta izin kamera...</Text>
      </SafeAreaView>
    )
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="camera-outline" size={64} color="#9ca3af" />
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
          Izin Kamera Diperlukan
        </Text>
        <Text className="text-gray-600 mt-2 text-center leading-6">
          Aplikasi memerlukan akses kamera untuk memindai QR code booking. Silakan berikan izin di pengaturan aplikasi.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-6 bg-blue-500 py-3 px-6 rounded-xl"
        >
          <Text className="text-white font-semibold">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-black">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white">Scan QR Code</Text>
        <View className="w-8" />
      </View>

      {/* Scanner */}
      <View className="flex-1 relative">
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ flex: 1 }}
        />
        
        {/* Scanner Overlay */}
        <View className="absolute inset-0 justify-center items-center">
          <View className="w-64 h-64 border-2 border-white rounded-2xl" />
          <Text className="text-white text-center mt-4 px-6">
            Arahkan kamera ke QR code booking untuk memverifikasi
          </Text>
        </View>
        
        {/* Scan Again Button */}
        {scanned && (
          <View className="absolute bottom-8 left-0 right-0 items-center">
            <TouchableOpacity
              onPress={() => setScanned(false)}
              className="bg-blue-500 py-3 px-6 rounded-xl"
            >
              <Text className="text-white font-semibold">Scan Lagi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Verification Modal */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
            <TouchableOpacity
              onPress={() => {
                setShowVerificationModal(false)
                setScanned(false)
              }}
              className="p-2 -ml-2"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Verifikasi Booking</Text>
            <View className="w-8" />
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            {scannedData && (
              <>
                {/* Status Card */}
                <View className="p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-6">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                      <Ionicons name="qr-code" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-blue-800 font-semibold text-base">QR Code Valid</Text>
                      <Text className="text-blue-600 text-sm mt-1">
                        Booking ditemukan dan siap untuk diverifikasi
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Booking Details */}
                <View className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-4">Detail Booking</Text>
                  
                  <View className="space-y-4">
                    <View>
                      <Text className="text-sm text-gray-500 mb-1">Booking ID</Text>
                      <Text className="text-base font-mono text-gray-900">{scannedData.bookingId}</Text>
                    </View>
                    
                    <View>
                      <Text className="text-sm text-gray-500 mb-1">Makanan</Text>
                      <Text className="text-base font-semibold text-gray-900">{scannedData.foodTitle}</Text>
                    </View>
                    
                    <View>
                      <Text className="text-sm text-gray-500 mb-1">Alamat Pickup</Text>
                      <Text className="text-base text-gray-900">{scannedData.pickupAddress}</Text>
                    </View>
                    
                    <View>
                      <Text className="text-sm text-gray-500 mb-1">Status Saat Ini</Text>
                      <View className="flex-row items-center">
                        <View className={`w-2 h-2 rounded-full mr-2 ${
                          scannedData.status === 'confirmed' ? 'bg-green-500' :
                          scannedData.status === 'pending' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`} />
                        <Text className={`text-base font-medium ${
                          scannedData.status === 'confirmed' ? 'text-green-600' :
                          scannedData.status === 'pending' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {scannedData.status === 'confirmed' ? 'Dikonfirmasi' :
                           scannedData.status === 'pending' ? 'Menunggu Konfirmasi' :
                           scannedData.status}
                        </Text>
                      </View>
                    </View>
                    
                    <View>
                      <Text className="text-sm text-gray-500 mb-1">Waktu Booking</Text>
                      <Text className="text-base text-gray-900">
                        {format(new Date(scannedData.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3">
                  <TouchableOpacity
                    onPress={handleVerifyBooking}
                    disabled={isVerifying}
                    className="bg-green-500 py-4 rounded-2xl justify-center items-center shadow-lg"
                    style={{
                      shadowColor: '#10b981',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    {isVerifying ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Verifikasi & Serahkan Makanan</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleRejectBooking}
                    disabled={isVerifying}
                    className="bg-red-500 py-4 rounded-2xl justify-center items-center"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="close-circle" size={20} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">Tolak Booking</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}