import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
];

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function PhoneInput({
  value,
  onChangeText,
  placeholder = '812345678',
  label = 'WhatsApp',
  required = false,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default Indonesia
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    // Update the phone number with new country code
    const phoneWithoutCode = value.replace(/^\+\d+/, '');
    onChangeText(country.dialCode + phoneWithoutCode);
  };

  const handlePhoneChange = (text: string) => {
    // Remove any non-numeric characters except +
    const cleanText = text.replace(/[^\d+]/g, '');

    // If user types a new country code, try to detect it
    if (cleanText.startsWith('+') && cleanText !== selectedCountry.dialCode) {
      const matchingCountry = COUNTRIES.find((country) => cleanText.startsWith(country.dialCode));
      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
      }
    }

    onChangeText(cleanText);
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity style={styles.countryItem} onPress={() => handleCountrySelect(item)}>
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.dialCode}>{item.dialCode}</Text>
      </View>
      {selectedCountry.code === item.code && (
        <Ionicons name="checkmark" size={20} color="#ef4444" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </Text>

      <View className="relative flex-row">
        {/* Country Code Picker */}
        <TouchableOpacity
          onPress={() => setShowCountryPicker(true)}
          className="flex-row items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 py-3">
          <Text className="mr-1 text-lg">{selectedCountry.flag}</Text>
          <Text className="mr-1 text-base text-gray-800">{selectedCountry.dialCode}</Text>
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Phone Number Input */}
        <View className="relative flex-1">
          <TextInput
            value={value.replace(selectedCountry.dialCode, '')}
            onChangeText={(text) => handlePhoneChange(selectedCountry.dialCode + text)}
            placeholder={placeholder}
            keyboardType="phone-pad"
            className="w-full rounded-r-xl border border-l-0 border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-base text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
          <View className="absolute right-3 top-3">
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </View>
        </View>
      </View>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCountryPicker(false)}
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pilih Negara</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari negara atau kode..."
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            style={styles.countriesList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  countriesList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  dialCode: {
    fontSize: 14,
    color: '#6B7280',
  },
});
