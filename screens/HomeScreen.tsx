import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFoodStore } from '../store/foodStore'
import { useAuthStore } from '../store/authStore'
import { useNavigation } from '@react-navigation/native'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { HomeScreenNavigationProp } from '../types/navigation'

const CATEGORIES = [
  { id: null, name: 'Semua', icon: 'apps' },
  { id: 'makanan-berat', name: 'Makanan Berat', icon: 'restaurant' },
  { id: 'snack', name: 'Snack', icon: 'fast-food' },
  { id: 'minuman', name: 'Minuman', icon: 'wine' },
  { id: 'buah', name: 'Buah', icon: 'nutrition' },
  { id: 'sayuran', name: 'Sayuran', icon: 'leaf' },
  { id: 'roti', name: 'Roti', icon: 'cafe' },
]

interface FoodItemProps {
  item: any
  onPress: () => void
}

const FoodItem: React.FC<FoodItemProps> = ({ item, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success-100 text-success-800'
      case 'booked':
        return 'bg-secondary-100 text-secondary-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'expired':
        return 'bg-danger-100 text-danger-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia'
      case 'booked':
        return 'Dipesan'
      case 'completed':
        return 'Selesai'
      case 'expired':
        return 'Kedaluwarsa'
      default:
        return status
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row">
        {/* Image */}
        <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4 overflow-hidden">
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full justify-center items-center">
              <Ionicons name="image" size={24} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold text-gray-800 flex-1 mr-2" numberOfLines={1}>
              {item.title}
            </Text>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
              <Text className="text-xs font-medium">
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 mb-2" numberOfLines={2}>
            {item.description}
          </Text>

          <View className="flex-row items-center mb-2">
            <Ionicons name="location" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-500 ml-1 flex-1" numberOfLines={1}>
              {item.location}
            </Text>
            {item.distance_km && (
              <Text className="text-sm text-primary-600 font-medium">
                {item.distance_km.toFixed(1)} km
              </Text>
            )}
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="person" size={14} color="#6b7280" />
              <Text className="text-sm text-gray-500 ml-1">
                {item.profiles?.full_name || 'Anonymous'}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="time" size={14} color="#6b7280" />
              <Text className="text-sm text-gray-500 ml-1">
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                  locale: id,
                })}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mt-2">
            <View className="bg-primary-100 px-2 py-1 rounded-full mr-2">
              <Text className="text-xs text-primary-800 font-medium">
                {item.quantity} porsi
              </Text>
            </View>
            
            <View className="bg-secondary-100 px-2 py-1 rounded-full">
              <Text className="text-xs text-secondary-800 font-medium">
                {item.category}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const { user } = useAuthStore()
  const {
    foods,
    filteredFoods,
    selectedCategory: storeSelectedCategory,
    isLoading,
    loadFoods,
    setCategory,
    getCategories,
  } = useFoodStore()

  const [searchText, setSearchText] = useState('')
  // Use store's selectedCategory instead of local state
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      loadFoods()
    }
  }, [user])

  const handleSearch = useCallback(() => {
    loadFoods(undefined, searchText)
  }, [searchText, loadFoods])

  const handleCategoryPress = (categoryId: string | null) => {
    setCategory(categoryId)
    loadFoods(categoryId || undefined, searchText)
  }

  const handleFoodPress = (food: any) => {
    navigation.navigate('FoodDetail', { foodId: food.id })
  }

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleCategoryPress(item.id)}
      className={`mr-3 px-4 py-2 rounded-full border ${
        storeSelectedCategory === item.id
          ? 'bg-primary-500 border-primary-500'
          : 'bg-white border-gray-300'
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons
          name={item.icon as any}
          size={16}
          color={storeSelectedCategory === item.id ? 'white' : '#6b7280'}
        />
        <Text
          className={`text-sm font-medium ${
            storeSelectedCategory === item.id ? 'text-white' : 'text-gray-700'
          }`}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const renderFoodItem = ({ item }: { item: any }) => (
    <FoodItem item={item} onPress={() => handleFoodPress(item)} />
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Sisa Plus</Text>
            <Text className="text-gray-600">Temukan makanan di sekitar Anda</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            className="w-10 h-10 bg-primary-100 rounded-full justify-center items-center"
          >
            <Ionicons name="person" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            placeholder="Cari makanan..."
            className="flex-1 ml-3 text-gray-800"
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('')
              }}
            >
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
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0ea5e9" />
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
                  setRefreshing(true)
                  loadFoods(storeSelectedCategory || undefined, searchText).finally(() => setRefreshing(false))
                }}
                colors={['#0ea5e9']}
                tintColor="#0ea5e9"
              />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-12">
                <Ionicons name="restaurant" size={64} color="#d1d5db" />
                <Text className="text-lg font-medium text-gray-500 mt-4 mb-2">
                  Tidak ada makanan tersedia
                </Text>
                <Text className="text-gray-400 text-center px-8">
                {storeSelectedCategory
                  ? `Tidak ada makanan dalam kategori ${CATEGORIES.find(c => c.id === storeSelectedCategory)?.name}`
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
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full justify-center items-center shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}