/**
 * ImagePicker.tsx
 * Cross-platform image picker component for cover images
 * Supports web file input and mobile image selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

import { getTestProps } from '../utils/react-native-web-polyfills';
interface ImagePickerProps {
  value?: string;
  onChange: (imageUri: string | undefined) => void;
  label?: string;
  placeholder?: string;
  testID?: string;
}

export function ImagePicker({
  value,
  onChange,
  label = 'Cover Image',
  placeholder = 'Tap to select image',
  testID = 'image-picker',
}: ImagePickerProps) {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  // * Handle image selection for web platform
  const handleWebImageSelect = () => {
    if (Platform.OS !== 'web') return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        // * Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'Image size must be less than 5MB');
          return;
        }

        // * Validate file type
        if (!file.type.startsWith('image/')) {
          Alert.alert('Error', 'Please select a valid image file');
          return;
        }

        // * Create object URL for preview
        const imageUrl = URL.createObjectURL(file);
        onChange(imageUrl);
        setImageError(false);
      }
    };

    input.click();
  };

  // * Handle image selection for mobile platforms
  const handleMobileImageSelect = async () => {
    if (Platform.OS === 'web') return;

    // TODO: Implement mobile image picker using expo-image-picker
    // * For now, show a placeholder alert
    Alert.alert(
      'Select Image',
      'Image selection will be available in the mobile app',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use Placeholder', onPress: () => {
          // * Use a placeholder image for demo
          onChange('https://via.placeholder.com/400x600/4A5568/F9FAFB?text=Cover+Image');
          setImageError(false);
        }},
      ]
    );
  };

  const handleSelectImage = () => {
    if (Platform.OS === 'web') {
      handleWebImageSelect();
    } else {
      handleMobileImageSelect();
    }
  };

  const handleRemoveImage = () => {
    onChange(undefined);
    setImageError(false);
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container} {...getTestProps(testID)}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Pressable
        style={styles.imageContainer}
        onPress={value ? undefined : handleSelectImage}
        {...getTestProps(`${testID}-button`)}
      >
        {value && !imageError ? (
          <>
            <Image
              source={{ uri: value }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
              {...getTestProps(`${testID}-preview`)}
            />
            <View style={styles.imageOverlay}>
              <Pressable
                style={styles.changeButton}
                onPress={handleSelectImage}
                {...getTestProps(`${testID}-change`)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </Pressable>
              <Pressable
                style={styles.removeButton}
                onPress={handleRemoveImage}
                {...getTestProps(`${testID}-remove`)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>{placeholder}</Text>
            <Text style={styles.placeholderHint}>
              {Platform.OS === 'web' 
                ? 'Click to browse or drag & drop'
                : 'Tap to select from gallery'
              }
            </Text>
          </View>
        )}
      </Pressable>

      {value && (
        <Text style={styles.imageInfo}>
          {Platform.OS === 'web' ? 'Image selected' : 'Cover image set'}
        </Text>
      )}
    </View>
  );
}

// * Create theme-aware styles
const getStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.ui,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 2/3, // * Book cover aspect ratio
    maxHeight: 300,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary.borderLight,
    backgroundColor: theme.colors.surface.backgroundAlt,
    overflow: 'hidden',
    alignSelf: 'center',
    maxWidth: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.overlay,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  changeButton: {
    flex: 1,
    backgroundColor: theme.colors.button.primary,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  changeButtonText: {
    color: theme.colors.text.onPrimary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as any,
    fontFamily: theme.typography.fontFamily.ui,
  },
  removeButton: {
    flex: 1,
    backgroundColor: theme.colors.semantic.dragonfire,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  removeButtonText: {
    color: theme.colors.text.onPrimary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as any,
    fontFamily: theme.typography.fontFamily.ui,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
    opacity: 0.6,
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium as any,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.ui,
  },
  placeholderHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.ui,
  },
  imageInfo: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.ui,
  },
});