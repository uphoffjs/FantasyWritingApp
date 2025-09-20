/**
 * SwipeableRow.tsx
 * * Swipeable row component for delete/archive gestures
 * * iOS/Android pattern for list item interaction
 * ! IMPORTANT: Uses React Native's PanResponder for gesture handling
 */

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  TouchableOpacity,
  Alert,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  // * Customization
  deleteText?: string;
  archiveText?: string;
  deleteColor?: string;
  archiveColor?: string;
  swipeThreshold?: number; // * Percentage of screen width to trigger action
  disabled?: boolean;
  testID?: string;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onDelete,
  onArchive,
  onSwipeStart,
  onSwipeEnd,
  deleteText = 'Delete',
  archiveText = 'Archive',
  deleteColor,
  archiveColor,
  swipeThreshold = 0.3, // * 30% of screen width
  disabled = false,
  testID = 'swipeable-row',
}) => {
  const { theme } = useTheme();
  const [rowWidth, setRowWidth] = useState(SCREEN_WIDTH);
  
  // * Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteActionTranslateX = useRef(new Animated.Value(0)).current;
  const archiveActionTranslateX = useRef(new Animated.Value(0)).current;
  const deleteActionScale = useRef(new Animated.Value(0.8)).current;
  const archiveActionScale = useRef(new Animated.Value(0.8)).current;
  
  // * Track if we're swiping
  const isSwipingRef = useRef(false);
  const swipeDirectionRef = useRef<'left' | 'right' | null>(null);
  
  // * Colors with defaults
  const finalDeleteColor = deleteColor || theme.colors.semantic.error;
  const finalArchiveColor = archiveColor || theme.colors.accent.swiftness;

  // * Handle row layout to get actual width
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setRowWidth(event.nativeEvent.layout.width);
  }, []);

  // * Animate actions based on swipe position
  const updateActionAnimations = useCallback((gestureX: number) => {
    const absX = Math.abs(gestureX);
    const progress = Math.min(absX / (rowWidth * swipeThreshold), 1);
    
    if (gestureX > 0 && onArchive) {
      // * Swiping right - show archive
      Animated.parallel([
        Animated.spring(archiveActionScale, {
          toValue: 0.8 + (0.2 * progress),
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(archiveActionTranslateX, {
          toValue: Math.min(gestureX * 0.5, 100),
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (gestureX < 0 && onDelete) {
      // * Swiping left - show delete
      Animated.parallel([
        Animated.spring(deleteActionScale, {
          toValue: 0.8 + (0.2 * progress),
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(deleteActionTranslateX, {
          toValue: Math.max(gestureX * 0.5, -100),
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [rowWidth, swipeThreshold, onArchive, onDelete, archiveActionScale, archiveActionTranslateX, deleteActionScale, deleteActionTranslateX]);

  // * Pan responder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // * Only respond to horizontal swipes
        return !disabled && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        isSwipingRef.current = true;
        onSwipeStart?.();
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        
        // * Determine swipe direction
        if (dx > 0 && onArchive) {
          swipeDirectionRef.current = 'right';
          // * Apply resistance when swiping right
          const resistance = dx > rowWidth * 0.5 ? 0.3 : 1;
          const adjustedDx = dx * resistance;
          translateX.setValue(adjustedDx);
          updateActionAnimations(adjustedDx);
        } else if (dx < 0 && onDelete) {
          swipeDirectionRef.current = 'left';
          // * Apply resistance when swiping left
          const resistance = Math.abs(dx) > rowWidth * 0.5 ? 0.3 : 1;
          const adjustedDx = dx * resistance;
          translateX.setValue(adjustedDx);
          updateActionAnimations(adjustedDx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;
        const absX = Math.abs(dx);
        const threshold = rowWidth * swipeThreshold;
        
        isSwipingRef.current = false;
        swipeDirectionRef.current = null;
        
        if (absX > threshold) {
          // * Trigger action
          if (dx > 0 && onArchive) {
            // * Animate off screen to the right
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: rowWidth,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(archiveActionScale, {
                toValue: 1.2,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              onArchive();
              // * Reset position after action
              translateX.setValue(0);
              archiveActionScale.setValue(0.8);
              archiveActionTranslateX.setValue(0);
            });
          } else if (dx < 0 && onDelete) {
            // * Show delete confirmation on mobile
            if (Platform.OS !== 'web') {
              Alert.alert(
                'Delete Item',
                'Are you sure you want to delete this item?',
                [
                  {
                    text: 'Cancel',
                    onPress: () => {
                      // * Animate back to center
                      Animated.spring(translateX, {
                        toValue: 0,
                        friction: 8,
                        tension: 40,
                        useNativeDriver: true,
                      }).start();
                      deleteActionScale.setValue(0.8);
                      deleteActionTranslateX.setValue(0);
                    },
                    style: 'cancel',
                  },
                  {
                    text: 'Delete',
                    onPress: () => {
                      // * Animate off screen to the left
                      Animated.parallel([
                        Animated.timing(translateX, {
                          toValue: -rowWidth,
                          duration: 200,
                          useNativeDriver: true,
                        }),
                        Animated.timing(deleteActionScale, {
                          toValue: 1.2,
                          duration: 200,
                          useNativeDriver: true,
                        }),
                      ]).start(() => {
                        onDelete();
                        // * Reset position after action
                        translateX.setValue(0);
                        deleteActionScale.setValue(0.8);
                        deleteActionTranslateX.setValue(0);
                      });
                    },
                    style: 'destructive',
                  },
                ]
              );
            } else {
              // * On web, delete immediately
              Animated.parallel([
                Animated.timing(translateX, {
                  toValue: -rowWidth,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(deleteActionScale, {
                  toValue: 1.2,
                  duration: 200,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                onDelete();
                translateX.setValue(0);
                deleteActionScale.setValue(0.8);
                deleteActionTranslateX.setValue(0);
              });
            }
          }
        } else {
          // * Snap back to center
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
          
          // * Reset action animations
          Animated.parallel([
            Animated.spring(deleteActionScale, {
              toValue: 0.8,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(archiveActionScale, {
              toValue: 0.8,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(deleteActionTranslateX, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(archiveActionTranslateX, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
        
        onSwipeEnd?.();
      },
      onPanResponderTerminate: () => {
        // * Animation was interrupted, snap back
        isSwipingRef.current = false;
        swipeDirectionRef.current = null;
        
        Animated.spring(translateX, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
        
        onSwipeEnd?.();
      },
    })
  ).current;

  // * Quick action buttons for accessibility
  const handleDeletePress = useCallback(() => {
    if (onDelete && !disabled) {
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Delete Item',
          'Are you sure you want to delete this item?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: onDelete, style: 'destructive' },
          ]
        );
      } else {
        onDelete();
      }
    }
  }, [onDelete, disabled]);

  const handleArchivePress = useCallback(() => {
    if (onArchive && !disabled) {
      onArchive();
    }
  }, [onArchive, disabled]);

  // * Don't apply swipe on web by default (unless explicitly enabled)
  if (Platform.OS === 'web' && !onDelete && !onArchive) {
    return <View testID={testID}>{children}</View>;
  }

  return (
    <View style={styles.container} onLayout={handleLayout} testID={testID}>
      {/* * Background actions */}
      <View style={[styles.actionsContainer, { backgroundColor: theme.colors.surface.backgroundAlt }]}>
        {/* * Archive action (left side) */}
        {onArchive && (
          <Animated.View
            style={[
              styles.actionLeft,
              {
                backgroundColor: finalArchiveColor,
                transform: [
                  { translateX: archiveActionTranslateX },
                  { scale: archiveActionScale },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleArchivePress}
              style={styles.actionButton}
              testID={`${testID}-archive-action`}
            >
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
                📦 {archiveText}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* * Delete action (right side) */}
        {onDelete && (
          <Animated.View
            style={[
              styles.actionRight,
              {
                backgroundColor: finalDeleteColor,
                transform: [
                  { translateX: deleteActionTranslateX },
                  { scale: deleteActionScale },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleDeletePress}
              style={styles.actionButton}
              testID={`${testID}-delete-action`}
            >
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
                🗑️ {deleteText}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
      
      {/* * Main content */}
      <Animated.View
        style={[
          styles.rowContent,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  rowContent: {
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  actionLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    minWidth: 100,
  },
  actionRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    minWidth: 100,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SwipeableRow;