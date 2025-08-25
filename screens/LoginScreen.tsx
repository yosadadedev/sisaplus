import React, { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../store/authStore'
import { Ionicons } from '@expo/vector-icons'

export default function LoginScreen() {
  const { signInWithGoogle, loading, user, initialize, initialized } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle()
      
      if (error) {
        Alert.alert(
          'Error',
          error.message || 'Gagal masuk dengan Google. Silakan coba lagi.',
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert(
        'Error',
        'Terjadi kesalahan. Silakan coba lagi.',
        [{ text: 'OK' }]
      )
    }
  }

  if (!initialized) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="mt-4 text-gray-600">Memuat...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-secondary-50">
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo and Title */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-primary-500 rounded-full justify-center items-center mb-6 shadow-lg">
            <Ionicons name="restaurant" size={40} color="white" />
          </View>
          
          <Text className="text-4xl font-bold text-gray-800 mb-2">
            Sisa Plus
          </Text>
          
          <Text className="text-lg text-gray-600 text-center leading-6">
            Berbagi makanan,{"\n"}mengurangi limbah makanan
          </Text>
        </View>

        {/* Features */}
        <View className="w-full mb-12">
          <View className="flex-row items-center mb-4 px-4">
            <View className="w-8 h-8 bg-success-100 rounded-full justify-center items-center mr-3">
              <Ionicons name="heart" size={16} color="#22c55e" />
            </View>
            <Text className="text-gray-700 flex-1">
              Bantu sesama dengan berbagi makanan berlebih
            </Text>
          </View>
          
          <View className="flex-row items-center mb-4 px-4">
            <View className="w-8 h-8 bg-primary-100 rounded-full justify-center items-center mr-3">
              <Ionicons name="location" size={16} color="#0ea5e9" />
            </View>
            <Text className="text-gray-700 flex-1">
              Temukan makanan gratis di sekitar Anda
            </Text>
          </View>
          
          <View className="flex-row items-center px-4">
            <View className="w-8 h-8 bg-secondary-100 rounded-full justify-center items-center mr-3">
              <Ionicons name="leaf" size={16} color="#eab308" />
            </View>
            <Text className="text-gray-700 flex-1">
              Kurangi limbah makanan untuk lingkungan
            </Text>
          </View>
        </View>

        {/* Login Button */}
        <View className="w-full px-4">
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-gray-300 rounded-xl py-4 px-6 flex-row items-center justify-center shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0ea5e9" />
            ) : (
              <>
                <Image
                  source={{
                    uri: 'https://developers.google.com/identity/images/g-logo.png',
                  }}
                  className="w-5 h-5 mr-3"
                  resizeMode="contain"
                />
                <Text className="text-gray-700 font-semibold text-base">
                  Masuk dengan Google
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text className="text-xs text-gray-500 text-center mt-4 px-4">
            Dengan masuk, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}