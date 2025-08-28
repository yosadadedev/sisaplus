import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ConfirmationModalProps {
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  type?: 'success' | 'warning' | 'info'
}

const { width } = Dimensions.get('window')

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  type = 'success'
}: ConfirmationModalProps) {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#22c55e' }
      case 'warning':
        return { name: 'warning', color: '#f59e0b' }
      case 'info':
        return { name: 'information-circle', color: '#3b82f6' }
      default:
        return { name: 'checkmark-circle', color: '#22c55e' }
    }
  }

  const iconConfig = getIconConfig()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View 
          className="bg-white rounded-2xl p-6 shadow-lg"
          style={{ width: width * 0.85, maxWidth: 400 }}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: `${iconConfig.color}20` }}
            >
              <Ionicons 
                name={iconConfig.name as any} 
                size={32} 
                color={iconConfig.color} 
              />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-900 text-center mb-3">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-base text-gray-600 text-center mb-6 leading-6">
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {cancelText && onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                className="flex-1 bg-gray-100 rounded-xl py-3 px-4 items-center"
              >
                <Text className="text-gray-700 font-semibold text-base">
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={onConfirm}
              className={`${cancelText ? 'flex-1' : 'w-full'} rounded-xl py-3 px-4 items-center`}
              style={{ backgroundColor: iconConfig.color }}
            >
              <Text className="text-white font-semibold text-base">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}