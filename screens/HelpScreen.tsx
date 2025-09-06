import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'Apa itu SisaPlus?',
    answer:
      'SisaPlus adalah aplikasi yang membantu mengurangi food waste dengan menghubungkan orang yang memiliki makanan berlebih dengan mereka yang membutuhkan. Kami percaya bahwa setiap makanan berharga dan tidak boleh terbuang sia-sia.',
  },
  {
    id: '2',
    question: 'Bagaimana cara membagikan makanan?',
    answer:
      'Untuk membagikan makanan, buka halaman "Tambah Makanan", isi informasi makanan seperti nama, deskripsi, kategori, jumlah, lokasi, dan waktu kadaluarsa. Setelah itu, makanan Anda akan tersedia untuk dipesan oleh pengguna lain.',
  },
  {
    id: '3',
    question: 'Apakah makanan yang dibagikan gratis?',
    answer:
      'Ya, sebagian besar makanan di SisaPlus dibagikan secara gratis. Namun, beberapa donatur mungkin meminta kontribusi kecil untuk biaya operasional. Harga akan ditampilkan dengan jelas di setiap listing makanan.',
  },
  {
    id: '4',
    question: 'Bagaimana cara memesan makanan?',
    answer:
      'Untuk memesan makanan, cari makanan yang Anda inginkan di halaman utama, klik pada item makanan untuk melihat detail, lalu tekan tombol "Pesan Sekarang". Anda akan mendapat informasi kontak donatur untuk koordinasi pengambilan.',
  },
  {
    id: '5',
    question: 'Bagaimana sistem pengambilan makanan?',
    answer:
      'Setelah memesan, Anda akan mendapat informasi lokasi dan waktu pengambilan dari donatur. Koordinasikan dengan donatur melalui kontak yang tersedia untuk memastikan waktu pengambilan yang tepat.',
  },
  {
    id: '6',
    question: 'Apa yang harus dilakukan jika makanan sudah kadaluarsa?',
    answer:
      'Jika Anda menemukan makanan yang sudah kadaluarsa, jangan mengonsumsinya. Laporkan kepada kami melalui fitur laporan atau hubungi customer support. Keamanan makanan adalah prioritas utama kami.',
  },
  {
    id: '7',
    question: 'Bagaimana cara membatalkan pesanan?',
    answer:
      'Anda dapat membatalkan pesanan melalui halaman "Pesanan Saya". Klik pada pesanan yang ingin dibatalkan dan pilih "Batalkan Pesanan". Pastikan untuk membatalkan sebelum waktu pengambilan yang disepakati.',
  },
  {
    id: '8',
    question: 'Apakah ada batasan jenis makanan yang bisa dibagikan?',
    answer:
      'Kami menerima berbagai jenis makanan, namun pastikan makanan masih dalam kondisi baik, tidak kadaluarsa, dan aman untuk dikonsumsi. Hindari makanan yang mudah rusak tanpa penyimpanan yang tepat.',
  },
  {
    id: '9',
    question: 'Bagaimana cara menghubungi customer support?',
    answer:
      'Anda dapat menghubungi customer support melalui email di support@sisaplus.com, WhatsApp di +62 812-3456-7890, atau melalui formulir kontak di aplikasi ini.',
  },
  {
    id: '10',
    question: 'Apakah data pribadi saya aman?',
    answer:
      'Ya, kami sangat menjaga keamanan data pribadi Anda. Data hanya digunakan untuk keperluan aplikasi dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda. Baca kebijakan privasi kami untuk informasi lebih detail.',
  },
];

export default function HelpScreen() {
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openWhatsApp = () => {
    const phoneNumber = '+6281234567890';
    const message = 'Halo, saya membutuhkan bantuan terkait aplikasi SisaPlus.';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp tidak terinstall di perangkat Anda');
        }
      })
      .catch((err) => {
        console.error('Error opening WhatsApp:', err);
        Alert.alert('Error', 'Gagal membuka WhatsApp');
      });
  };

  const openEmail = () => {
    const email = 'support@sisaplus.com';
    const subject = 'Bantuan SisaPlus';
    const body = 'Halo tim SisaPlus,\n\nSaya membutuhkan bantuan terkait:\n\n';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(url).catch((err) => {
      console.error('Error opening email:', err);
      Alert.alert('Error', 'Gagal membuka aplikasi email');
    });
  };

  const openPhone = () => {
    const phoneNumber = 'tel:+6281234567890';

    Linking.openURL(phoneNumber).catch((err) => {
      console.error('Error opening phone:', err);
      Alert.alert('Error', 'Gagal membuka aplikasi telepon');
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Bantuan</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Contact Support Section */}
        <View className="px-4 py-6">
          <Text className="mb-4 text-xl font-bold text-gray-900">Hubungi Kami</Text>
          <Text className="mb-6 text-gray-600">
            Tim customer support kami siap membantu Anda 24/7
          </Text>

          <View className="space-y-3">
            {/* WhatsApp */}
            <TouchableOpacity
              onPress={openWhatsApp}
              className="flex-row items-center rounded-xl border border-green-200 bg-green-50 p-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <Ionicons name="logo-whatsapp" size={24} color="white" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-gray-900">WhatsApp</Text>
                <Text className="text-sm text-gray-600">+62 812-3456-7890</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity
              onPress={openEmail}
              className="flex-row items-center rounded-xl border border-blue-200 bg-blue-50 p-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                <Ionicons name="mail" size={24} color="white" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-gray-900">Email</Text>
                <Text className="text-sm text-gray-600">support@sisaplus.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Phone */}
            <TouchableOpacity
              onPress={openPhone}
              className="flex-row items-center rounded-xl border border-orange-200 bg-orange-50 p-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-orange-500">
                <Ionicons name="call" size={24} color="white" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-gray-900">Telepon</Text>
                <Text className="text-sm text-gray-600">+62 812-3456-7890</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View className="px-4 pb-8">
          <Text className="mb-4 text-xl font-bold text-gray-900">
            Pertanyaan yang Sering Diajukan
          </Text>

          <View className="space-y-3">
            {FAQ_DATA.map((item) => {
              const isExpanded = expandedItems.includes(item.id);

              return (
                <View key={item.id} className="overflow-hidden rounded-xl border border-gray-200">
                  <TouchableOpacity
                    onPress={() => toggleExpanded(item.id)}
                    className="flex-row items-center justify-between bg-gray-50 p-4">
                    <Text className="flex-1 pr-4 font-medium text-gray-900">{item.question}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View className="border-t border-gray-200 bg-white p-4">
                      <Text className="leading-6 text-gray-700">{item.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* App Info */}
        <View className="px-4 pb-8">
          <View className="rounded-xl bg-gray-50 p-4">
            <Text className="mb-2 font-semibold text-gray-900">Informasi Aplikasi</Text>
            <Text className="mb-1 text-sm text-gray-600">Versi: 1.0.0</Text>
            <Text className="mb-1 text-sm text-gray-600">Build: 2024.01.01</Text>
            <Text className="text-sm text-gray-600">© 2024 SisaPlus. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
