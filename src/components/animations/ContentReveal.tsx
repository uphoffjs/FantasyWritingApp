/**
 * ContentReveal.tsx
 * * Smooth content reveal animation component
 * * Provides multiple animation types for content appearance
 * * Works with React Native's Animated API for cross-platform support
 * ! IMPORTANT: All interactive components must have testID for testing
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { getTestProps } from '../utils/react-native-web-polyfills';
import {
  Animated,
  Platform,
  ViewStyle,
  Dimensions,
} from 'react-native';

// * Animation types available
export type RevealAnimation = 
  | 'fadeIn'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'scaleOut'
  | 'flipIn'
  | 'bounceIn'
  | 'rotateIn';

interface ContentRevealProps {
  // * Type of animation to use
  animation?: RevealAnimation;
  // * Duration of animation in milliseconds
  duration?: number;
  // * Delay before animation starts
  delay?: number;
  // * Whether to trigger animation
  trigger?: boolean;
  // * Animation easing function
  easing?: 'linear' | 'ease' | 'spring' | 'bounce';
  // * Distance for slide animations
  distance?: number;
  // * Scale factor for scale animations
  scaleFactor?: number;
  // * Rotation angle for rotate animations
  rotation?: string;
  // * Children to animate
  children: React.ReactNode;
  // * Custom style overrides
  style?: ViewStyle;
  // * Test ID for testing
  testID?: string;
  // * Callback when animation completes
  onAnimationComplete?: () => void;
  // * Whether to loop the animation
  loop?: boolean;
  // * Whether to play animation on mount
  animateOnMount?: boolean;
}

// * Get window dimensions for slide calculations
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ContentReveal: React.FC<ContentRevealProps> = ({
  animation = 'fadeIn',
  duration = 600,
  delay = 0,
  trigger = true,
  easing = 'ease',
  distance = 50,
  scaleFactor = 0.85,
  rotation = '15deg',
  children,
  style,
  testID = 'content-reveal',
  onAnimationComplete,
  loop = false,
  animateOnMount = true,
}) => {
  // * Animation values
  const fadeAnim = useRef(new Animated.Value(animation.includes('fade') ? 0 : 1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(animation.includes('scale') ? scaleFactor : 1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // * Initialize animation start values based on type
  useEffect(() => {
    if (animateOnMount) {
      resetAnimation();
    }
  }, [animation]);

  // * Reset animation to initial state
  const resetAnimation = () => {
    switch (animation) {
      case 'fadeIn':
        fadeAnim.setValue(0);
        break;
      case 'slideUp':
        translateYAnim.setValue(distance);
        fadeAnim.setValue(0);
        break;
      case 'slideDown':
        translateYAnim.setValue(-distance);
        fadeAnim.setValue(0);
        break;
      case 'slideLeft':
        translateXAnim.setValue(distance);
        fadeAnim.setValue(0);
        break;
      case 'slideRight':
        translateXAnim.setValue(-distance);
        fadeAnim.setValue(0);
        break;
      case 'scaleIn':
        scaleAnim.setValue(scaleFactor);
        fadeAnim.setValue(0);
        break;
      case 'scaleOut':
        scaleAnim.setValue(1 / scaleFactor);
        fadeAnim.setValue(0);
        break;
      case 'flipIn':
        rotateAnim.setValue(0.5);
        fadeAnim.setValue(0);
        break;
      case 'bounceIn':
        scaleAnim.setValue(scaleFactor);
        fadeAnim.setValue(0);
        break;
      case 'rotateIn':
        rotateAnim.setValue(1);
        fadeAnim.setValue(0);
        break;
    }
  };

  // * Get animation configuration based on easing type
  const getAnimationConfig = () => {
    switch (easing) {
      case 'spring':
        return {
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        };
      case 'bounce':
        return {
          useNativeDriver: true,
          friction: 3,
          tension: 40,
        };
      case 'linear':
        return {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        };
      case 'ease':
      default:
        return {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        };
    }
  };

  // * Create animation based on type
  const createAnimation = () => {
    const animationConfig = getAnimationConfig();
    const animations: Animated.CompositeAnimation[] = [];

    // * Always animate fade
    if (animation !== 'scaleOut') {
      const fadeAnimation = easing === 'spring' || easing === 'bounce'
        ? Animated.spring(fadeAnim, { ...animationConfig, toValue: 1 })
        : Animated.timing(fadeAnim, { ...animationConfig, toValue: 1 });
      animations.push(fadeAnimation);
    }

    // * Add specific animations based on type
    switch (animation) {
      case 'slideUp':
        const slideUpAnimation = easing === 'spring' || easing === 'bounce'
          ? Animated.spring(translateYAnim, { ...animationConfig, toValue: 0 })
          : Animated.timing(translateYAnim, { ...animationConfig, toValue: 0 });
        animations.push(slideUpAnimation);
        break;

      case 'slideDown':
        const slideDownAnimation = easing === 'spring' || easing === 'bounce'
          ? Animated.spring(translateYAnim, { ...animationConfig, toValue: 0 })
          : Animated.timing(translateYAnim, { ...animationConfig, toValue: 0 });
        animations.push(slideDownAnimation);
        break;

      case 'slideLeft':
        const slideLeftAnimation = easing === 'spring' || easing === 'bounce'
          ? Animated.spring(translateXAnim, { ...animationConfig, toValue: 0 })
          : Animated.timing(translateXAnim, { ...animationConfig, toValue: 0 });
        animations.push(slideLeftAnimation);
        break;

      case 'slideRight':
        const slideRightAnimation = easing === 'spring' || easing === 'bounce'
          ? Animated.spring(translateXAnim, { ...animationConfig, toValue: 0 })
          : Animated.timing(translateXAnim, { ...animationConfig, toValue: 0 });
        animations.push(slideRightAnimation);
        break;

      case 'scaleIn':
      case 'scaleOut':
        const scaleAnimation = easing === 'spring' || easing === 'bounce'
          ? Animated.spring(scaleAnim, { ...animationConfig, toValue: 1 })
          : Animated.timing(scaleAnim, { ...animationConfig, toValue: 1 });
        animations.push(scaleAnimation);
        break;

      case 'flipIn':
        const flipAnimation = Animated.timing(rotateAnim, {
          ...animationConfig,
          toValue: 0,
        });
        animations.push(flipAnimation);
        break;

      case 'bounceIn':
        // * Bounce effect with overshoot
        const bounceSequence = Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: duration * 0.6,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: duration * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration * 0.2,
            useNativeDriver: true,
          }),
        ]);
        animations.push(bounceSequence);
        break;

      case 'rotateIn':
        const rotateAnimation = Animated.timing(rotateAnim, {
          ...animationConfig,
          toValue: 0,
        });
        animations.push(rotateAnimation);
        break;
    }

    // * Run animations in parallel
    return animations.length > 1 
      ? Animated.parallel(animations)
      : animations[0];
  };

  // * Trigger animation when conditions are met
  useEffect(() => {
    if (trigger) {
      const animation = createAnimation();
      
      if (loop) {
        const loopAnimation = Animated.loop(
          Animated.sequence([
            animation,
            Animated.delay(500), // * Pause between loops
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              // * Reset other values
              Animated.timing(scaleAnim, {
                toValue: animation.includes('scale') ? scaleFactor : 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
        loopAnimation.start();
      } else {
        animation.start(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        });
      }
    }
  }, [trigger]);

  // * Get rotation interpolation for rotate animations
  const getRotationInterpolation = () => {
    if (animation === 'flipIn') {
      return rotateAnim.interpolate({
        inputRange: [0, 0.5],
        outputRange: ['0deg', '180deg'],
      });
    } else if (animation === 'rotateIn') {
      return rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', rotation],
      });
    }
    return '0deg';
  };

  // * Compute animated styles
  const animatedStyles = useMemo(() => {
    const styles: any = {
      opacity: fadeAnim,
      transform: [],
    };

    // * Add transforms based on animation type
    if (translateXAnim._value !== 0 || animation.includes('slide')) {
      styles.transform.push({ translateX: translateXAnim });
    }
    if (translateYAnim._value !== 0 || animation.includes('slide')) {
      styles.transform.push({ translateY: translateYAnim });
    }
    if (animation.includes('scale') || animation === 'bounceIn') {
      styles.transform.push({ scale: scaleAnim });
    }
    if (animation === 'flipIn' || animation === 'rotateIn') {
      styles.transform.push({ rotate: getRotationInterpolation() });
    }

    return styles;
  }, [animation]);

  return (
    <Animated.View
      style={[
        animatedStyles,
        style,
      ]}
      {...getTestProps(testID)}
    >
      {children}
    </Animated.View>
  );
};

export default ContentReveal;