import React, { useState } from 'react'
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
  Modal,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../store/authStore'
import { Ionicons } from '@expo/vector-icons'
import PhoneInput from '../components/PhoneInput'

const STATUS_OPTIONS = [
  { label: 'Pengusaha', value: 'entrepreneur', icon: 'business', color: '#ef4444' },
  { label: 'Mahasiswa', value: 'student', icon: 'school', color: '#3b82f6' },
  { label: 'Pekerja', value: 'employee', icon: 'briefcase', color: '#22c55e' },
  { label: 'Ibu Rumah Tangga', value: 'housewife', icon: 'home', color: '#f97316' },
  { label: 'Pensiunan', value: 'retired', icon: 'time', color: '#a855f7' },
  { label: 'Freelancer', value: 'freelancer', icon: 'laptop', color: '#06b6d4' },
  { label: 'Lainnya', value: 'others', icon: 'ellipsis-horizontal', color: '#6b7280' },
]

export default function RegisterScreen({ navigation }: any) {
  const { signUp, loading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [whatsapp, setWhatsapp] = useState('+62')
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Silakan masukkan nama lengkap Anda.')
      return false
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Silakan masukkan email Anda.')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Format email tidak valid.')
      return false
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Silakan masukkan password.')
      return false
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter.')
      return false
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok.')
      return false
    }

    if (!whatsapp.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor WhatsApp Anda.')
      return false
    }

    // Validasi WhatsApp (harus dimulai dengan +62 dan diikuti 8-12 digit)
    const whatsappRegex = /^\+62[0-9]{8,12}$/
    if (!whatsappRegex.test(whatsapp)) {
      Alert.alert('Error', 'Format WhatsApp tidak valid. Gunakan format +62xxxxxxxxxx')
      return false
    }

    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    try {
      const result = await signUp(email.trim(), password, fullName.trim(), whatsapp, address, status)
      
      if (!result.success) {
        Alert.alert(
          'Error',
          result.error || 'Gagal mendaftar. Silakan coba lagi.',
          [{ text: 'OK' }]
        )
      } else {
        Alert.alert(
          'Berhasil',
          'Akun berhasil dibuat! Kami telah mengirimkan magic link ke email Anda. Silakan cek email dan klik link untuk mengaktifkan akun.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        )
      }
    } catch (error) {
      console.error('Register error:', error)
      Alert.alert(
        'Error',
        'Terjadi kesalahan. Silakan coba lagi.',
        [{ text: 'OK' }]
      )
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-6 py-8">
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mr-4 p-2 -ml-2"
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800">
                  Daftar Akun
                </Text>
                <Text className="text-base text-gray-600 mt-1">
                  Bergabung dengan Sisa Plus
                </Text>
              </View>
            </View>

            {/* Register Form */}
            <View className="w-full mb-6">
              {/* Full Name Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </Text>
                <View className="relative">
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Masukkan nama lengkap Anda"
                    autoCapitalize="words"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <View className="absolute right-3 top-3">
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </View>

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
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Masukkan password (min. 6 karakter)"
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

              {/* Confirm Password Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Masukkan ulang password Anda"
                    secureTextEntry={!showConfirmPassword}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* WhatsApp Input */}
              <PhoneInput
                value={whatsapp}
                onChangeText={setWhatsapp}
                placeholder="812345678"
                label="WhatsApp"
                required
              />

              {/* Address Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </Text>
                <View className="relative">
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Masukkan alamat lengkap (opsional)"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <View className="absolute right-3 top-3">
                    <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </View>

              {/* Status Picker */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Status
                </Text>
                <TouchableOpacity
                  onPress={() => setShowStatusModal(true)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                >
                  <View className="flex-row items-center flex-1">
                    {status ? (
                      <>
                        <View 
                          className="w-8 h-8 rounded-full mr-3 justify-center items-center"
                          style={{ backgroundColor: STATUS_OPTIONS.find(opt => opt.value === status)?.color + '20' }}
                        >
                          <Ionicons 
                            name={STATUS_OPTIONS.find(opt => opt.value === status)?.icon as any} 
                            size={16} 
                            color={STATUS_OPTIONS.find(opt => opt.value === status)?.color} 
                          />
                        </View>
                        <Text className="text-gray-800 text-base">
                          {STATUS_OPTIONS.find(opt => opt.value === status)?.label}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="briefcase-outline" size={20} color="#9CA3AF" className="mr-3" />
                        <Text className="text-gray-400 text-base">Pilih status Anda</Text>
                      </>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
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
                    Daftar
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="items-center">
              <Text className="text-gray-600 text-base mb-2">
                Sudah punya akun?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text className="text-primary-500 font-semibold text-base">
                  Masuk Sekarang
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text className="text-xs text-gray-500 text-center mt-8 px-4">
              Dengan mendaftar, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Status Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-96">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Pilih Status</Text>
              <TouchableOpacity
                onPress={() => setShowStatusModal(false)}
                className="w-8 h-8 justify-center items-center"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Status List */}
            <FlatList
              data={STATUS_OPTIONS}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setStatus(item.value)
                    setShowStatusModal(false)
                  }}
                  className={`flex-row items-center p-4 rounded-xl mb-3 ${
                    status === item.value
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <View 
                    className="w-12 h-12 rounded-full mr-4 justify-center items-center"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={24} 
                      color={item.color} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${
                      status === item.value ? 'text-blue-600' : 'text-gray-800'
                    }`}>
                      {item.label}
                    </Text>
                  </View>
                  {status === item.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}