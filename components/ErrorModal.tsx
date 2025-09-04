import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  type?: 'error' | 'warning';
}

const { width } = Dimensions.get('window');

export default function ErrorModal({
  visible,
  title = 'Oops!',
  message,
  buttonText = 'Coba Lagi',
  onClose,
  type = 'error',
}: ErrorModalProps) {
  const getConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'close-circle',
          color: '#ef4444',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
        };
      case 'warning':
        return {
          icon: 'warning',
          color: '#f59e0b',
          bgColor: '#fffbeb',
          borderColor: '#fed7aa',
        };
      default:
        return {
          icon: 'close-circle',
          color: '#ef4444',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
        };
    }
  };

  const config = getConfig();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View
          className="rounded-2xl border bg-white p-6 shadow-lg"
          style={{
            width: width * 0.85,
            maxWidth: 400,
            borderColor: config.borderColor,
          }}>
          {/* Icon */}
          <View className="mb-4 items-center">
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: config.bgColor }}>
              <Ionicons name={config.icon as any} size={32} color={config.color} />
            </View>
          </View>

          {/* Title */}
          <Text className="mb-3 text-center text-xl font-bold text-gray-900">{title}</Text>

          {/* Message */}
          <Text className="mb-6 text-center text-base leading-6 text-gray-600">{message}</Text>

          {/* Button */}
          <TouchableOpacity
            onPress={onClose}
            className="w-full items-center rounded-xl px-4 py-3"
            style={{ backgroundColor: config.color }}>
            <Text className="text-base font-semibold text-white">{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
