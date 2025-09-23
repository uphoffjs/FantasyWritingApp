/**
 * ParchmentTexture.tsx
 * Provides subtle parchment texture overlay for backgrounds
 * Works across web and native platforms
 */

import React from 'react';
import {
  View,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

interface ParchmentTextureProps {
  children: React.ReactNode;
  opacity?: number; // * Default: 0.05 (5% opacity for subtle effect)
  style?: ViewStyle;
  testID?: string;
}

/**
 * ParchmentTexture component provides a subtle fantasy-themed texture overlay
 * Uses CSS gradients on web and ImageBackground on native platforms
 */
export const ParchmentTexture: React.FC<ParchmentTextureProps> = ({
  children,
  opacity = 0.05,
  style,
  testID = 'parchment-texture',
}) => {
  const { theme } = useTheme();
  
  // * Web implementation using CSS gradients and patterns
  if (Platform.OS === 'web') {
    const webStyles: React.CSSProperties = {
      position: 'relative' as const,
      // * Create subtle parchment texture using CSS gradients
      backgroundImage: `
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(${theme.mode === 'dark' ? '255, 255, 255' : '139, 69, 19'}, ${opacity * 0.3}) 10px,
          rgba(${theme.mode === 'dark' ? '255, 255, 255' : '139, 69, 19'}, ${opacity * 0.3}) 20px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 10px,
          rgba(${theme.mode === 'dark' ? '255, 255, 255' : '160, 82, 45'}, ${opacity * 0.2}) 10px,
          rgba(${theme.mode === 'dark' ? '255, 255, 255' : '160, 82, 45'}, ${opacity * 0.2}) 20px
        ),
        radial-gradient(
          ellipse at center,
          rgba(${theme.mode === 'dark' ? '255, 255, 255' : '218, 165, 32'}, ${opacity * 0.1}) 0%,
          transparent 70%
        )
      `,
      backgroundSize: '100px 100px, 100px 100px, cover',
      backgroundPosition: '0 0, 50px 0, center',
      ...(style as React.CSSProperties),
    };

    return (
      <View 
        style={[styles.container, webStyles as any]}
        testID={testID}
      >
        {children}
      </View>
    );
  }

  // * Native implementation using ImageBackground
  // * For production, you would add actual parchment texture images to assets
  // * For now, using a colored overlay as fallback
  return (
    <View 
      style={[
        styles.container, 
        style,
        {
          backgroundColor: theme.colors.surface.background,
        }
      ]}
      testID={testID}
    >
      {/* * Subtle texture overlay using semi-transparent view */}
      <View 
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: theme.mode === 'dark'
              ? theme.colors.metal.gold
              : theme.colors.metal.bronze,
            opacity: opacity,
            pointerEvents: 'none' as any, // Use style.pointerEvents instead of deprecated prop
          }
        ]}
      />
      {children}
    </View>
  );
};

/**
 * BackgroundWithTexture component - convenience wrapper for applying texture
 * to full background containers
 */
interface BackgroundWithTextureProps extends ParchmentTextureProps {
  variant?: 'subtle' | 'medium' | 'strong';
}

export const BackgroundWithTexture: React.FC<BackgroundWithTextureProps> = ({
  children,
  variant = 'subtle',
  style,
  testID = 'background-with-texture',
  ...props
}) => {
  const { theme } = useTheme();
  
  // * Determine opacity based on variant
  const getOpacity = () => {
    switch (variant) {
      case 'strong':
        return 0.12;
      case 'medium':
        return 0.08;
      case 'subtle':
      default:
        return 0.05;
    }
  };

  return (
    <ParchmentTexture
      opacity={getOpacity()}
      style={[
        styles.backgroundContainer,
        {
          backgroundColor: theme.colors.surface.background,
        },
        style,
      ]}
      testID={testID}
      {...props}
    >
      {children}
    </ParchmentTexture>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative' as any,
  },
  backgroundContainer: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
  },
});

export default ParchmentTexture;