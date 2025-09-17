import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';

export interface PickerItem {
  label: string;
  value: string;
}

interface CrossPlatformPickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  style?: any;
  enabled?: boolean;
  placeholder?: string;
  dropdownIconColor?: string;
  mode?: 'dropdown' | 'dialog';
}

export function CrossPlatformPicker({
  selectedValue,
  onValueChange,
  items,
  style,
  enabled = true,
  placeholder = "Select an option...",
  dropdownIconColor = "#9CA3AF",
  mode = "dropdown", // eslint-disable-line @typescript-eslint/no-unused-vars
}: CrossPlatformPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // For web, use native select element
  if (Platform.OS === 'web') {
    return (
      <select
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={!enabled}
        style={[styles.webSelect, style]}
      >
        <option value="" style={styles.webOption}>
          {placeholder}
        </option>
        {items.map((item) => (
          <option key={item.value} value={item.value} style={styles.webOption}>
            {item.label}
          </option>
        ))}
      </select>
    );
  }

  // For native, use custom dropdown
  const selectedItem = items.find(item => item.value === selectedValue);
  const displayText = selectedItem ? selectedItem.label : placeholder;

  return (
    <>
      <Pressable
        style={[styles.nativeButton, !enabled && styles.disabled]}
        onPress={() => enabled && setIsOpen(true)}
        disabled={!enabled}
      >
        <Text style={[styles.buttonText, !selectedValue && styles.placeholderText]}>
          {displayText}
        </Text>
        <Text style={[styles.arrow, { color: dropdownIconColor }]}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select an option</Text>
              <Pressable onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {items.map((item) => (
                <Pressable
                  key={item.value}
                  style={[
                    styles.optionItem,
                    selectedValue === item.value && styles.optionSelected
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    selectedValue === item.value && styles.optionSelectedText
                  ]}>
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Web styles
  webSelect: {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    paddingRight: 30,
    paddingLeft: 12,
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="#9CA3AF" d="M6 9L1 4h10z"/></svg>'
    )}")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '12px 12px',
    color: '#F9FAFB',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    height: 50,
    fontSize: 14,
  },
  webOption: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    padding: 8,
  },

  // Native styles
  nativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
    minHeight: 50,
  },
  buttonText: {
    flex: 1,
    fontSize: 14,
    color: '#F9FAFB',
  },
  placeholderText: {
    color: '#6B7280',
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  optionSelected: {
    backgroundColor: '#374151',
  },
  optionText: {
    fontSize: 14,
    color: '#F9FAFB',
    flex: 1,
  },
  optionSelectedText: {
    color: '#6366F1',
    fontWeight: '500',
  },
  checkmark: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: 'bold',
  },
});