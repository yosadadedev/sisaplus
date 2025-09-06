import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: 'success' | 'warning' | 'info';
}

const { width } = Dimensions.get('window');

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  type = 'success',
}: ConfirmationModalProps) {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#22c55e' };
      case 'warning':
        return { name: 'warning', color: '#f59e0b' };
      case 'info':
        return { name: 'information-circle', color: '#3b82f6' };
      default:
        return { name: 'checkmark-circle', color: '#22c55e' };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View
          className="rounded-2xl bg-white p-6 shadow-lg"
          style={{ width: width * 0.85, maxWidth: 400 }}>
          {/* Icon */}
          <View className="mb-4 items-center">
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${iconConfig.color}20` }}>
              <Ionicons name={iconConfig.name as any} size={32} color={iconConfig.color} />
            </View>
          </View>

          {/* Title */}
          <Text className="mb-3 text-center text-xl font-bold text-gray-900">{title}</Text>

          {/* Message */}
          <Text className="mb-6 text-center text-base leading-6 text-gray-600">{message}</Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {cancelText && onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                className="flex-1 items-center rounded-xl bg-gray-100 px-4 py-3">
                <Text className="text-base font-semibold text-gray-700">{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm}
              className={`${cancelText ? 'flex-1' : 'w-full'} items-center rounded-xl px-4 py-3`}
              style={{ backgroundColor: iconConfig.color }}>
              <Text className="text-base font-semibold text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
