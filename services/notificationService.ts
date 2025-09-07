import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { db } from '../config/firebase';

// Konfigurasi default untuk notifikasi
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private fcmToken: string | null = null;

  // Meminta permission untuk notifikasi
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('Notifikasi hanya berfungsi di device fisik');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission notifikasi ditolak');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Mendapatkan Expo Push Token
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Expo Push Token hanya tersedia di device fisik');
        return null;
      }

      // Cek apakah token sudah tersimpan
      const storedToken = await AsyncStorage.getItem('expoPushToken');
      if (storedToken) {
        this.expoPushToken = storedToken;
        return storedToken;
      }

      // Request permissions terlebih dahulu
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Dapatkan token baru
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      this.expoPushToken = token.data;
      await AsyncStorage.setItem('expoPushToken', token.data);
      
      console.log('Expo Push Token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting Expo Push Token:', error);
      return null;
    }
  }

  // Mendapatkan FCM Token
  async getFCMToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('FCM Token hanya tersedia di device fisik');
        return null;
      }

      // Cek apakah token sudah tersimpan
      const storedToken = await AsyncStorage.getItem('fcmToken');
      if (storedToken) {
        this.fcmToken = storedToken;
        return storedToken;
      }

      // Request permissions terlebih dahulu
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Dapatkan FCM token
      const token = await messaging().getToken();
      
      this.fcmToken = token;
      await AsyncStorage.setItem('fcmToken', token);
      
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM Token:', error);
      return null;
    }
  }

  // Simpan FCM token ke Firestore untuk user
  async saveFCMTokenToUser(userId: string, fcmToken: string) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        fcmToken: fcmToken,
        lastTokenUpdate: new Date().toISOString(),
      }, { merge: true });
      
      console.log('FCM Token saved to user:', userId);
    } catch (error) {
      console.error('Error saving FCM token to user:', error);
    }
  }

  // Dapatkan FCM token user dari Firestore
  async getUserFCMToken(userId: string): Promise<string | null> {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.fcmToken || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user FCM token:', error);
      return null;
    }
  }

  // Konfigurasi notification channel untuk Android
  async setupNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      // Channel khusus untuk order updates
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#dc2626',
        sound: 'default',
        description: 'Notifikasi untuk update status pesanan',
      });
    }
  }

  // Mengirim notifikasi lokal
  async sendLocalNotification(notificationData: NotificationData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: 'default',
        },
        trigger: null, // Kirim segera
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Mengirim push notification melalui Expo Push API
  async sendPushNotification(
    expoPushToken: string,
    notificationData: NotificationData
  ) {
    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        channelId: 'default',
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Mengirim FCM push notification
  async sendFCMNotification(
    fcmToken: string,
    notificationData: NotificationData
  ) {
    try {
      // Untuk development, kita akan menggunakan Firebase Admin SDK
      // Dalam production, ini harus dilakukan dari server backend
      console.log('Sending FCM notification to:', fcmToken);
      console.log('Notification data:', notificationData);
      
      // Untuk sementara, kita akan menggunakan local notification
      // sebagai fallback sampai server backend siap
      await this.sendLocalNotification(notificationData);
      
      return { success: true, message: 'FCM notification sent (local fallback)' };
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      throw error;
    }
  }

  // Mengirim notifikasi ke user lain (cross-device)
  async sendNotificationToUser(
    userId: string,
    notificationData: NotificationData
  ) {
    try {
      // Dapatkan FCM token user dari Firestore
      const userFCMToken = await this.getUserFCMToken(userId);
      
      if (userFCMToken) {
        // Kirim FCM notification
        return await this.sendFCMNotification(userFCMToken, notificationData);
      } else {
        console.log('User FCM token not found for userId:', userId);
        return { success: false, message: 'User FCM token not found' };
      }
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  // Setup listeners untuk notifikasi
  setupNotificationListeners() {
    // Listener ketika notifikasi diterima saat app aktif
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Handle notifikasi yang diterima
      }
    );

    // Listener ketika user tap notifikasi
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        // Handle ketika user tap notifikasi
        const data = response.notification.request.content.data;
        
        // Navigate berdasarkan data notifikasi
        if (data.type === 'order_update') {
          // Navigate ke MyOrdersScreen
        } else if (data.type === 'new_food') {
          // Navigate ke HomeScreen
        }
      }
    );

    return {
      notificationListener,
      responseListener,
    };
  }

  // Setup FCM listeners
  setupFCMListeners() {
    // Listener untuk FCM token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
      console.log('FCM Token refreshed:', token);
      this.fcmToken = token;
      await AsyncStorage.setItem('fcmToken', token);
      
      // Update token di Firestore jika user sudah login
      // Implementasi ini akan dipanggil dari authStore
    });

    // Listener untuk foreground messages
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('FCM message received in foreground:', remoteMessage);
      
      // Tampilkan sebagai local notification
      if (remoteMessage.notification) {
        await this.sendLocalNotification({
          title: remoteMessage.notification.title || 'Notifikasi',
          body: remoteMessage.notification.body || '',
          data: remoteMessage.data,
        });
      }
    });

    return {
      unsubscribeTokenRefresh,
      unsubscribeForeground,
    };
  }

  // Setup background message handler
  setupBackgroundMessageHandler() {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('FCM message handled in background:', remoteMessage);
      
      // Handle background notification
      // Ini akan berjalan bahkan saat app tertutup
    });
  }

  // Initialize FCM untuk user yang login
  async initializeFCMForUser(userId: string) {
    try {
      // Dapatkan FCM token
      const fcmToken = await this.getFCMToken();
      
      if (fcmToken) {
        // Simpan token ke Firestore
        await this.saveFCMTokenToUser(userId, fcmToken);
        
        // Setup listeners
        this.setupFCMListeners();
        this.setupBackgroundMessageHandler();
        
        console.log('FCM initialized for user:', userId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error initializing FCM for user:', error);
      return false;
    }
  }

  // Cleanup listeners
  removeNotificationListeners(listeners: {
    notificationListener: Notifications.Subscription;
    responseListener: Notifications.Subscription;
  }) {
    Notifications.removeNotificationSubscription(listeners.notificationListener);
    Notifications.removeNotificationSubscription(listeners.responseListener);
  }

  // Mendapatkan token yang tersimpan
  getStoredToken(): string | null {
    return this.expoPushToken;
  }

  // Clear stored token
  async clearStoredToken() {
    this.expoPushToken = null;
    await AsyncStorage.removeItem('expoPushToken');
  }

  // Cek status permission
  async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }
}

export const notificationService = new NotificationService();
export default notificationService;