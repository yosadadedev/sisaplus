import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Selamat Datang di Sisa Plus',
    description: 'Platform berbagi makanan untuk mengurangi food waste dan membantu sesama',
    icon: 'heart',
    color: '#10B981',
  },
  {
    id: 2,
    title: 'Bagikan Makanan Berlebih',
    description: 'Donasikan makanan yang masih layak konsumsi kepada yang membutuhkan',
    icon: 'gift',
    color: '#3B82F6',
  },
  {
    id: 3,
    title: 'Temukan Makanan Gratis',
    description: 'Cari dan booking makanan gratis di sekitar lokasi Anda',
    icon: 'location',
    color: '#F59E0B',
  },
  {
    id: 4,
    title: 'Kurangi Food Waste',
    description: 'Mari bersama-sama mengurangi pemborosan makanan dan membantu lingkungan',
    icon: 'leaf',
    color: '#059669',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleNext = () => {
    if (currentPage < slides.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      pagerRef.current?.setPage(nextPage);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.navigate('Login');
    }
  };

  const handlePageSelected = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const renderSlide = (slide: OnboardingSlide) => (
    <View key={slide.id} className="flex-1 items-center justify-center px-8">
      {/* Icon */}
      <View
        className="mb-12 h-32 w-32 items-center justify-center rounded-full"
        style={{ backgroundColor: `${slide.color}20` }}>
        <Ionicons name={slide.icon as any} size={64} color={slide.color} />
      </View>

      {/* Title */}
      <Text className="mb-6 text-center text-3xl font-bold text-gray-800">{slide.title}</Text>

      {/* Description */}
      <Text className="px-4 text-center text-lg leading-7 text-gray-600">{slide.description}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Skip Button */}
      <View className="flex-row justify-end px-6 pt-4">
        <TouchableOpacity onPress={handleSkip} className="px-4 py-2">
          <Text className="font-medium text-gray-500">Lewati</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePageSelected}>
        {slides.map((slide) => (
          <View key={slide.id} style={{ width }}>
            {renderSlide(slide)}
          </View>
        ))}
      </PagerView>

      {/* Bottom Section */}
      <View className="px-8 pb-8">
        {/* Page Indicators */}
        <View className="mb-8 flex-row items-center justify-center">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`mx-1 h-2 rounded-full ${
                index === currentPage ? 'w-8 bg-primary-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row items-center justify-between">
          {/* Previous Button */}
          <TouchableOpacity
            onPress={() => {
              if (currentPage > 0) {
                const prevPage = currentPage - 1;
                setCurrentPage(prevPage);
                pagerRef.current?.setPage(prevPage);
              }
            }}
            className={`h-12 w-12 items-center justify-center rounded-full ${
              currentPage === 0 ? 'bg-gray-100' : 'bg-gray-200'
            }`}
            disabled={currentPage === 0}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentPage === 0 ? '#D1D5DB' : '#6B7280'}
            />
          </TouchableOpacity>

          {/* Next/Finish Button */}
          <TouchableOpacity
            onPress={handleNext}
            className="flex-row items-center rounded-full bg-primary-500 px-8 py-4">
            <Text className="mr-2 text-lg font-semibold text-white">
              {currentPage === slides.length - 1 ? 'Mulai' : 'Lanjut'}
            </Text>
            <Ionicons
              name={currentPage === slides.length - 1 ? 'checkmark' : 'chevron-forward'}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
