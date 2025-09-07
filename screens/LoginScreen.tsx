import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';
import { Ionicons } from '@expo/vector-icons';
import ConfirmationModal from '../components/ConfirmationModal';
import ErrorModal from '../components/ErrorModal';

export default function LoginScreen({ navigation }: any) {
  const { signInWithEmail, loading, initialize, initialized } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Silakan masukkan email dan password.');
      setShowErrorModal(true);
      return;
    }

    try {
      const { error } = await signInWithEmail(email.trim(), password);

      if (error) {
        setErrorMessage(error.message || 'Email atau password salah. Silakan coba lagi.');
        setShowErrorModal(true);
      } else {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
      setShowErrorModal(true);
    }
  };

  if (!initialized) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="mt-4 text-gray-600">Memuat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center px-6 py-8">
            {/* Logo and Title */}
            <View className="mb-8 items-center">
              <Logo size={96} className="mb-4" />

              <Text className="mb-2 text-3xl font-bold text-gray-800">Sisa Plus</Text>

              <Text className="text-center text-base text-gray-600">Masuk ke akun Anda</Text>
            </View>

            {/* Login Form */}
            <View className="mb-6 w-full">
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
              <View className="mb-6">
                <Text className="mb-2 text-sm font-medium text-gray-700">Password</Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Masukkan password Anda"
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

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleEmailSignIn}
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
                  <Text className="text-base font-semibold text-white">Masuk</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="items-center">
              <Text className="mb-2 text-base text-gray-600">Belum punya akun?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
                <Text className="text-base font-semibold text-primary-500">Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text className="mt-8 px-4 text-center text-xs text-gray-500">
              Dengan masuk, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <ConfirmationModal
        visible={showSuccessModal}
        title="Berhasil!"
        message="Login berhasil! Selamat datang di Sisa Plus."
        confirmText="OK"
        onConfirm={() => {
          setShowSuccessModal(false);
        }}
        type="success"
      />

      {/* Error Modal */}
      {showErrorModal &&
        <ErrorModal
          visible={showErrorModal}
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      }
    </SafeAreaView>
  );
}
