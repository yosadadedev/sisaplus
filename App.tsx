import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './global.css';

// Screens
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import HelpScreen from './screens/HelpScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import FoodDetailScreen from './screens/FoodDetailScreen';
import AddFoodScreen from './screens/AddFoodScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import ProfileScreen from './screens/ProfileScreen';

// Stores
import { useAuthStore } from './store/authStore';
import { useFoodStore } from './store/foodStore';

// Services
import { notificationService } from './services/notificationService';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AddFood') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'MyOrders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ef4444',
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
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Beranda' }} />
      <Tab.Screen name="AddFood" component={AddFoodScreen} options={{ tabBarLabel: 'Tambah' }} />
      <Tab.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{ tabBarLabel: 'Aktivitas' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  const { user, loading, initialize } = useAuthStore();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize auth store
    initialize();

    // Check onboarding status
    checkOnboardingStatus();

    // Setup notifications
    setupNotifications();

    // Setup notification listeners
    const listeners = notificationService.setupNotificationListeners();

    return () => {
      notificationService.removeNotificationListeners(listeners);
    };
  }, []);

  const setupNotifications = async () => {
    try {
      // Setup notification channels (Android)
      await notificationService.setupNotificationChannel();
      
      // Request permissions and get token
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        const token = await notificationService.getExpoPushToken();
        if (token) {
          console.log('Notification setup completed with token:', token);
          // TODO: Send token to your backend server
        }
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(onboardingStatus === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasSeenOnboarding(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Real-time subscriptions not needed with SQLite
      // Data will be fetched when screens are loaded
    }
  }, [user]);

  // Loading screen
  if (loading || hasSeenOnboarding === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Ionicons name="restaurant" size={64} color="#dc2626" />
        <Text className="mt-4 text-xl font-bold text-gray-800">Sisa Plus</Text>
        <Text className="mt-2 text-gray-600">Memuat aplikasi...</Text>
      </View>
    );
  }

  const linking = {
    prefixes: ['sisaplus://'],
    config: {
      screens: {
        Login: 'auth/callback',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style="dark" backgroundColor="white" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          // Onboarding stack
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user ? (
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
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="Help"
              component={HelpScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="NotificationSettings"
              component={NotificationSettingsScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </>
        ) : (
          // Unauthenticated stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
