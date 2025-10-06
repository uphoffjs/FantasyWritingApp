/* eslint-disable @typescript-eslint/no-explicit-any */
// * Lazy image loading requires flexible typing for image load events and error handling

/**
 * LazyImage.tsx
 * * Optimized image component with lazy loading and progressive loading
 * * Supports placeholder, loading states, and error fallback
 * ! IMPORTANT: Improves performance by loading images only when visible
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  ImageProps,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

import { getTestProps } from '../utils/react-native-web-polyfills';
interface LazyImageProps extends Omit<ImageProps, 'source'> {
  // * Main image source
  source: ImageSourcePropType;
  // * Low-quality placeholder image for progressive loading
  placeholder?: ImageSourcePropType;
  // * Fallback image on error
  fallback?: ImageSourcePropType;
  // * Loading indicator while image loads
  showLoadingIndicator?: boolean;
  // * Threshold for intersection observer (web)
  threshold?: number;
  // * Enable fade-in animation
  fadeIn?: boolean;
  // * Fade animation duration
  fadeDuration?: number;
  // * Force immediate load (bypass lazy loading)
  immediate?: boolean;
  // * Image quality for web (0-1)
  quality?: number;
  // * Test ID for testing
  testID?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  source,
  placeholder,
  fallback,
  showLoadingIndicator = true,
  threshold = 0.1,
  fadeIn = true,
  fadeDuration = 300,
  immediate = false,
  quality = 0.85,
  style,
  testID = 'lazy-image',
  ...imageProps
}) => {
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(immediate);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageRef = useRef<View>(null);

  // * Intersection Observer for web lazy loading
  useEffect(() => {
    if (Platform.OS === 'web' && !immediate && imageRef.current) {
      // ? Use IntersectionObserver for efficient viewport detection
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
            }
          });
        },
        { threshold }
      );

      // * Get the DOM node from React Native Web
      const node = (imageRef.current as any)._nativeTag;
      if (node) {
        observer.observe(node);
      }

      return () => {
        if (node) {
          observer.unobserve(node);
        }
      };
    } else if (Platform.OS !== 'web') {
      // * On native, we can use a simpler approach
      // TODO: Implement viewport detection for native if needed
      setShouldLoad(true);
    }
  }, [immediate, threshold]);

  // * Handle image load success
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);

    if (fadeIn) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  };

  // * Handle image load error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);

    // * Still fade in the fallback image
    if (fadeIn) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    }
  };

  // * Determine which source to use
  const getImageSource = () => {
    if (hasError && fallback) {
      return fallback;
    }
    if (!shouldLoad && placeholder) {
      return placeholder;
    }
    return source;
  };

  // * Apply quality optimization for web
  const getOptimizedSource = () => {
    const imageSource = getImageSource();

    if (Platform.OS === 'web' && typeof imageSource === 'object' && 'uri' in imageSource) {
      // * Add quality parameter for web images
      const uri = imageSource.uri;
      if (uri && uri.includes('?')) {
        return { ...imageSource, uri: `${uri}&q=${quality * 100}` };
      } else {
        return { ...imageSource, uri: `${uri}?q=${quality * 100}` };
      }
    }

    return imageSource;
  };

  return (
    <View ref={imageRef} style={style} {...getTestProps(testID)}>
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <Image
          {...imageProps}
          source={getOptimizedSource()}
          onLoad={handleLoad}
          onError={handleError}
          style={[
            StyleSheet.absoluteFillObject,
            style,
          ]}
          {...getTestProps(`${testID}-image`)}
        />
      </Animated.View>

      {/* Loading indicator */}
      {showLoadingIndicator && !isLoaded && !hasError && shouldLoad && (
        <View style={styles.loadingContainer} {...getTestProps(`${testID}-loading`)}>
          <ActivityIndicator
            size="small"
            color={theme.colors.primary.DEFAULT}
          />
        </View>
      )}
    </View>
  );
};

// * Progressive image variant with automatic placeholder
export const ProgressiveImage: React.FC<LazyImageProps> = ({
  source,
  ...props
}) => {
  // * Generate a low-quality placeholder from the main source
  const getPlaceholder = () => {
    if (typeof source === 'object' && 'uri' in source) {
      const uri = source.uri;
      if (uri) {
        // * Add low quality parameter for placeholder
        const placeholderUri = uri.includes('?')
          ? `${uri}&w=50&q=20`
          : `${uri}?w=50&q=20`;
        return { ...source, uri: placeholderUri };
      }
    }
    return source;
  };

  return (
    <LazyImage
      source={source}
      placeholder={getPlaceholder()}
      fadeIn={true}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LazyImage;