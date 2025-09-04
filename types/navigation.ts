import { StackNavigationProp } from '@react-navigation/stack'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native'

// Stack Navigator Types
export type RootStackParamList = {
  Onboarding: undefined
  Login: undefined
  Register: undefined
  MainTabs: undefined
  FoodDetail: { foodId: string }
  EditProfile: undefined
  Help: undefined
  BookingQR: {
    bookingData: {
      id: string;
      food_id: string;
      user_id: string;
      status: string;
      pickup_time: string | null;
      notes?: string;
      created_at: string;
      food: {
        id: string;
        title: string;
        pickup_address: string;
        pickup_time_start: string;
        pickup_time_end: string;
        profiles: {
          full_name: string;
        };
      };
    };
  }
  QRScanner: undefined
}

// Tab Navigator Types
export type MainTabParamList = {
  Home: undefined
  AddFood: undefined
  MyOrders: undefined
  Profile: undefined
}

// Navigation Props
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>

// Composite Navigation Props for screens in tabs
export type HomeScreenNavigationProp = CompositeNavigationProp<
  MainTabNavigationProp,
  RootStackNavigationProp
>

export type MyOrdersScreenNavigationProp = CompositeNavigationProp<
  MainTabNavigationProp,
  RootStackNavigationProp
>

// Route Props
export type FoodDetailRouteProp = RouteProp<RootStackParamList, 'FoodDetail'>

// Screen Props
export interface FoodDetailScreenProps {
  route: FoodDetailRouteProp
  navigation: RootStackNavigationProp
}