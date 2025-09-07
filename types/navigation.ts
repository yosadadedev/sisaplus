import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// Stack Navigator Types
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: {
    screen?: keyof MainTabParamList;
    params?: MainTabParamList[keyof MainTabParamList];
  } | undefined;
  FoodDetail: { foodId: string };
  EditProfile: undefined;
  Help: undefined;
};

// Tab Navigator Types
export type MainTabParamList = {
  Home: undefined;
  AddFood: undefined;
  MyOrders: { initialTab?: 'donations' | 'orders' } | undefined;
  Profile: undefined;
};

// Navigation Props
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// Composite Navigation Props for screens in tabs
export type HomeScreenNavigationProp = CompositeNavigationProp<
  MainTabNavigationProp,
  RootStackNavigationProp
>;

export type MyOrdersScreenNavigationProp = CompositeNavigationProp<
  MainTabNavigationProp,
  RootStackNavigationProp
>;

// Route Props
export type FoodDetailRouteProp = RouteProp<RootStackParamList, 'FoodDetail'>;

// Screen Props
export interface FoodDetailScreenProps {
  route: FoodDetailRouteProp;
  navigation: RootStackNavigationProp;
}
