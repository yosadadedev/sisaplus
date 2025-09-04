// Melihat isi file ProfileScreen.tsx
import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../store/authStore'
import { useNavigation } from '@react-navigation/native'

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore()
  const navigation = useNavigation()

  const handleSignOut = async () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
            } catch (error) {
              console.error('Error signing out:', error)
              Alert.alert('Error', 'Gagal keluar dari akun')
            }
          },
        },
      ]
    )
  }

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profil',
      subtitle: 'Ubah informasi profil Anda',
      onPress: () => {
        navigation.navigate('EditProfile' as never)
      },
    },
    {
      icon: 'notifications-outline',
      title: 'Notifikasi',
      subtitle: 'Atur preferensi notifikasi',
      onPress: () => {
        // TODO: Navigate to notification settings
        Alert.alert('Info', 'Fitur pengaturan notifikasi akan segera hadir')
      },
    },
    {
      icon: 'qr-code-outline',
      title: 'Scan QR Code',
      subtitle: 'Verifikasi booking receiver',
      onPress: () => {
        (navigation as any).navigate('QRScanner')
      },
    },
    {
      icon: 'help-circle-outline',
      title: 'Bantuan',
      subtitle: 'FAQ dan dukungan pelanggan',
      onPress: () => {
        navigation.navigate('Help' as never)
      },
    },
    {
      icon: 'information-circle-outline',
      title: 'Tentang Aplikasi',
      subtitle: 'Versi dan informasi aplikasi',
      onPress: () => {
        Alert.alert(
          'Tentang SisaPlus',
          'SisaPlus v1.0.0\n\nAplikasi untuk berbagi makanan berlebih dan mengurangi food waste.\n\nDikembangkan dengan ❤️ untuk Indonesia.'
        )
      },
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-8 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Profil</Text>
          
          {/* User Info */}
          <View className="flex-row items-center mt-4">
            <View className="w-16 h-16 bg-primary-100 rounded-full justify-center items-center">
              <Ionicons name="person" size={32} color="#3b82f6" />
            </View>
            
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {user?.full_name || user?.email?.split('@')[0] || 'Pengguna'}
              </Text>
              <Text className="text-gray-600 text-sm">
                {user?.email}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-600 text-xs font-medium">Aktif</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white mt-4 mx-4 rounded-xl">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className={`flex-row items-center p-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center">
                <Ionicons name={item.icon as any} size={20} color="#6b7280" />
              </View>
              
              <View className="ml-4 flex-1">
                <Text className="text-gray-900 font-medium">{item.title}</Text>
                <Text className="text-gray-500 text-sm mt-0.5">{item.subtitle}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistics */}
        <View className="bg-white mt-4 mx-4 rounded-xl p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Statistik Anda</Text>
          
          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <View className="w-12 h-12 bg-green-100 rounded-full justify-center items-center mb-2">
                <Ionicons name="gift-outline" size={24} color="#22c55e" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-gray-600 text-sm text-center">Makanan Dibagikan</Text>
            </View>
            
            <View className="flex-1 items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full justify-center items-center mb-2">
                <Ionicons name="heart-outline" size={24} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-gray-600 text-sm text-center">Makanan Diterima</Text>
            </View>
            
            <View className="flex-1 items-center">
              <View className="w-12 h-12 bg-yellow-100 rounded-full justify-center items-center mb-2">
                <Ionicons name="star-outline" size={24} color="#f59e0b" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">5.0</Text>
              <Text className="text-gray-600 text-sm text-center">Rating Anda</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <View className="mx-4 mt-6 mb-8">
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-600 font-semibold ml-2">Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}