import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ErrorModalProps {
  visible: boolean
  title?: string
  message: string
  buttonText?: string
  onClose: () => void
  type?: 'error' | 'warning'
}

const { width } = Dimensions.get('window')

export default function ErrorModal({
  visible,
  title = 'Oops!',
  message,
  buttonText = 'Coba Lagi',
  onClose,
  type = 'error'
}: ErrorModalProps) {
  const getConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'close-circle',
          color: '#ef4444',
          bgColor: '#fef2f2',
          borderColor: '#fecaca'
        }
      case 'warning':
        return {
          icon: 'warning',
          color: '#f59e0b',
          bgColor: '#fffbeb',
          borderColor: '#fed7aa'
        }
      default:
        return {
          icon: 'close-circle',
          color: '#ef4444',
          bgColor: '#fef2f2',
          borderColor: '#fecaca'
        }
    }
  }

  const config = getConfig()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View 
          className="bg-white rounded-2xl p-6 shadow-lg border"
          style={{ 
            width: width * 0.85, 
            maxWidth: 400,
            borderColor: config.borderColor
          }}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <Ionicons 
                name={config.icon as any} 
                size={32} 
                color={config.color} 
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

          {/* Button */}
          <TouchableOpacity
            onPress={onClose}
            className="w-full rounded-xl py-3 px-4 items-center"
            style={{ backgroundColor: config.color }}
          >
            <Text className="text-white font-semibold text-base">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}