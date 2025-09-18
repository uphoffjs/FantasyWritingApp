import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
} from 'react-native';

interface CrossPlatformDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'compact';
}

export function CrossPlatformDatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date...",
  mode = "date",
  display = "default", // eslint-disable-line @typescript-eslint/no-unused-vars
}: CrossPlatformDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  // * Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return placeholder;
    
    if (mode === 'date') {
      return date.toLocaleDateString();
    } else if (mode === 'time') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleString();
    }
  };

  // * Handle date change for web
  const handleWebDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    if (dateValue) {
      const newDate = new Date(dateValue);
      onChange(newDate);
    } else {
      onChange(null);
    }
  };

  // * Handle native date confirmation
  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShowPicker(false);
  };

  // * For web, use native HTML date input
  if (Platform.OS === 'web') {
    const inputType = mode === 'time' ? 'time' : mode === 'datetime' ? 'datetime-local' : 'date';
    const inputValue = value ? 
      (mode === 'time' ? 
        value.toTimeString().slice(0, 5) : 
        mode === 'datetime' ? 
        value.toISOString().slice(0, 16) : 
        value.toISOString().slice(0, 10)) : '';

    return (
      <View style={styles.webContainer}>
        <input
          type={inputType}
          value={inputValue}
          onChange={handleWebDateChange}
          disabled={disabled}
          style={[styles.webInput, disabled && styles.webInputDisabled]}
        />
        {!value && (
          <Text style={styles.webPlaceholder}>{placeholder}</Text>
        )}
      </View>
    );
  }

  // * For native, use custom modal picker
  return (
    <>
      <Pressable
        style={[styles.nativeButton, disabled && styles.disabled]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, !value && styles.placeholderText]}>
          {formatDate(value)}
        </Text>
        <Text style={styles.dateIcon}>📅</Text>
      </Pressable>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {mode}</Text>
            </View>

            <View style={styles.datePickerContainer}>
              {/* Simple native date picker using input elements */}
              <View style={styles.dateInputContainer}>
                {mode !== 'time' && (
                  <View style={styles.dateGroup}>
                    <Text style={styles.dateLabel}>Year</Text>
                    <Pressable 
                      style={styles.dateInput}
                      onPress={() => {
                        // * Simple year picker - could be enhanced
                        const currentYear = tempDate.getFullYear();
                        const newYear = currentYear + 1;
                        const newDate = new Date(tempDate);
                        newDate.setFullYear(newYear);
                        setTempDate(newDate);
                      }}
                    >
                      <Text style={styles.dateInputText}>{tempDate.getFullYear()}</Text>
                    </Pressable>
                  </View>
                )}

                {mode !== 'time' && (
                  <View style={styles.dateGroup}>
                    <Text style={styles.dateLabel}>Month</Text>
                    <Pressable 
                      style={styles.dateInput}
                      onPress={() => {
                        const currentMonth = tempDate.getMonth();
                        const newMonth = (currentMonth + 1) % 12;
                        const newDate = new Date(tempDate);
                        newDate.setMonth(newMonth);
                        setTempDate(newDate);
                      }}
                    >
                      <Text style={styles.dateInputText}>{tempDate.getMonth() + 1}</Text>
                    </Pressable>
                  </View>
                )}

                {mode !== 'time' && (
                  <View style={styles.dateGroup}>
                    <Text style={styles.dateLabel}>Day</Text>
                    <Pressable 
                      style={styles.dateInput}
                      onPress={() => {
                        const currentDay = tempDate.getDate();
                        const newDay = currentDay === 31 ? 1 : currentDay + 1;
                        const newDate = new Date(tempDate);
                        newDate.setDate(newDay);
                        setTempDate(newDate);
                      }}
                    >
                      <Text style={styles.dateInputText}>{tempDate.getDate()}</Text>
                    </Pressable>
                  </View>
                )}

                {mode !== 'date' && (
                  <View style={styles.dateGroup}>
                    <Text style={styles.dateLabel}>Hour</Text>
                    <Pressable 
                      style={styles.dateInput}
                      onPress={() => {
                        const currentHour = tempDate.getHours();
                        const newHour = (currentHour + 1) % 24;
                        const newDate = new Date(tempDate);
                        newDate.setHours(newHour);
                        setTempDate(newDate);
                      }}
                    >
                      <Text style={styles.dateInputText}>{tempDate.getHours().toString().padStart(2, '0')}</Text>
                    </Pressable>
                  </View>
                )}

                {mode !== 'date' && (
                  <View style={styles.dateGroup}>
                    <Text style={styles.dateLabel}>Minute</Text>
                    <Pressable 
                      style={styles.dateInput}
                      onPress={() => {
                        const currentMinute = tempDate.getMinutes();
                        const newMinute = (currentMinute + 5) % 60;
                        const newDate = new Date(tempDate);
                        newDate.setMinutes(newMinute);
                        setTempDate(newDate);
                      }}
                    >
                      <Text style={styles.dateInputText}>{tempDate.getMinutes().toString().padStart(2, '0')}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // * Web styles
  webContainer: {
    position: 'relative',
    width: '100%',
    height: 50,
  },
  webInput: {
    width: '100%',
    height: '100%',
    padding: 12,
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    backgroundColor: 'transparent',
    border: 'none',
    // * React Native doesn't support outline property - removed
    // * For accessibility, rely on focus styles instead
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  },
  webInputDisabled: {
    opacity: 0.5,
  },
  webPlaceholder: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
    pointerEvents: 'none',
  },

  // * Native styles
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
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  placeholderText: {
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
  },
  dateIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },

  // * Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#111827',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    textTransform: 'capitalize',
  },
  datePickerContainer: {
    padding: 16,
  },
  dateInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  dateGroup: {
    alignItems: 'center',
    minWidth: 60,
  },
  dateLabel: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  dateInput: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
    minWidth: 60,
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 16,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  confirmButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#FFFFFF',
  },
});