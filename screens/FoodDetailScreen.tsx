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
import { Food } from '../lib/database';
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
  const { foods, bookFood, isLoading, userBookings } = useFoodStore();

  const [food, setFood] = useState<Food | undefined>(undefined);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [mapUrl, setMapUrl] = useState('');
  const [userBooking, setUserBooking] = useState<any>(null);

  useEffect(() => {
    const loadFoodData = async () => {
      // First try to find food in the store
      let foundFood = foods.find((f) => f.id === foodId);
      
      // If not found in store, fetch directly from Firebase
       if (!foundFood && foodId) {
         try {
           console.log('Food not found in store, fetching from Firebase:', foodId);
           const { foodService } = await import('../services/firebaseService');
           const fetchedFood = await foodService.getFoodById(foodId);
           if (fetchedFood) {
             foundFood = fetchedFood;
             console.log('Successfully fetched food from Firebase:', fetchedFood.title);
           } else {
             console.warn('Food not found in Firebase:', foodId);
           }
         } catch (error) {
           console.error('Error fetching food data:', error);
         }
       }
       
       setFood(foundFood);
      
      // Check if user has already booked this food
      if (user && foundFood) {
        const existingBooking = userBookings.find(
          (booking) => booking.food_id === foundFood.id && booking.user_id === user.id
        );
        setUserBooking(existingBooking);
      }
    };
    
    loadFoodData();
  }, [foodId, foods, userBookings, user]);

  const handleBookFood = async () => {
    if (!food || !user) return;

    try {
      setBookingLoading(true);
      await bookFood(food.id || '', user.id || '', bookingMessage || '');

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

  const handleConfirmBooking = async () => {
    if (!userBooking?.id) {
      Alert.alert('Error', 'Data booking tidak tersedia');
      return;
    }

    try {
      setBookingLoading(true);
      // Update booking status to confirmed
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      await updateDoc(doc(db, 'bookings', userBooking.id), {
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      });
      Alert.alert('Berhasil', 'Pesanan telah dikonfirmasi!');
      // Refresh data
      const loadFoodData = async () => {
        let foundFood = foods.find((f) => f.id === foodId);
        if (!foundFood && foodId) {
          try {
            const { foodService } = await import('../services/firebaseService');
            const fetchedFood = await foodService.getFoodById(foodId);
            foundFood = fetchedFood || undefined;
          } catch (error) {
            console.error('Error fetching food data:', error);
          }
        }
        setFood(foundFood);
        if (user && foundFood) {
          const existingBooking = userBookings.find(
            (booking) => booking.food_id === foundFood.id && booking.user_id === user.id
          );
          setUserBooking(existingBooking);
        }
      };
      await loadFoodData();
    } catch (error) {
      console.error('Error confirming booking:', error);
      Alert.alert('Error', 'Gagal mengkonfirmasi pesanan');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCompleteBooking = async () => {
    if (!userBooking?.id) {
      Alert.alert('Error', 'Data booking tidak tersedia');
      return;
    }

    try {
      setBookingLoading(true);
      // Update booking status to completed
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      await updateDoc(doc(db, 'bookings', userBooking.id), {
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
      Alert.alert('Berhasil', 'Pesanan telah selesai! Terima kasih atas rating Anda.');
      // Refresh data
      const loadFoodData = async () => {
        let foundFood = foods.find((f) => f.id === foodId);
        if (!foundFood && foodId) {
          try {
            const { foodService } = await import('../services/firebaseService');
            const fetchedFood = await foodService.getFoodById(foodId);
            foundFood = fetchedFood || undefined;
          } catch (error) {
            console.error('Error fetching food data:', error);
          }
        }
        setFood(foundFood);
        if (user && foundFood) {
          const existingBooking = userBookings.find(
            (booking) => booking.food_id === foundFood.id && booking.user_id === user.id
          );
          setUserBooking(existingBooking);
        }
      };
      await loadFoodData();
    } catch (error) {
      console.error('Error completing booking:', error);
      Alert.alert('Error', 'Gagal menyelesaikan pesanan');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactDonor = () => {
    Alert.alert('Info', 'Fitur kontak donor akan segera tersedia.', [{ text: 'OK' }]);
  };

  const handleGetDirections = () => {
    if (!food?.location) {
      Alert.alert('Info', 'Lokasi tidak tersedia.', [{ text: 'OK' }]);
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.location)}`;
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
  const hasActiveBooking = userBooking && ['pending', 'confirmed'].includes(userBooking.status);
  const canBook = food && food.status === 'available' && !isExpired && !isOwner && !hasActiveBooking;
  
  const getBookingStatusText = () => {
    if (!userBooking) return null;
    const isDonor = food && user && food.donor_id === user.id;
    
    switch (userBooking.status) {
      case 'pending':
        return isDonor ? 'Menunggu Konfirmasi Anda' : 'Menunggu Konfirmasi Donatur';
      case 'confirmed':
        return isDonor ? 'Siap Diambil' : 'Pesanan Dikonfirmasi';
      case 'completed':
        return 'Pesanan Selesai';
      case 'cancelled':
        return 'Pesanan Dibatalkan';
      default:
        return null;
    }
  };
  console.log('food', food)
  const getBookingStatusColor = () => {
    if (!userBooking) return 'bg-gray-500';
    switch (userBooking.status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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
          {food.image_urls && food.image_urls.length > 0 ? (
              <Image source={{ uri: food.image_urls[0] }} className="h-full w-full" resizeMode="cover" />
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
            <View className={`rounded-full px-4 py-2 ${getStatusColor(food.status ?? '')}`}>
              <Text className="text-sm font-semibold text-white">{getStatusText(food.status ?? '')}</Text>
            </View>

            <View className="flex-row space-x-2">
              {userBooking && (
                <View className={`rounded-full px-4 py-2 ${getBookingStatusColor()}`}>
                  <Text className="text-sm font-semibold text-white">{getBookingStatusText()}</Text>
                </View>
              )}
              
              {isExpired && (
                <View className="rounded-full bg-red-100 px-4 py-2">
                  <Text className="text-sm font-semibold text-red-700">Kedaluwarsa</Text>
                </View>
              )}
            </View>
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

          {/* Order Flow Information */}
          <View className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <View className="mb-4 flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                <Ionicons name="information-circle" size={16} color="white" />
              </View>
              <Text className="ml-2 text-lg font-bold text-blue-900">Cara Memesan Makanan</Text>
            </View>
            
            <View className="space-y-4">
              {/* Step 1 */}
              <View className="flex-row items-start">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <Text className="text-xs font-bold text-white">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-blue-900">Pesan Makanan</Text>
                  <Text className="text-sm text-blue-700">Klik tombol Pesan Makanan Ini dan tambahkan catatan jika diperlukan</Text>
                </View>
              </View>
              
              {/* Step 2 */}
              <View className="flex-row items-start">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <Text className="text-xs font-bold text-white">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-blue-900">Menunggu Konfirmasi</Text>
                  <Text className="text-sm text-blue-700">Donatur akan mengkonfirmasi pesanan Anda dalam waktu 24 jam</Text>
                </View>
              </View>
              
              {/* Step 3 */}
              <View className="flex-row items-start">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <Text className="text-xs font-bold text-white">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-blue-900">Ambil Makanan</Text>
                  <Text className="text-sm text-blue-700">Datang ke lokasi yang tertera untuk mengambil makanan</Text>
                </View>
              </View>
              
              {/* Step 4 */}
              <View className="flex-row items-start">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <Text className="text-xs font-bold text-white">4</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-blue-900">Konfirmasi Selesai</Text>
                  <Text className="text-sm text-blue-700">Setelah menerima makanan, konfirmasi pesanan selesai dan berikan rating</Text>
                </View>
              </View>
            </View>
            
            {/* Tips */}
            <View className="mt-4 rounded-xl bg-blue-100 p-4">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="bulb" size={16} color="#1d4ed8" />
                <Text className="ml-2 text-sm font-bold text-blue-800">Tips:</Text>
              </View>
              <Text className="text-xs text-blue-700">
                • Pastikan Anda bisa datang sesuai waktu yang disepakati\n
                • Bawa wadah sendiri jika diperlukan\n
                • Hubungi donatur jika ada kendala
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
      <View className="border-t border-gray-100 bg-white px-6 py-6">
        {canBook && (
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
        )}
        
        {userBooking && userBooking.status === 'pending' && (
          <View>
            {isOwner ? (
              <TouchableOpacity
                onPress={() => Alert.alert('Konfirmasi', 'Konfirmasi pesanan ini?', [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Konfirmasi', onPress: handleConfirmBooking }
                ])}
                className="items-center justify-center rounded-2xl bg-blue-500 py-4">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="ml-2 text-lg font-bold text-white">Konfirmasi Pesanan</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View className="items-center justify-center rounded-2xl bg-yellow-100 py-4">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color="#d97706" />
                  <Text className="ml-2 text-lg font-bold text-yellow-700">Menunggu Konfirmasi Donatur</Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        {userBooking && userBooking.status === 'confirmed' && (
          <View>
            {isOwner ? (
              <View className="items-center justify-center rounded-2xl bg-green-100 py-4">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-done" size={20} color="#059669" />
                  <Text className="ml-2 text-lg font-bold text-green-700">Siap Diambil Receiver</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => Alert.alert('Konfirmasi', 'Tandai pesanan sebagai diterima dan beri rating?', [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Pesanan Diterima', onPress: handleCompleteBooking }
                ])}
                className="items-center justify-center rounded-2xl bg-green-500 py-4">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={20} color="white" />
                  <Text className="ml-2 text-lg font-bold text-white">Pesanan Diterima & Beri Rating</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {userBooking && userBooking.status === 'completed' && (
          <View className="items-center justify-center rounded-2xl bg-blue-100 py-4">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text className="ml-2 text-lg font-bold text-green-700">Pesanan Dikonfirmasi - Siap Diambil</Text>
            </View>
          </View>
        )}
        
        {userBooking && userBooking.status === 'completed' && (
          <View className="items-center justify-center rounded-2xl bg-blue-100 py-4">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-done" size={20} color="#2563eb" />
              <Text className="ml-2 text-lg font-bold text-blue-700">Pesanan Selesai</Text>
            </View>
          </View>
        )}
        
        {userBooking && userBooking.status === 'cancelled' && (
          <View className="items-center justify-center rounded-2xl bg-red-100 py-4">
            <View className="flex-row items-center">
              <Ionicons name="close-circle" size={20} color="#dc2626" />
              <Text className="ml-2 text-lg font-bold text-red-700">Pesanan Dibatalkan</Text>
            </View>
          </View>
        )}
        
        {isOwner && (
          <View className="items-center justify-center rounded-2xl bg-gray-100 py-4">
            <View className="flex-row items-center">
              <Ionicons name="person" size={20} color="#6b7280" />
              <Text className="ml-2 text-lg font-bold text-gray-600">Ini adalah donasi Anda</Text>
            </View>
          </View>
        )}
        
        {isExpired && !isOwner && !userBooking && (
          <View className="items-center justify-center rounded-2xl bg-red-100 py-4">
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#dc2626" />
              <Text className="ml-2 text-lg font-bold text-red-700">Makanan Sudah Kedaluwarsa</Text>
            </View>
          </View>
        )}
      </View>

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
