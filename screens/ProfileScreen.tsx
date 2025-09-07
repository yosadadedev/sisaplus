// Melihat isi file ProfileScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, signOut, initialize } = useAuthStore();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // Refetch user data when screen is focused
      initialize();
    }
  }, [isFocused, initialize]);

  const handleSignOut = async () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
      {
        text: 'Batal',
        style: 'cancel',
      },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Gagal keluar dari akun');
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profil',
      subtitle: 'Ubah informasi profil Anda',
      onPress: () => {
        navigation.navigate('EditProfile' as never);
      },
    },
    {
      icon: 'notifications-outline',
      title: 'Notifikasi',
      subtitle: 'Atur preferensi notifikasi',
      onPress: () => {
        // TODO: Navigate to notification settings
        Alert.alert('Info', 'Fitur pengaturan notifikasi akan segera hadir');
      },
    },
    {
      icon: 'help-circle-outline',
      title: 'Bantuan',
      subtitle: 'FAQ dan dukungan pelanggan',
      onPress: () => {
        navigation.navigate('Help' as never);
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
        );
      },
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-6 py-8">
          <Text className="mb-2 text-2xl font-bold text-gray-900">Profil</Text>

          {/* User Info */}
          <View className="mt-4 flex-row items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Ionicons name="person" size={32} color="#3b82f6" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {user?.full_name || user?.email?.split('@')[0] || 'Pengguna'}
              </Text>
              <Text className="text-sm text-gray-600">{user?.email}</Text>
              <View className="mt-1 flex-row items-center">
                <View className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                <Text className="text-xs font-medium text-green-600">Aktif</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mx-4 mt-4 rounded-xl bg-white">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className={`flex-row items-center p-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name={item.icon as any} size={20} color="#6b7280" />
              </View>

              <View className="ml-4 flex-1">
                <Text className="font-medium text-gray-900">{item.title}</Text>
                <Text className="mt-0.5 text-sm text-gray-500">{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistics */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-4">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Statistik Anda</Text>

          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Ionicons name="gift-outline" size={24} color="#22c55e" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-center text-sm text-gray-600">Makanan Dibagikan</Text>
            </View>

            <View className="flex-1 items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name="heart-outline" size={24} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-center text-sm text-gray-600">Makanan Diterima</Text>
            </View>

            <View className="flex-1 items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <Ionicons name="star-outline" size={24} color="#f59e0b" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">5.0</Text>
              <Text className="text-center text-sm text-gray-600">Rating Anda</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <View className="mx-4 mb-8 mt-6">
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 p-4">
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="ml-2 font-semibold text-red-600">Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
