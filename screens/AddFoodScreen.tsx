import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFoodStore } from '../store/foodStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface FormData {
  title: string;
  description: string;
  category: string;
  quantity: string;
  location: string;
  expired_at: Date | null;
  price_type: 'free' | 'paid';
  price: string;
  image_urls: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  quantity?: string;
  location?: string;
  expired_at?: string;
  price?: string;
}

const CATEGORIES = [
  { label: 'Makanan Utama', value: 'main-course', icon: 'restaurant', color: '#ef4444' },
  { label: 'Makanan Ringan', value: 'snacks', icon: 'fast-food', color: '#f97316' },
  { label: 'Minuman', value: 'beverages', icon: 'wine', color: '#3b82f6' },
  { label: 'Buah-buahan', value: 'fruits', icon: 'nutrition', color: '#22c55e' },
  { label: 'Sayuran', value: 'vegetables', icon: 'leaf', color: '#16a34a' },
  { label: 'Roti & Kue', value: 'bakery', icon: 'cafe', color: '#a855f7' },
  { label: 'Lainnya', value: 'others', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

export default function AddFoodScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { createFood, isLoading } = useFoodStore();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    quantity: '',
    location: '',
    expired_at: null, // Default kosong (wajib diisi)
    price_type: 'free',
    price: '',
    image_urls: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    // Request permissions on component mount
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Request camera and media library permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Izin Diperlukan',
        'Aplikasi memerlukan izin kamera dan galeri untuk mengunggah foto makanan.',
        [{ text: 'OK' }]
      );
    }

    // Request location permission
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      Alert.alert(
        'Izin Lokasi',
        'Aplikasi memerlukan izin lokasi untuk menentukan posisi makanan.',
        [{ text: 'OK' }]
      );
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Nama makanan wajib diisi';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Nama makanan minimal 3 karakter';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Deskripsi minimal 10 karakter';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Kategori wajib dipilih';
    }

    // Quantity validation
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Jumlah porsi wajib diisi';
    } else {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.quantity = 'Jumlah porsi harus berupa angka positif';
      } else if (quantity > 100) {
        newErrors.quantity = 'Jumlah porsi maksimal 100';
      }
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Lokasi wajib diisi';
    } else if (formData.location.trim().length < 5) {
      newErrors.location = 'Lokasi minimal 5 karakter';
    }

    // Expiry date validation
    if (!formData.expired_at) {
      newErrors.expired_at = 'Waktu kedaluwarsa wajib diisi';
    } else {
      const now = new Date();
      const minExpiry = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
      const maxExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      if (formData.expired_at <= minExpiry) {
        newErrors.expired_at = 'Waktu kedaluwarsa minimal 30 menit dari sekarang';
      } else if (formData.expired_at > maxExpiry) {
        newErrors.expired_at = 'Waktu kedaluwarsa maksimal 7 hari dari sekarang';
      }
    }

    // Price validation
    if (formData.price_type === 'paid') {
      if (!formData.price.trim()) {
        newErrors.price = 'Harga wajib diisi untuk makanan berbayar';
      } else {
        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
          newErrors.price = 'Harga harus berupa angka positif';
        } else if (price > 1000000) {
          newErrors.price = 'Harga maksimal Rp 1.000.000';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (field !== 'image_urls' && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagePicker = () => {
    Alert.alert('Pilih Foto', 'Pilih sumber foto untuk makanan Anda', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Kamera', onPress: () => pickImage('camera') },
      { text: 'Galeri', onPress: () => pickImage('library') },
    ]);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      setImageLoading(true);

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        const newImageUrl = result.assets[0].uri;
        setFormData((prev) => {
          const currentImages = prev.image_urls;
          if (currentImages.length >= 3) {
            Alert.alert('Batas Maksimal', 'Maksimal 3 foto yang dapat diunggah');
            return prev;
          }
          return { ...prev, image_urls: [...currentImages, newImageUrl] };
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Gagal memilih foto. Silakan coba lagi.');
    } finally {
      setImageLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Izin lokasi diperlukan untuk mendapatkan lokasi saat ini.', [
          { text: 'OK' },
        ]);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        const { street, city, region, postalCode } = address[0];
        const formattedAddress = [street, city, region, postalCode].filter(Boolean).join(', ');

        setFormData((prev) => ({ ...prev, location: formattedAddress }));
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Gagal mendapatkan lokasi. Silakan masukkan lokasi secara manual.', [
        { text: 'OK' },
      ]);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Form Tidak Valid', 'Silakan periksa kembali data yang Anda masukkan.', [
        { text: 'OK' },
      ]);
      return;
    }

    if (!formData.expired_at) {
      Alert.alert('Error', 'Waktu kadaluarsa wajib diisi');
      return;
    }

    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const foodData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        unit: 'porsi',
        pickup_address: formData.location.trim(),
        pickup_time_start: new Date().toISOString(),
        pickup_time_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        dietary_info: null,
        allergen_info: null,
        preparation_notes: null,
        price_type: formData.price_type,
        price: formData.price_type === 'paid' ? parseFloat(formData.price) : null,
        is_featured: false,
        view_count: 0,
        donor_id: user.id,
        expired_at: formData.expired_at.toISOString(),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        location: formData.location.trim(),
        distance_km: 0,
        status: 'available' as const,
        profiles: {
          full_name: user.full_name || 'Unknown',
          avatar_url: undefined,
        },
      };

      await createFood(foodData);

      Alert.alert(
        'Berhasil!',
        'Makanan berhasil ditambahkan dan akan segera tersedia untuk dipesan.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.', [{ text: 'OK' }]);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentTime = formData.expired_at || new Date();
      const newDate = new Date(currentTime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      handleInputChange('expired_at', newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = formData.expired_at || new Date();
      const newDate = new Date(currentDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      handleInputChange('expired_at', newDate);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-800">Tambah Makanan</Text>

        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Image Upload */}
        <View className="mb-6">
          <Text className="mb-3 font-medium text-gray-700">Foto Makanan (Maksimal 3)</Text>

          {formData.image_urls.length > 0 ? (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                {formData.image_urls.map((uri, index) => (
                  <View key={index} className="relative mr-3">
                    <Image source={{ uri }} className="h-24 w-24 rounded-xl" resizeMode="cover" />
                    <TouchableOpacity
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          image_urls: prev.image_urls.filter((_, i) => i !== index),
                        }));
                      }}
                      className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-red-500">
                      <Ionicons name="close" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {formData.image_urls.length < 3 && (
                <TouchableOpacity
                  onPress={handleImagePicker}
                  disabled={imageLoading}
                  className="h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-100">
                  {imageLoading ? (
                    <ActivityIndicator size="small" color="#0ea5e9" />
                  ) : (
                    <Ionicons name="add" size={24} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleImagePicker}
              disabled={imageLoading}
              className="h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-100">
              {imageLoading ? (
                <ActivityIndicator size="large" color="#0ea5e9" />
              ) : (
                <View className="items-center">
                  <Ionicons name="camera" size={48} color="#9ca3af" />
                  <Text className="mt-2 text-center text-gray-500">Ketuk untuk menambah foto</Text>
                  <Text className="mt-1 text-center text-sm text-gray-400">(Opsional)</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <View className="mb-4">
          <Text className="mb-2 font-medium text-gray-700">Nama Makanan *</Text>
          <TextInput
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Contoh: Nasi Gudeg Jogja"
            className={`rounded-xl bg-gray-50 p-4 text-gray-800 ${
              errors.title ? 'border border-red-500' : ''
            }`}
          />
          {errors.title && <Text className="mt-1 text-sm text-red-500">{errors.title}</Text>}
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="mb-2 font-medium text-gray-700">Deskripsi *</Text>
          <TextInput
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Jelaskan kondisi makanan, rasa, dan informasi lainnya..."
            multiline
            numberOfLines={4}
            className={`rounded-xl bg-gray-50 p-4 text-gray-800 ${
              errors.description ? 'border border-red-500' : ''
            }`}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text className="mt-1 text-sm text-red-500">{errors.description}</Text>
          )}
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="mb-2 font-medium text-gray-700">Kategori *</Text>
          <TouchableOpacity
            onPress={() => setShowCategoryModal(true)}
            className={`flex-row items-center justify-between rounded-xl bg-gray-50 p-4 ${
              errors.category ? 'border border-red-500' : ''
            }`}>
            <View className="flex-1 flex-row items-center">
              {formData.category ? (
                <>
                  <View
                    className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        CATEGORIES.find((cat) => cat.value === formData.category)?.color + '20',
                    }}>
                    <Ionicons
                      name={CATEGORIES.find((cat) => cat.value === formData.category)?.icon as any}
                      size={16}
                      color={CATEGORIES.find((cat) => cat.value === formData.category)?.color}
                    />
                  </View>
                  <Text className="font-medium text-gray-800">
                    {CATEGORIES.find((cat) => cat.value === formData.category)?.label}
                  </Text>
                </>
              ) : (
                <>
                  <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                    <Ionicons name="apps" size={16} color="#9ca3af" />
                  </View>
                  <Text className="text-gray-500">Pilih Kategori</Text>
                </>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
          {errors.category && <Text className="mt-1 text-sm text-red-500">{errors.category}</Text>}
        </View>

        {/* Quantity */}
        <View className="mb-4">
          <Text className="mb-2 font-medium text-gray-700">Jumlah Porsi *</Text>
          <TextInput
            value={formData.quantity}
            onChangeText={(value) => handleInputChange('quantity', value)}
            placeholder="Contoh: 5"
            keyboardType="numeric"
            className={`rounded-xl bg-gray-50 p-4 text-gray-800 ${
              errors.quantity ? 'border border-red-500' : ''
            }`}
          />
          {errors.quantity && <Text className="mt-1 text-sm text-red-500">{errors.quantity}</Text>}
        </View>

        {/* Price Options */}
        <View className="mb-4">
          <Text className="mb-3 font-medium text-gray-700">Opsi Harga *</Text>

          <View className="mb-3 flex-row space-x-3">
            <TouchableOpacity
              onPress={() => handleInputChange('price_type', 'free')}
              className={`flex-1 flex-row items-center justify-center rounded-xl border-2 p-4 ${
                formData.price_type === 'free'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
              <Ionicons
                name="gift"
                size={20}
                color={formData.price_type === 'free' ? '#22c55e' : '#9ca3af'}
              />
              <Text
                className={`ml-2 font-medium ${
                  formData.price_type === 'free' ? 'text-green-700' : 'text-gray-600'
                }`}>
                Gratis
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleInputChange('price_type', 'paid')}
              className={`flex-1 flex-row items-center justify-center rounded-xl border-2 p-4 ${
                formData.price_type === 'paid'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
              <Ionicons
                name="cash"
                size={20}
                color={formData.price_type === 'paid' ? '#3b82f6' : '#9ca3af'}
              />
              <Text
                className={`ml-2 font-medium ${
                  formData.price_type === 'paid' ? 'text-blue-700' : 'text-gray-600'
                }`}>
                Berbayar
              </Text>
            </TouchableOpacity>
          </View>

          {formData.price_type === 'paid' && (
            <View>
              <Text className="mb-2 font-medium text-gray-700">Harga (Rp) *</Text>
              <TextInput
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                placeholder="Contoh: 15000"
                keyboardType="numeric"
                className={`rounded-xl bg-gray-50 p-4 text-gray-800 ${
                  errors.price ? 'border border-red-500' : ''
                }`}
              />
              {errors.price && <Text className="mt-1 text-sm text-red-500">{errors.price}</Text>}
            </View>
          )}
        </View>

        {/* Location */}
        <View className="mb-4">
          <Text className="mb-2 font-medium text-gray-700">Lokasi Pengambilan *</Text>
          <View className="flex-row space-x-2">
            <TextInput
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="Alamat lengkap untuk pengambilan"
              className={`flex-1 rounded-xl bg-gray-50 p-4 text-gray-800 ${
                errors.location ? 'border border-red-500' : ''
              }`}
            />
            <TouchableOpacity
              onPress={getCurrentLocation}
              disabled={locationLoading}
              className="items-center justify-center rounded-xl bg-primary-500 px-4">
              {locationLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="location" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
          {errors.location && <Text className="mt-1 text-sm text-red-500">{errors.location}</Text>}
        </View>

        {/* Expiry Date & Time */}
        <View className="mb-6">
          <Text className="mb-2 font-medium text-gray-700">Waktu Kedaluwarsa *</Text>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className={`flex-1 rounded-xl bg-gray-50 p-4 ${
                errors.expired_at ? 'border border-red-500' : ''
              }`}>
              <Text className={`${formData.expired_at ? 'text-gray-800' : 'text-gray-400'}`}>
                {formData.expired_at
                  ? format(formData.expired_at, 'dd MMM yyyy', { locale: id })
                  : 'Pilih tanggal'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className={`flex-1 rounded-xl bg-gray-50 p-4 ${
                errors.expired_at ? 'border border-red-500' : ''
              }`}>
              <Text className={`${formData.expired_at ? 'text-gray-800' : 'text-gray-400'}`}>
                {formData.expired_at ? format(formData.expired_at, 'HH:mm') : 'Pilih waktu'}
              </Text>
            </TouchableOpacity>
          </View>

          {errors.expired_at && (
            <Text className="mt-1 text-sm text-red-500">{errors.expired_at}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          className="mb-8 items-center justify-center rounded-xl bg-primary-500 py-4">
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-lg font-semibold text-white">Tambah Makanan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-96 rounded-t-3xl bg-white p-6">
            {/* Modal Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-800">Pilih Kategori</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                className="h-8 w-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Category List */}
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    handleInputChange('category', item.value);
                    setShowCategoryModal(false);
                  }}
                  className={`mb-3 flex-row items-center rounded-xl p-4 ${
                    formData.category === item.value
                      ? 'border border-primary-200 bg-primary-50'
                      : 'bg-gray-50'
                  }`}>
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: item.color + '20' }}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        formData.category === item.value ? 'text-primary-800' : 'text-gray-800'
                      }`}>
                      {item.label}
                    </Text>
                  </View>
                  {formData.category === item.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#0ea5e9" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.expired_at || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={formData.expired_at || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </SafeAreaView>
  );
}
