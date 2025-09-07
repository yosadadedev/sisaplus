import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFoodStore } from '../store/foodStore';
import { useAuthStore } from '../store/authStore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { HomeScreenNavigationProp } from '../types/navigation';

const CATEGORIES = [
  { id: null, name: 'Semua', icon: 'apps' },
  { id: 'main-course', name: 'Makanan Utama', icon: 'restaurant' },
  { id: 'snacks', name: 'Makanan Ringan', icon: 'fast-food' },
  { id: 'beverages', name: 'Minuman', icon: 'wine' },
  { id: 'fruits', name: 'Buah-buahan', icon: 'nutrition' },
  { id: 'vegetables', name: 'Sayuran', icon: 'leaf' },
  { id: 'bakery', name: 'Roti & Kue', icon: 'cafe' },
  { id: 'others', name: 'Lainnya', icon: 'ellipsis-horizontal' },
];

interface FoodItemProps {
  item: any;
  onPress: () => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ item, onPress }) => {
  const openGoogleMaps = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    const url = Platform.select({
      ios: `maps://app?q=${encodedLocation}`,
      android: `geo:0,0?q=${encodedLocation}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
    });

    Linking.canOpenURL(url!).then((supported) => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        // Fallback to web Google Maps
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        Linking.openURL(webUrl);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success-100 text-success-800';
      case 'booked':
        return 'bg-secondary-100 text-secondary-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'booked':
        return 'Dipesan';
      case 'completed':
        return 'Selesai';
      case 'expired':
        return 'Kedaluwarsa';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
      <View className="flex-row">
        {/* Image */}
        <View className="mr-4 h-20 w-20 overflow-hidden rounded-lg bg-gray-200">
          {item.image_urls && item.image_urls.length > 0 ? (
            <Image source={{ uri: item.image_urls[0] }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Ionicons name="image" size={24} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="mb-2 flex-row items-start justify-between">
            <Text className="mr-2 flex-1 text-lg font-semibold text-gray-800" numberOfLines={1}>
              {item.title}
            </Text>
            <View className={`rounded-full px-2 py-1 ${getStatusColor(item.status)}`}>
              <Text className="text-xs font-medium">{getStatusText(item.status)}</Text>
            </View>
          </View>

          <Text className="mb-2 text-gray-600" numberOfLines={2}>
            {item.description}
          </Text>

          <TouchableOpacity
            onPress={() => openGoogleMaps(item.location)}
            className="mb-2 flex-row items-center">
            <Ionicons name="location" size={14} color="#ef4444" />
            <Text className="ml-1 flex-1 text-sm text-primary-600 underline" numberOfLines={1}>
              {item.location}
            </Text>
            {item.distance_km && (
              <Text className="text-sm font-medium text-primary-600">
                {item.distance_km.toFixed(1)} km
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="person" size={14} color="#6b7280" />
              <Text className="ml-1 text-sm text-gray-500">
                {item.profiles?.full_name || 'Anonymous'}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="time" size={14} color="#6b7280" />
              <Text className="ml-1 text-sm text-gray-500">
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                  locale: id,
                })}
              </Text>
            </View>
          </View>

          <View className="mt-2 flex-row items-center">
            <View className="mr-2 rounded-full bg-primary-100 px-2 py-1">
              <Text className="text-xs font-medium text-primary-800">{item.quantity} porsi</Text>
            </View>

            <View className="rounded-full bg-secondary-100 px-2 py-1">
              <Text className="text-xs font-medium text-secondary-800">{item.category}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuthStore();
  const {
    foods,
    filteredFoods,
    selectedCategory: storeSelectedCategory,
    isLoading,
    loadFoods,
    setCategory,
  } = useFoodStore();

  const [searchText, setSearchText] = useState('');
  // Use store's selectedCategory instead of local state
  const [refreshing, setRefreshing] = useState(false);

useFocusEffect(
  useCallback(() => {
    if (user) {
      loadFoods();
    }
  }, [user, loadFoods])
);

  const handleSearch = useCallback(() => {
    loadFoods(undefined, searchText);
  }, [searchText, loadFoods]);

  const handleCategoryPress = (categoryId: string | null) => {
    setCategory(categoryId);
    loadFoods(categoryId || undefined, searchText);
  };

  const handleFoodPress = (food: any) => {
    navigation.navigate('FoodDetail', { foodId: food.id });
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleCategoryPress(item.id)}
      className={`mr-3 rounded-full border px-4 py-2 ${
        storeSelectedCategory === item.id
          ? 'border-primary-500 bg-primary-500'
          : 'border-gray-300 bg-white'
      }`}>
      <View className="flex-row items-center">
        <Ionicons
          name={item.icon as any}
          size={16}
          color={storeSelectedCategory === item.id ? 'white' : '#6b7280'}
        />
        <Text
          className={`text-sm font-medium ${
            storeSelectedCategory === item.id ? 'text-white' : 'text-gray-700'
          }`}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFoodItem = ({ item }: { item: any }) => (
    <FoodItem item={item} onPress={() => handleFoodPress(item)} />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-100 bg-white px-4 py-4">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Sisa Plus</Text>
            <Text className="text-gray-600">Temukan makanan di sekitar Anda</Text>
          </View>

          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={() => {
                setRefreshing(true);
                loadFoods(storeSelectedCategory || undefined, searchText).finally(() =>
                  setRefreshing(false)
                );
              }}
              className="h-10 w-10 items-center justify-center rounded-full bg-secondary-100"
              disabled={refreshing}>
              <Ionicons 
                name={refreshing ? "hourglass" : "refresh"} 
                size={20} 
                color={refreshing ? "#9ca3af" : "#6b7280"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className="h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <Ionicons name="person" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center rounded-xl bg-gray-100 px-4 py-3">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            placeholder="Cari makanan..."
            className="ml-3 flex-1 text-gray-800"
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
              }}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View className="py-4">
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id || 'all'}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Foods List */}
      <View className="flex-1 px-4">
        {isLoading && foods.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ef4444" />
            <Text className="mt-4 text-gray-600">Memuat makanan...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredFoods.length > 0 || storeSelectedCategory ? filteredFoods : foods}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadFoods(storeSelectedCategory || undefined, searchText).finally(() =>
                    setRefreshing(false)
                  );
                }}
                colors={['#ef4444']}
                tintColor="#ef4444"
              />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-12">
                <Ionicons name="restaurant" size={64} color="#d1d5db" />
                <Text className="mb-2 mt-4 text-lg font-medium text-gray-500">
                  Tidak ada makanan tersedia
                </Text>
                <Text className="px-8 text-center text-gray-400">
                  {storeSelectedCategory
                    ? `Tidak ada makanan dalam kategori ${CATEGORIES.find((c) => c.id === storeSelectedCategory)?.name}`
                    : 'Belum ada donasi makanan yang tersedia saat ini'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddFood')}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary-500 shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        }}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
