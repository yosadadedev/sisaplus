import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/Logo'
import { Ionicons } from '@expo/vector-icons'

export default function LoginScreen({ navigation }: any) {
  const { signInWithEmail, loading, initialize, initialized } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Error',
        'Silakan masukkan email dan password.',
        [{ text: 'OK' }]
      )
      return
    }

    try {
      const { error } = await signInWithEmail(email.trim(), password)
      
      if (error) {
        Alert.alert(
          'Error',
          error.message || 'Email atau password salah. Silakan coba lagi.',
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
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="mt-4 text-gray-600">Memuat...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center px-6 py-8">
            {/* Logo and Title */}
            <View className="items-center mb-8">
              <Logo size={96} className="mb-4" />
              
              <Text className="text-3xl font-bold text-gray-800 mb-2">
                Sisa Plus
              </Text>
              
              <Text className="text-base text-gray-600 text-center">
                Masuk ke akun Anda
              </Text>
            </View>

            {/* Login Form */}
            <View className="w-full mb-6">
              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>
                <View className="relative">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Masukkan email Anda"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <View className="absolute right-3 top-3">
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Masukkan password Anda"
                    secureTextEntry={!showPassword}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleEmailSignIn}
                disabled={loading}
                className="w-full bg-primary-500 rounded-xl py-4 px-6 items-center justify-center shadow-sm"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Masuk
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="items-center">
              <Text className="text-gray-600 text-base mb-2">
                Belum punya akun?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
              >
                <Text className="text-primary-500 font-semibold text-base">
                  Daftar Sekarang
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text className="text-xs text-gray-500 text-center mt-8 px-4">
              Dengan masuk, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}