import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFoodStore } from '../store/foodStore';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { WebView } from 'react-native-webview';

interface RouteParams {
  foodId: string;
}

export default function FoodDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { foodId } = route.params as RouteParams;
  const { user } = useAuthStore();
  const { foods, bookFood, isLoading } = useFoodStore();

  const [food, setFood] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    const foundFood = foods.find((f) => f.id === foodId);
    setFood(foundFood);
  }, [foodId, foods]);

  const handleBookFood = async () => {
    if (!food || !user) return;

    try {
      setBookingLoading(true);
      await bookFood(food.id, user.id, bookingMessage);

      Alert.alert('Berhasil!', 'Makanan berhasil dipesan. Donor akan segera menghubungi Anda.', [
        {
          text: 'OK',
          onPress: () => {
            setShowBookingModal(false);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memesan makanan. Silakan coba lagi.', [
        { text: 'OK' },
      ]);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactDonor = () => {
    if (!food?.profiles?.phone) {
      Alert.alert('Info', 'Nomor telepon donor tidak tersedia.', [{ text: 'OK' }]);
      return;
    }

    Alert.alert('Hubungi Donor', `Hubungi ${food.profiles.full_name} melalui WhatsApp?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'WhatsApp',
        onPress: () => {
          const message = `Halo, saya tertarik dengan makanan "${food.title}" yang Anda bagikan di Sisa Plus.`;
          const url = `whatsapp://send?phone=${food.profiles.phone}&text=${encodeURIComponent(message)}`;
          Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'WhatsApp tidak terinstall di perangkat Anda.');
          });
        },
      },
    ]);
  };

  const handleGetDirections = () => {
    if (!food?.latitude || !food?.longitude) {
      Alert.alert('Info', 'Lokasi tidak tersedia.', [{ text: 'OK' }]);
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${food.latitude},${food.longitude}`;
    setMapUrl(url);
    setShowWebView(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success-500';
      case 'booked':
        return 'bg-secondary-500';
      case 'completed':
        return 'bg-gray-500';
      case 'expired':
        return 'bg-danger-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'booked':
        return 'Sudah Dipesan';
      case 'completed':
        return 'Selesai';
      case 'expired':
        return 'Kedaluwarsa';
      default:
        return status;
    }
  };

  const isExpired = food && new Date(food.expired_at) < new Date();
  const isOwner = food && user && food.donor_id === user.id;
  const canBook = food && food.status === 'available' && !isExpired && !isOwner;

  if (!food) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="mt-4 text-gray-600">Memuat detail makanan...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-6 py-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-gray-900">Detail Makanan</Text>

        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name="share-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View className="mx-6 mt-4 h-80 overflow-hidden rounded-2xl bg-gray-100">
          {food.image_url ? (
            <Image source={{ uri: food.image_url }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                <Ionicons name="image" size={32} color="#9ca3af" />
              </View>
              <Text className="font-medium text-gray-500">Tidak ada foto</Text>
            </View>
          )}
        </View>

        <View className="px-6 py-6">
          {/* Status Badge */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className={`rounded-full px-4 py-2 ${getStatusColor(food.status)}`}>
              <Text className="text-sm font-semibold text-white">{getStatusText(food.status)}</Text>
            </View>

            {isExpired && (
              <View className="rounded-full bg-red-100 px-4 py-2">
                <Text className="text-sm font-semibold text-red-700">Kedaluwarsa</Text>
              </View>
            )}
          </View>

          {/* Title and Description */}
          <Text className="mb-3 text-3xl font-bold text-gray-900">{food.title}</Text>

          <Text className="mb-8 text-lg leading-7 text-gray-600">{food.description}</Text>

          {/* Info Cards */}
          <View className="mb-8">
            {/* Quick Info Row */}
            <View className="mb-6 flex-row">
              <View className="mr-3 flex-1 rounded-2xl bg-blue-50 p-4">
                <View className="mb-2 flex-row items-center">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                    <Ionicons name="restaurant" size={16} color="white" />
                  </View>
                  <Text className="ml-2 text-sm font-semibold text-blue-900">Porsi</Text>
                </View>
                <Text className="text-xl font-bold text-blue-800">{food.quantity}</Text>
              </View>

              <View className="flex-1 rounded-2xl bg-purple-50 p-4">
                <View className="mb-2 flex-row items-center">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                    <Ionicons name="pricetag" size={16} color="white" />
                  </View>
                  <Text className="ml-2 text-sm font-semibold text-purple-900">Kategori</Text>
                </View>
                <Text className="text-sm font-bold capitalize text-purple-800" numberOfLines={1}>
                  {food.category ? food.category.replace('-', ' ') : 'Lainnya'}
                </Text>
              </View>
            </View>

            {/* Location Card */}
            <View className="mb-4 rounded-2xl bg-green-50 p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="mb-2 flex-row items-center">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <Ionicons name="location" size={16} color="white" />
                    </View>
                    <Text className="ml-2 font-bold text-green-900">Lokasi Pengambilan</Text>
                  </View>
                  <Text className="mb-1 text-base font-medium text-green-800">{food.location}</Text>
                  {food.distance_km && (
                    <Text className="text-sm text-green-600">
                      {food.distance_km.toFixed(1)} km dari lokasi Anda
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleGetDirections}
                  className="ml-3 rounded-xl bg-green-500 px-4 py-3">
                  <Ionicons name="navigate" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Expiry Time Card */}
            <View className="rounded-2xl bg-orange-50 p-5">
              <View className="mb-2 flex-row items-center">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                  <Ionicons name="time" size={16} color="white" />
                </View>
                <Text className="ml-2 font-bold text-orange-900">Batas Waktu</Text>
              </View>
              <Text className="mb-1 text-base font-semibold text-orange-800">
                {food.expired_at
                  ? format(new Date(food.expired_at), 'EEEE, dd MMMM yyyy', { locale: id })
                  : 'Tanggal tidak valid'}
              </Text>
              <Text className="text-sm text-orange-600">
                {food.expired_at
                  ? formatDistanceToNow(new Date(food.expired_at), {
                      addSuffix: true,
                      locale: id,
                    })
                  : 'Waktu tidak valid'}
              </Text>
            </View>
          </View>

          {/* Donor Info */}
          <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <Text className="mb-4 text-lg font-bold text-gray-900">Informasi Donor</Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  {food.profiles?.avatar_url ? (
                    <Image
                      source={{ uri: food.profiles.avatar_url }}
                      className="h-full w-full rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={24} color="#3b82f6" />
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900">
                    {food.profiles?.full_name || 'Anonymous'}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    Berbagi{' '}
                    {food.created_at
                      ? formatDistanceToNow(new Date(food.created_at), {
                          addSuffix: true,
                          locale: id,
                        })
                      : 'baru-baru ini'}
                  </Text>
                </View>
              </View>

              {!isOwner && (
                <TouchableOpacity
                  onPress={handleContactDonor}
                  className="rounded-xl bg-green-500 px-5 py-3">
                  <View className="flex-row items-center">
                    <Ionicons name="chatbubble" size={16} color="white" />
                    <Text className="ml-1 text-sm font-semibold text-white">Chat</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {canBook && (
        <View className="border-t border-gray-100 bg-white px-6 py-6">
          <TouchableOpacity
            onPress={() => setShowBookingModal(true)}
            disabled={isLoading}
            className="items-center justify-center rounded-2xl bg-blue-500 py-4 shadow-lg"
            style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}>
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="restaurant" size={20} color="white" />
                <Text className="ml-2 text-lg font-bold text-white">Pesan Makanan Ini</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="rounded-t-3xl bg-white p-6">
            {/* Modal Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-gray-900">Konfirmasi Pesanan</Text>
              <TouchableOpacity
                onPress={() => setShowBookingModal(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Food Summary */}
            <View className="mb-6 rounded-2xl bg-gray-50 p-4">
              <Text className="mb-1 text-lg font-bold text-gray-900">{food.title}</Text>
              <Text className="text-gray-600">
                {food.quantity} porsi • {food.location}
              </Text>
            </View>

            <Text className="mb-3 font-semibold text-gray-700">Pesan untuk donor (opsional):</Text>

            <TextInput
              value={bookingMessage}
              onChangeText={setBookingMessage}
              placeholder="Contoh: Saya akan mengambil makanan dalam 30 menit..."
              multiline
              numberOfLines={4}
              className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800"
              textAlignVertical="top"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowBookingModal(false)}
                className="flex-1 items-center justify-center rounded-2xl bg-gray-100 py-4">
                <Text className="font-bold text-gray-700">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBookFood}
                disabled={bookingLoading}
                className="flex-1 items-center justify-center rounded-2xl bg-blue-500 py-4">
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="font-bold text-white">Konfirmasi Pesanan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Google Maps WebView Modal */}
      <Modal visible={showWebView} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-6 py-4">
            <Text className="text-xl font-bold text-gray-900">Rute ke Lokasi</Text>
            <TouchableOpacity
              onPress={() => setShowWebView(false)}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <WebView
            source={{ uri: mapUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 items-center justify-center bg-gray-50">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <ActivityIndicator size="large" color="#22c55e" />
                </View>
                <Text className="font-semibold text-gray-700">Memuat peta...</Text>
                <Text className="mt-1 text-sm text-gray-500">Mohon tunggu sebentar</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
