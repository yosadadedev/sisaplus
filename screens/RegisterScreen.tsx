import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import PhoneInput from '../components/PhoneInput';
import ConfirmationModal from '../components/ConfirmationModal';
import ErrorModal from '../components/ErrorModal';

const STATUS_OPTIONS = [
  { label: 'Pengusaha', value: 'entrepreneur', icon: 'business', color: '#ef4444' },
  { label: 'Mahasiswa', value: 'student', icon: 'school', color: '#3b82f6' },
  { label: 'Pekerja', value: 'employee', icon: 'briefcase', color: '#22c55e' },
  { label: 'Ibu Rumah Tangga', value: 'housewife', icon: 'home', color: '#f97316' },
  { label: 'Pensiunan', value: 'retired', icon: 'time', color: '#a855f7' },
  { label: 'Freelancer', value: 'freelancer', icon: 'laptop', color: '#06b6d4' },
  { label: 'Lainnya', value: 'others', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

export default function RegisterScreen({ navigation }: any) {
  const { signUp, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+62');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (!fullName.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      setShowErrorModal(true);
      return false;
    }

    if (!email.trim()) {
      setErrorMessage('Silakan masukkan email Anda.');
      setShowErrorModal(true);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Format email tidak valid.');
      setShowErrorModal(true);
      return false;
    }

    if (!password.trim()) {
      setErrorMessage('Silakan masukkan password.');
      setShowErrorModal(true);
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      setShowErrorModal(true);
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      setShowErrorModal(true);
      return false;
    }

    if (!whatsapp.trim()) {
      setErrorMessage('Silakan masukkan nomor WhatsApp Anda.');
      setShowErrorModal(true);
      return false;
    }

    // Validasi WhatsApp (harus dimulai dengan +62 dan diikuti 8-12 digit)
    const whatsappRegex = /^\+62[0-9]{8,12}$/;
    if (!whatsappRegex.test(whatsapp)) {
      setErrorMessage('Format WhatsApp tidak valid. Gunakan format +62xxxxxxxxxx');
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const result = await signUp(
        email.trim(),
        password,
        fullName.trim(),
        whatsapp,
        address,
        status
      );

      if (!result.success) {
        setErrorMessage(result.error || 'Gagal mendaftar. Silakan coba lagi.');
        setShowErrorModal(true);
      } else {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Register error:', error);
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-6 py-8">
            {/* Header */}
            <View className="mb-8 flex-row items-center">
              <TouchableOpacity onPress={() => navigation.goBack()} className="-ml-2 mr-4 p-2">
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800">Daftar Akun</Text>
                <Text className="mt-1 text-base text-gray-600">Bergabung dengan Sisa Plus</Text>
              </View>
            </View>

            {/* Register Form */}
            <View className="mb-6 w-full">
              {/* Full Name Input */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Nama Lengkap</Text>
                <View className="relative">
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Masukkan nama lengkap Anda"
                    autoCapitalize="words"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <View className="absolute right-3 top-3">
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Email</Text>
                <View className="relative">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Masukkan email Anda"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <View className="absolute right-3 top-3">
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Password</Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Masukkan password (min. 6 karakter)"
                    secureTextEntry={!showPassword}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3">
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Konfirmasi Password</Text>
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Masukkan ulang password Anda"
                    secureTextEntry={!showConfirmPassword}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3">
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
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
                <Text className="mb-2 text-sm font-medium text-gray-700">Alamat</Text>
                <View className="relative">
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Masukkan alamat lengkap (opsional)"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                  <View className="absolute right-3 top-3">
                    <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </View>

              {/* Status Picker */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-medium text-gray-700">Status</Text>
                <TouchableOpacity
                  onPress={() => setShowStatusModal(true)}
                  className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <View className="flex-1 flex-row items-center">
                    {status ? (
                      <>
                        <View
                          className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                          style={{
                            backgroundColor:
                              STATUS_OPTIONS.find((opt) => opt.value === status)?.color + '20',
                          }}>
                          <Ionicons
                            name={STATUS_OPTIONS.find((opt) => opt.value === status)?.icon as any}
                            size={16}
                            color={STATUS_OPTIONS.find((opt) => opt.value === status)?.color}
                          />
                        </View>
                        <Text className="text-base text-gray-800">
                          {STATUS_OPTIONS.find((opt) => opt.value === status)?.label}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons
                          name="briefcase-outline"
                          size={20}
                          color="#9CA3AF"
                          className="mr-3"
                        />
                        <Text className="text-base text-gray-400">Pilih status Anda</Text>
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
                className="w-full items-center justify-center rounded-xl bg-primary-500 px-6 py-4 shadow-sm"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-base font-semibold text-white">Daftar</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="items-center">
              <Text className="mb-2 text-base text-gray-600">Sudah punya akun?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
                <Text className="text-base font-semibold text-primary-500">Masuk Sekarang</Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text className="mt-8 px-4 text-center text-xs text-gray-500">
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
        onRequestClose={() => setShowStatusModal(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-96 rounded-t-3xl bg-white p-6">
            {/* Modal Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-800">Pilih Status</Text>
              <TouchableOpacity
                onPress={() => setShowStatusModal(false)}
                className="h-8 w-8 items-center justify-center">
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
                    setStatus(item.value);
                    setShowStatusModal(false);
                  }}
                  className={`mb-3 flex-row items-center rounded-xl p-4 ${
                    status === item.value ? 'border border-blue-200 bg-blue-50' : 'bg-gray-50'
                  }`}>
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: item.color + '20' }}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
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

      {/* Success Modal */}
      <ConfirmationModal
        visible={showSuccessModal}
        title="Berhasil!"
        message="Akun berhasil dibuat! Kami telah mengirimkan magic link ke email Anda. Silakan cek email dan klik link untuk mengaktifkan akun."
        confirmText="OK"
        onConfirm={() => {
          setShowSuccessModal(false);
          navigation.navigate('Login');
        }}
        type="success"
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </SafeAreaView>
  );
}
