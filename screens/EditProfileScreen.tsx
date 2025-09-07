import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileForm {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuthStore();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EditProfileForm>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // const pickImage = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert('Error', 'Izin akses galeri diperlukan untuk mengubah foto profil');
  //     return;
  //   }

  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.8,
  //   });

  //   if (!result.canceled) {
  //     setAvatarUri(result.assets[0].uri);
  //   }
  // };

  // const takePhoto = async () => {
  //   const { status } = await ImagePicker.requestCameraPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert('Error', 'Izin akses kamera diperlukan untuk mengambil foto');
  //     return;
  //   }

  //   const result = await ImagePicker.launchCameraAsync({
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.8,
  //   });

  //   if (!result.canceled) {
  //     setAvatarUri(result.assets[0].uri);
  //   }
  // };

  // const showImagePicker = () => {
  //   Alert.alert('Pilih Foto', 'Pilih sumber foto profil', [
  //     {
  //       text: 'Galeri',
  //       onPress: pickImage,
  //     },
  //     {
  //       text: 'Kamera',
  //       onPress: takePhoto,
  //     },
  //     {
  //       text: 'Batal',
  //       style: 'cancel',
  //     },
  //   ]);
  // };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Nama lengkap wajib diisi');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email wajib diisi');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Format email tidak valid');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateProfile({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });

      Alert.alert('Berhasil!', 'Profil berhasil diperbarui', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Edit Profil</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          className="rounded-lg bg-primary-500 px-4 py-2">
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="font-medium text-white">Simpan</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View className="items-center py-8">
          <TouchableOpacity onPress={() => {}} className="relative">
            <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={40} color="#9CA3AF" />
              )}
            </View>
            {/* <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-500">
              <Ionicons name="camera" size={16} color="white" />
            </View> */}
          </TouchableOpacity>
          {/* <Text className="mt-2 text-sm text-gray-600">Ketuk untuk mengubah foto</Text> */}
        </View>

        {/* Form Fields */}
        <View className="space-y-6 px-4">
          {/* Full Name */}
          <View className='mb-4'>
            <Text className="mb-2 font-medium text-gray-700">Nama Lengkap *</Text>
            <TextInput
              value={formData.full_name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, full_name: text }))}
              placeholder="Masukkan nama lengkap"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View className='mb-4'>
            <Text className="mb-2 font-medium text-gray-700">Email *</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
              placeholder="Masukkan email"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 bg-gray-100"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
          </View>

          {/* Phone */}
          <View className='mb-4'>
            <Text className="mb-2 font-medium text-gray-700">Nomor Telepon</Text>
            <TextInput
              value={formData.phone}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
              placeholder="Masukkan nomor telepon"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View>
            <Text className="mb-2 font-medium text-gray-700">Alamat</Text>
            <TextInput
              value={formData.address}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
              placeholder="Masukkan alamat lengkap"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
