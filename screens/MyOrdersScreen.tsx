import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useFoodStore } from '../store/foodStore';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Food } from '../lib/database';
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
    loadUserBookings,
    loadMyDonations,
    updateBookingStatus,
  } = useFoodStore();

  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id && isFocused) {
      // Add small delay to ensure navigation context is ready
      const timer = setTimeout(() => {
        loadUserBookings();
        loadMyDonations();
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
            className={`mr-2 flex-1 rounded-lg px-4 py-3 ${
              activeTab === 'orders' ? 'bg-blue-500' : 'bg-gray-100'
            }`}>
            <Text
              className={`text-center font-medium ${
                activeTab === 'orders' ? 'text-white' : 'text-gray-700'
              }`}>
              Pesanan Saya
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('donations')}
            className={`ml-2 flex-1 rounded-lg px-4 py-3 ${
              activeTab === 'donations' ? 'bg-blue-500' : 'bg-gray-100'
            }`}>
            <Text
              className={`text-center font-medium ${
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
                        {food?.image_urls && food.image_urls.length > 0 ? (
                          <Image 
                            source={{ uri: food.image_urls[0] }} 
                            className="h-full w-full" 
                            resizeMode="cover" 
                          />
                        ) : (
                          <View className="h-full w-full items-center justify-center">
                            <Ionicons name="restaurant" size={24} color="#9CA3AF" />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                          {food?.title || 'Makanan tidak ditemukan'}
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
                                : 'bg-red-100'
                          }`}>
                          <Text
                            className={`text-xs font-medium ${
                              booking.status === 'confirmed'
                                ? 'text-green-800'
                                : booking.status === 'pending'
                                  ? 'text-yellow-800'
                                  : 'text-red-800'
                            }`}>
                            {booking.status === 'confirmed'
                              ? 'Dikonfirmasi'
                              : booking.status === 'pending'
                                ? 'Menunggu'
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
        ) : myDonations.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-center text-lg font-medium text-gray-500">
              Belum ada donasi
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-400">
              Donasi Anda akan muncul di sini
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {myDonations.map((donation) => {
              const bookingsCount = userBookings.filter((b) => b.food_id === donation.id).length;
              return (
                <TouchableOpacity
                  key={donation.id}
                  onPress={() => navigation.navigate('FoodDetail', { foodId: donation.id })}
                  className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <View className="flex-row">
                    <View className="mr-3 h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                      <Ionicons name="restaurant" size={24} color="#9CA3AF" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {donation.title}
                      </Text>
                      <Text className="mt-1 text-sm text-gray-600">
                        Berlaku sampai: {new Date(donation.expired_at).toLocaleDateString('id-ID')}
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
                    <View className="items-end justify-between">
                      <View className="rounded-full bg-green-100 px-2 py-1">
                        <Text className="text-xs font-medium text-green-800">Aktif</Text>
                      </View>
                      <Text className="mt-1 text-xs font-medium text-blue-600">
                        {bookingsCount} pesanan
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
