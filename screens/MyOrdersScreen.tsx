import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useFoodStore } from '../store/foodStore';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { MyOrdersScreenNavigationProp } from '../types/navigation';

type TabType = 'donations' | 'orders';

export default function MyOrdersScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation<MyOrdersScreenNavigationProp>();
  const { user } = useAuthStore();
  const {
    foods,
    userBookings,
    myDonations,
    incomingBookings,
    loadUserBookings,
    loadMyDonations,
    loadIncomingBookings,
    updateBookingStatus,
  } = useFoodStore();

  const [activeTab, setActiveTab] = useState<TabType>('donations');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id && isFocused) {
      // Add small delay to ensure navigation context is ready
      const timer = setTimeout(() => {
        loadUserBookings();
        loadMyDonations();
        loadIncomingBookings();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user?.id, isFocused, loadUserBookings, loadMyDonations]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        await loadUserBookings();
        await loadMyDonations();
        await loadIncomingBookings();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900">Aktivitas Saya</Text>
        <Text className="mt-1 text-gray-600">Kelola pesanan dan donasi Anda</Text>
      </View>

      {/* Tab Navigation */}
      <View className="border-b border-gray-200 bg-white px-4 py-2">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab('orders')}
            className={`mr-1 flex-1 rounded-lg px-3 py-3 ${
              activeTab === 'orders' ? 'bg-primary-500' : 'bg-gray-100'
            }`}>
            <Text
              className={`text-center font-medium text-xs ${
                activeTab === 'orders' ? 'text-white' : 'text-gray-700'
              }`}>
              Pesanan Saya
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('donations')}
            className={`ml-1 flex-1 rounded-lg px-3 py-3 ${
              activeTab === 'donations' ? 'bg-primary-500' : 'bg-gray-100'
            }`}>
            <Text
              className={`text-center font-medium text-xs ${
                activeTab === 'donations' ? 'text-white' : 'text-gray-700'
              }`}>
              Donasi Saya
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === 'orders' ? (
          userBookings.length === 0 ? (
            <View className="flex-1 items-center justify-center px-4">
              <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
              <Text className="mt-4 text-center text-lg font-medium text-gray-500">
                Belum ada pesanan
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-400">
                Pesanan Anda akan muncul di sini
              </Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1 px-4"
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              {userBookings.map((booking) => {
                const food = foods.find((f) => f.id === booking.food_id);
                return (
                  <TouchableOpacity
                    key={booking.id}
                    onPress={() => {
                      if (food?.id) {
                        navigation.navigate('FoodDetail', { foodId: food.id });
                      }
                    }}
                    className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <View className="flex-row">
                      <View className="mr-3 h-16 w-16 overflow-hidden rounded-lg bg-gray-200">
                        {food?.image_urls && food.image_urls.length > 0 && food.image_urls[0] ? (
                          <Image 
                            source={{ uri: food.image_urls[0] }} 
                            className="h-full w-full" 
                            resizeMode="cover" 
                            onError={() => console.log('Error loading image:', food.image_urls?.[0])}
                          />
                        ) : (
                          <View className="h-full w-full items-center justify-center">
                            <Ionicons name="restaurant" size={24} color="#9CA3AF" />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                          {food?.title || (booking.status === 'completed' ? 'Makanan tidak ditemukan' : 'Data makanan tidak tersedia')}
                        </Text>
                        <Text className="mt-1 text-sm text-gray-600">Status: {booking.status}</Text>
                        <Text className="mt-1 text-xs text-gray-500">
                          {booking.created_at
                            ? formatDistanceToNow(new Date(booking.created_at), {
                                addSuffix: true,
                                locale: id,
                              })
                            : 'Waktu tidak tersedia'}
                        </Text>
                      </View>
                      <View className="items-end justify-between">
                        <View
                          className={`rounded-full px-2 py-1 ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100'
                              : booking.status === 'pending'
                                ? 'bg-yellow-100'
                                : booking.status === 'completed'
                                  ? 'bg-blue-100'
                                  : 'bg-red-100'
                          }`}>
                          <Text
                            className={`text-xs font-medium ${
                              booking.status === 'confirmed'
                                ? 'text-green-800'
                                : booking.status === 'pending'
                                  ? 'text-yellow-800'
                                  : booking.status === 'completed'
                                    ? 'text-blue-800'
                                    : 'text-red-800'
                            }`}>
                            {booking.status === 'confirmed'
                              ? 'Dikonfirmasi Donatur'
                              : booking.status === 'pending'
                                ? 'Menunggu'
                                : booking.status === 'completed'
                                  ? 'Selesai'
                                  : 'Dibatalkan'}
                          </Text>
                        </View>
                        {booking.status === 'pending' && (
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent parent TouchableOpacity from firing
                              Alert.alert(
                                'Batalkan Pesanan',
                                'Apakah Anda yakin ingin membatalkan pesanan ini?',
                                [
                                  { text: 'Tidak', style: 'cancel' },
                                  {
                                    text: 'Ya, Batalkan',
                                    style: 'destructive',
                                    onPress: () => updateBookingStatus(booking.id, 'cancelled'),
                                  },
                                ]
                              );
                            }}
                            className="mt-2 rounded-lg bg-red-500 px-3 py-1">
                            <Text className="text-xs font-medium text-white">Batalkan</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )
        ) : myDonations.length === 0 && incomingBookings.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-center text-lg font-medium text-gray-500">
              Belum ada donasi atau booking masuk
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-400">
              Donasi dan booking masuk akan muncul di sini
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            
            {/* Pesanan & Booking Section */}
            {(myDonations.length > 0 || incomingBookings.length > 0) && (
              <View className="mb-4">
                <Text className="mb-3 text-lg font-bold text-gray-900">Pesanan & Booking</Text>
                
                {/* My Donations Items - hanya yang belum ada booking */}
                {myDonations.filter(donation => 
                  !incomingBookings.some(booking => booking.food_id === donation.id)
                ).map((donation) => {
                  const isExpired = donation.expired_at && new Date(donation.expired_at) <= new Date();
                  return (
                    <TouchableOpacity
                      key={`donation-${donation.id}`}
                      onPress={() => navigation.navigate('FoodDetail', { foodId: donation.id })}
                      className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <View className="flex-row">
                        <View className="mr-3 h-16 w-16 overflow-hidden rounded-lg bg-gray-200">
                          {donation.image_urls && donation.image_urls.length > 0 && donation.image_urls[0] ? (
                            <Image 
                              source={{ uri: donation.image_urls[0] }} 
                              className="h-full w-full" 
                              resizeMode="cover" 
                              onError={() => console.log('Error loading image:', donation.image_urls?.[0])}
                            />
                          ) : (
                            <View className="h-full w-full items-center justify-center">
                              <Ionicons name="restaurant" size={24} color="#9CA3AF" />
                            </View>
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-900">
                            {donation.title}
                          </Text>
                          <Text className="mt-1 text-sm text-gray-600">
                            Donasi Saya - Belum ada booking
                          </Text>
                          <View className="mt-1 flex-row items-center">
                            <View className={`mr-2 h-2 w-2 rounded-full ${
                              !isExpired ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <Text className={`text-xs font-medium ${
                              !isExpired ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {!isExpired ? 'Aktif' : 'Kadaluwarsa'}
                            </Text>
                          </View>
                          <Text className="mt-1 text-xs text-gray-500">
                            Berlaku sampai: {donation.expired_at ? new Date(donation.expired_at).toLocaleDateString('id-ID') : 'Tidak tersedia'}
                          </Text>
                          <Text className="mt-1 text-xs text-gray-500">
                            {donation.created_at
                              ? formatDistanceToNow(new Date(donation.created_at), {
                                  addSuffix: true,
                                  locale: id,
                                })
                              : 'Waktu tidak tersedia'}
                          </Text>
                        </View>
                        <View className="items-end justify-center">
                          <View className={`rounded-full px-2 py-1 ${
                            !isExpired ? 'bg-blue-100' : 'bg-red-100'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              !isExpired ? 'text-blue-800' : 'text-red-800'
                            }`}>
                              {!isExpired ? 'Menunggu Booking' : 'Expired'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                
                {/* Booking Masuk Items */}
                {incomingBookings.map((booking) => {
                  const isExpired = booking.food?.expired_at && new Date(booking.food.expired_at) <= new Date();
                  return (
                    <TouchableOpacity
                      key={`booking-${booking.id}`}
                      onPress={() => navigation.navigate('FoodDetail', { foodId: booking.food_id })}
                      className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <View className="flex-row">
                        <View className="mr-3 h-16 w-16 overflow-hidden rounded-lg bg-gray-200">
                          {booking.food?.image_urls && booking.food.image_urls.length > 0 && booking.food.image_urls[0] ? (
                            <Image 
                              source={{ uri: booking.food.image_urls[0] }} 
                              className="h-full w-full" 
                              resizeMode="cover" 
                              onError={() => console.log('Error loading image:', booking.food?.image_urls?.[0])}
                            />
                          ) : (
                            <View className="h-full w-full items-center justify-center">
                              <Ionicons name="restaurant" size={24} color="#9CA3AF" />
                            </View>
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-900">
                            {booking.food?.title || 'Makanan tidak ditemukan'}
                          </Text>
                          <Text className="mt-1 text-sm text-gray-600">
                            Pembeli: Pembeli #{booking.user_id.slice(-6)}
                          </Text>
                          <View className="mt-1 flex-row items-center">
                            <View className={`mr-2 h-2 w-2 rounded-full ${
                              !isExpired || booking.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <Text className={`text-xs font-medium ${
                              !isExpired || booking.status === 'completed' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {!isExpired ? 'Aktif' :  booking.status === 'completed' ? 'Sudah diambil oleh pembeli' : 'Kadaluwarsa'}
                            </Text>
                          </View>
                          <Text className="mt-1 text-xs text-gray-500">
                            Berlaku sampai: {booking.food?.expired_at ? new Date(booking.food.expired_at).toLocaleDateString('id-ID') : 'Tidak tersedia'}
                          </Text>
                          <Text className="mt-1 text-xs text-gray-500">
                            {booking.created_at
                              ? formatDistanceToNow(new Date(booking.created_at), {
                                  addSuffix: true,
                                  locale: id,
                                })
                              : 'Waktu tidak tersedia'}
                          </Text>
                          {booking.notes && (
                            <Text className="mt-1 text-sm text-gray-500">
                              Catatan: {booking.notes}
                            </Text>
                          )}
                        </View>
                        <View className="items-end justify-between">
                          <View
                            className={`rounded-full px-2 py-1 ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100'
                                : booking.status === 'pending'
                                  ? 'bg-yellow-100'
                                  : booking.status === 'completed'
                                  ? 'bg-green-100'
                                  : 'bg-red-100'
                            }`}>
                            <Text
                              className={`text-xs font-medium ${
                                booking.status === 'confirmed'
                                  ? 'text-green-800'
                                  : booking.status === 'pending'
                                    ? 'text-yellow-800'
                                    : booking.status === 'completed'
                                    ? 'text-green-800'
                                    : 'text-red-800'
                              }`}>
                              {booking.status === 'confirmed'
                                ? 'Dikonfirmasi'
                                : booking.status === 'pending'
                                  ? 'Menunggu'
                                  : booking.status === 'cancelled'
                                    ? 'Dibatalkan'
                                    : 'Selesai'}
                            </Text>
                          </View>
                          {booking.status === 'pending' && (
                            <View className="mt-2 flex-row">
                              <TouchableOpacity
                                onPress={(e) => {
                                  e.stopPropagation();
                                  Alert.alert(
                                    'Tolak Booking',
                                    'Apakah Anda yakin ingin menolak booking ini?',
                                    [
                                      { text: 'Batal', style: 'cancel' },
                                      {
                                        text: 'Ya, Tolak',
                                        style: 'destructive',
                                        onPress: () => updateBookingStatus(booking.id, 'cancelled'),
                                      },
                                    ]
                                  );
                                }}
                                className="mr-2 rounded-lg bg-red-500 px-3 py-1">
                                <Text className="text-xs font-medium text-white">Tolak</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={(e) => {
                                  e.stopPropagation();
                                  Alert.alert(
                                    'Setujui Booking',
                                    'Apakah Anda yakin ingin menyetujui booking ini?',
                                    [
                                      { text: 'Batal', style: 'cancel' },
                                      {
                                        text: 'Ya, Setujui',
                                        onPress: () => updateBookingStatus(booking.id, 'confirmed'),
                                      },
                                    ]
                                  );
                                }}
                                className="rounded-lg bg-green-500 px-3 py-1">
                                <Text className="text-xs font-medium text-white">Setujui</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
