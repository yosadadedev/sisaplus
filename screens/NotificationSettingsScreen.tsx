import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { notificationService } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  newBookings: boolean;
  statusUpdates: boolean;
  reminders: boolean;
  marketing: boolean;
}

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<NotificationSettings>({
    newBookings: true,
    statusUpdates: true,
    reminders: true,
    marketing: false,
  });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Gagal menyimpan pengaturan notifikasi');
    }
  };

  const checkPermissions = async () => {
    try {
      const status = await notificationService.getPermissionStatus();
      setPermissionGranted(status === 'granted');
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const granted = await notificationService.requestPermissions();
      setPermissionGranted(granted);
      
      if (granted) {
        Alert.alert('Berhasil', 'Izin notifikasi telah diberikan');
        // Setup notification channel
        await notificationService.setupNotificationChannel();
      } else {
        Alert.alert(
          'Izin Ditolak',
          'Untuk menerima notifikasi, silakan aktifkan izin notifikasi di pengaturan perangkat'
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Gagal meminta izin notifikasi');
    }
  };

  const testNotification = async () => {
    if (!permissionGranted) {
      Alert.alert('Izin Diperlukan', 'Silakan aktifkan izin notifikasi terlebih dahulu');
      return;
    }

    try {
      await notificationService.sendLocalNotification({
        title: 'Test Notifikasi',
        body: 'Ini adalah notifikasi test dari SisaPlus!',
        data: { type: 'test' }
      });
      Alert.alert('Berhasil', 'Notifikasi test telah dikirim');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Gagal mengirim notifikasi test');
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const settingsItems = [
    {
      key: 'newBookings' as keyof NotificationSettings,
      title: 'Pesanan Baru',
      subtitle: 'Notifikasi saat ada yang memesan makanan Anda',
      icon: 'notifications-outline',
    },
    {
      key: 'statusUpdates' as keyof NotificationSettings,
      title: 'Update Status',
      subtitle: 'Notifikasi saat status pesanan berubah',
      icon: 'refresh-outline',
    },
    {
      key: 'reminders' as keyof NotificationSettings,
      title: 'Pengingat',
      subtitle: 'Pengingat untuk pickup makanan',
      icon: 'time-outline',
    },
    {
      key: 'marketing' as keyof NotificationSettings,
      title: 'Promosi & Tips',
      subtitle: 'Informasi promosi dan tips mengurangi food waste',
      icon: 'megaphone-outline',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Memuat pengaturan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-6 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <Ionicons name="arrow-back" size={20} color="#6b7280" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Pengaturan Notifikasi</Text>
          </View>
        </View>

        {/* Permission Status */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">Izin Notifikasi</Text>
              <Text className="mt-1 text-sm text-gray-600">
                {permissionGranted ? 'Diizinkan' : 'Belum diizinkan'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className={`mr-3 h-3 w-3 rounded-full ${
                  permissionGranted ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              {!permissionGranted && (
                <TouchableOpacity
                  onPress={requestPermissions}
                  className="rounded-lg bg-primary-600 px-4 py-2">
                  <Text className="text-sm font-medium text-white">Aktifkan</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View className="mx-4 mt-4 rounded-xl bg-white">
          <View className="border-b border-gray-100 p-4">
            <Text className="font-semibold text-gray-900">Jenis Notifikasi</Text>
            <Text className="mt-1 text-sm text-gray-600">
              Pilih jenis notifikasi yang ingin Anda terima
            </Text>
          </View>

          {settingsItems.map((item, index) => (
            <View
              key={item.key}
              className={`flex-row items-center p-4 ${
                index !== settingsItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name={item.icon as any} size={20} color="#6b7280" />
              </View>

              <View className="ml-4 flex-1">
                <Text className="font-medium text-gray-900">{item.title}</Text>
                <Text className="mt-0.5 text-sm text-gray-500">{item.subtitle}</Text>
              </View>

              <Switch
                value={settings[item.key]}
                onValueChange={() => toggleSetting(item.key)}
                trackColor={{ false: '#f3f4f6', true: '#dc2626' }}
                thumbColor={settings[item.key] ? '#ffffff' : '#ffffff'}
                disabled={!permissionGranted}
              />
            </View>
          ))}
        </View>

        {/* Test Notification */}
        <View className="mx-4 mt-4 rounded-xl bg-white p-4">
          <Text className="mb-3 font-semibold text-gray-900">Test Notifikasi</Text>
          <TouchableOpacity
            onPress={testNotification}
            disabled={!permissionGranted}
            className={`flex-row items-center justify-center rounded-lg p-3 ${
              permissionGranted ? 'bg-primary-600' : 'bg-gray-300'
            }`}>
            <Ionicons
              name="send-outline"
              size={20}
              color={permissionGranted ? '#ffffff' : '#9ca3af'}
            />
            <Text
              className={`ml-2 font-medium ${
                permissionGranted ? 'text-white' : 'text-gray-500'
              }`}>
              Kirim Notifikasi Test
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View className="mx-4 mt-4 mb-8 rounded-xl bg-blue-50 p-4">
          <View className="flex-row">
            <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
            <View className="ml-3 flex-1">
              <Text className="font-medium text-blue-900">Informasi</Text>
              <Text className="mt-1 text-sm text-blue-700">
                Notifikasi membantu Anda tetap update dengan aktivitas di SisaPlus. Anda dapat
                mengatur jenis notifikasi sesuai preferensi.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}