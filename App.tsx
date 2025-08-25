import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { View, Text } from 'react-native'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import './global.css'

// Screens
import OnboardingScreen from './screens/OnboardingScreen'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import FoodDetailScreen from './screens/FoodDetailScreen'
import AddFoodScreen from './screens/AddFoodScreen'
import MyOrdersScreen from './screens/MyOrdersScreen'
import ProfileScreen from './screens/ProfileScreen'

// Stores
import { useAuthStore } from './store/authStore'
import { useFoodStore } from './store/foodStore'

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Tab Navigator for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'AddFood') {
            iconName = focused ? 'add-circle' : 'add-circle-outline'
          } else if (route.name === 'MyOrders') {
            iconName = focused ? 'list' : 'list-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          } else {
            iconName = 'help-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Beranda' }}
      />
      <Tab.Screen 
        name="AddFood" 
        component={AddFoodScreen} 
        options={{ tabBarLabel: 'Tambah' }}
      />
      <Tab.Screen 
        name="MyOrders" 
        component={MyOrdersScreen} 
        options={{ tabBarLabel: 'Aktivitas' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  )
}

// Main App Component
export default function App() {
  const { user, loading, initialize } = useAuthStore()
  const { subscribeFoods, subscribeBookings } = useFoodStore()
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null)

  useEffect(() => {
    // Initialize auth store
    initialize()

    // Check onboarding status
    checkOnboardingStatus()

    // Setup notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
    })

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response)
      // Handle notification tap - navigate to relevant screen
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener)
      Notifications.removeNotificationSubscription(responseListener)
    }
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding')
      setHasSeenOnboarding(onboardingStatus === 'true')
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setHasSeenOnboarding(false)
    }
  }

  useEffect(() => {
    if (user) {
      // Setup real-time subscriptions when user is authenticated
      const unsubscribeFoods = subscribeFoods()
      const unsubscribeBookings = subscribeBookings()

      return () => {
        unsubscribeFoods()
        unsubscribeBookings()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Loading screen
  if (loading || hasSeenOnboarding === null) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Ionicons name="restaurant" size={64} color="#0ea5e9" />
        <Text className="text-xl font-bold text-gray-800 mt-4">Sisa Plus</Text>
        <Text className="text-gray-600 mt-2">Memuat aplikasi...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="white" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          // Onboarding stack
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : !user ? (
          // Authenticated stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="FoodDetail" 
              component={FoodDetailScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </>
        ) : (
          // Unauthenticated stack
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
