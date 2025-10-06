/**
 * useRevealAnimation.ts
 * * Custom hook for managing content reveal animations
 * * Provides easy-to-use animation controls with staggered support
 * ! IMPORTANT: Integrates with React Native's Animated API
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// * Animation hook requires 'any' for React Native Animated.Value types
// * Animated timing configurations have complex type structures requiring flexibility

import { useEffect, useRef, useState, useMemo } from 'react';
import { Animated } from 'react-native';

export type AnimationType = 
  | 'fadeIn'
  | 'slideUp' 
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'bounceIn';

interface RevealAnimationOptions {
  // * Type of animation
  type?: AnimationType;
  // * Duration in milliseconds
  duration?: number;
  // * Delay before animation starts
  delay?: number;
  // * Distance for slide animations
  distance?: number;
  // * Initial scale for scale animations
  initialScale?: number;
  // * Whether to auto-start animation
  autoStart?: boolean;
  // * Whether animation has been triggered
  triggered?: boolean;
  // * Stagger delay for multiple items
  staggerDelay?: number;
  // * Index for staggered animations
  index?: number;
}

interface RevealAnimationResult {
  // * Animated style object to apply to component
  animatedStyle: any;
  // * Function to trigger animation
  trigger: () => void;
  // * Function to reset animation
  reset: () => void;
  // * Whether animation is running
  isAnimating: boolean;
  // * Animation progress (0-1)
  progress: Animated.Value;
}

export const useRevealAnimation = (
  options: RevealAnimationOptions = {}
): RevealAnimationResult => {
  const {
    type = 'fadeIn',
    duration = 600,
    delay = 0,
    distance = 50,
    initialScale = 0.85,
    autoStart = true,
    triggered = false,
    staggerDelay = 100,
    index = 0,
  } = options;

  // * Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;
  
  // * Animation state
  const [isAnimating, setIsAnimating] = useState(false);

  // * Calculate total delay including stagger
  const totalDelay = delay + (index * staggerDelay);

  // * Initialize animation values based on type
  useEffect(() => {
    resetAnimation();
    
    if (autoStart || triggered) {
      trigger();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, autoStart, triggered]);

  // * Reset animation to initial state
  const resetAnimation = () => {
    opacity.setValue(0);
    progress.setValue(0);
    
    switch (type) {
      case 'slideUp':
        translateY.setValue(distance);
        translateX.setValue(0);
        scale.setValue(1);
        break;
      case 'slideDown':
        translateY.setValue(-distance);
        translateX.setValue(0);
        scale.setValue(1);
        break;
      case 'slideLeft':
        translateX.setValue(distance);
        translateY.setValue(0);
        scale.setValue(1);
        break;
      case 'slideRight':
        translateX.setValue(-distance);
        translateY.setValue(0);
        scale.setValue(1);
        break;
      case 'scaleIn':
      case 'bounceIn':
        scale.setValue(initialScale);
        translateX.setValue(0);
        translateY.setValue(0);
        break;
      default: // fadeIn
        translateX.setValue(0);
        translateY.setValue(0);
        scale.setValue(1);
        break;
    }
  };

  // * Create animation based on type
  const createAnimation = (): Animated.CompositeAnimation => {
    const animations: Animated.CompositeAnimation[] = [];

    // * Fade animation (common to all types)
    animations.push(
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay: totalDelay,
        useNativeDriver: true,
      })
    );

    // * Progress animation
    animations.push(
      Animated.timing(progress, {
        toValue: 1,
        duration,
        delay: totalDelay,
        useNativeDriver: false, // * Progress might be used for non-transform properties
      })
    );

    // * Type-specific animations
    switch (type) {
      case 'slideUp':
        animations.push(
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            tension: 40,
            delay: totalDelay,
            useNativeDriver: true,
          })
        );
        break;

      case 'slideDown':
        animations.push(
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            tension: 40,
            delay: totalDelay,
            useNativeDriver: true,
          })
        );
        break;

      case 'slideLeft':
        animations.push(
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            tension: 40,
            delay: totalDelay,
            useNativeDriver: true,
          })
        );
        break;

      case 'slideRight':
        animations.push(
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            tension: 40,
            delay: totalDelay,
            useNativeDriver: true,
          })
        );
        break;

      case 'scaleIn':
        animations.push(
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            delay: totalDelay,
            useNativeDriver: true,
          })
        );
        break;

      case 'bounceIn':
        // * Bounce effect with overshoot
        animations.push(
          Animated.sequence([
            Animated.delay(totalDelay),
            Animated.spring(scale, {
              toValue: 1.05,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              friction: 5,
              tension: 40,
              useNativeDriver: true,
            }),
          ])
        );
        break;
    }

    // * Run animations in parallel
    return Animated.parallel(animations);
  };

  // * Trigger animation
  const trigger = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const animation = createAnimation();
    
    animation.start(() => {
      setIsAnimating(false);
    });
  };

  // * Reset animation
  const reset = () => {
    setIsAnimating(false);
    resetAnimation();
  };

  // * Compute animated style
  const animatedStyle = useMemo(() => {
    const style: any = {
      opacity,
      transform: [],
    };

    // * Add transforms based on animation type
    if (type.includes('slide')) {
      style.transform.push({ translateX });
      style.transform.push({ translateY });
    }

    if (type === 'scaleIn' || type === 'bounceIn') {
      style.transform.push({ scale });
    }

    return style;
  }, [type, opacity, translateX, translateY, scale]);

  return {
    animatedStyle,
    trigger,
    reset,
    isAnimating,
    progress,
  };
};

/**
 * * Hook for staggered animations on lists
 * * Animates items one by one with a delay between each
 */
export const useStaggeredReveal = (
  itemCount: number,
  options: Omit<RevealAnimationOptions, 'index'> = {}
) => {
  const animations = Array.from({ length: itemCount }, (_, index) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRevealAnimation({
      ...options,
      index,
      autoStart: options.autoStart ?? true,
    })
  );

  const triggerAll = () => {
    animations.forEach(anim => anim.trigger());
  };

  const resetAll = () => {
    animations.forEach(anim => anim.reset());
  };

  return {
    animations,
    triggerAll,
    resetAll,
  };
};

export default useRevealAnimation;