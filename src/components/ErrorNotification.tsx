import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { getTestProps } from '../utils/react-native-web-polyfills';

const { width: screenWidth } = Dimensions.get('window');

export interface ErrorNotificationProps {
  error?: Error | string | null;
  message?: string;
  title?: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClose?: () => void;
  onRetry?: () => void;
  retryText?: string;
  persistent?: boolean;
  showProgress?: boolean;
  animated?: boolean;
  testId?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  message,
  title,
  type = 'error',
  duration = 5000,
  position = 'top-right',
  onClose,
  onRetry,
  retryText = 'Retry',
  persistent = false,
  showProgress = true,
  animated = true,
  testId = 'error-notification',
  containerStyle,
  textStyle,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  // * Get the message to display
  const displayMessage = message || (error instanceof Error ? error.message : error) || 'An error occurred';
  const displayTitle = title || (type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : type === 'success' ? 'Success' : 'Info');

  // * Handle auto-dismiss
  useEffect(() => {
    if (!persistent && duration > 0) {
      if (showProgress) {
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }).start(() => {
          handleClose();
        });
      } else {
        // Simple timer without progress
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, persistent, showProgress]);

  const handleClose = useCallback(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        onClose?.();
      });
    } else {
      setIsVisible(false);
      onClose?.();
    }
  }, [onClose, animated, fadeAnim]);

  if (!displayMessage && !error) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  // * Style based on type
  const typeColors = {
    error: {
      backgroundColor: '#f44336',
    },
    warning: {
      backgroundColor: '#ff9800',
    },
    success: {
      backgroundColor: '#4caf50',
    },
    info: {
      backgroundColor: '#2196f3',
    }
  };

  // * Icons for different types
  const icons = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️'
  };

  const currentTypeColors = typeColors[type];

  // * Position styles
  const getPositionStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      minWidth: 300,
      maxWidth: screenWidth - 40,
    };

    switch (position) {
      case 'top':
        return { ...baseStyle, top: 20, alignSelf: 'center' };
      case 'bottom':
        return { ...baseStyle, bottom: 20, alignSelf: 'center' };
      case 'top-right':
        return { ...baseStyle, top: 20, right: 20 };
      case 'top-left':
        return { ...baseStyle, top: 20, left: 20 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 20, right: 20 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 20, left: 20 };
      default:
        return { ...baseStyle, top: 20, right: 20 };
    }
  };

  return (
    <Animated.View
      {...getTestProps(`${type}-notification`)}
      style={[
        styles.container,
        getPositionStyle(),
        {
          backgroundColor: currentTypeColors.backgroundColor,
          opacity: fadeAnim,
        },
        containerStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text {...getTestProps(`${testId}-icon`)} style={styles.icon}>
            {icons[type]}
          </Text>
          <Text
            {...getTestProps(`${testId}-title`)}
            style={[
              styles.title,
              { color: currentTypeColors.color },
              textStyle,
            ]}
          >
            {displayTitle}
          </Text>
        </View>
        <TouchableOpacity
          {...getTestProps('close-notification')}
          onPress={handleClose}
          style={styles.closeButton}
          accessibilityLabel="Close notification"
        >
          <Text style={[styles.closeText, { color: currentTypeColors.color }]}>
            ×
          </Text>
        </TouchableOpacity>
      </View>

      {/* Message */}
      <Text
        {...getTestProps(`${testId}-message`)}
        style={[
          styles.message,
          { color: currentTypeColors.color },
          textStyle,
        ]}
      >
        {displayMessage}
      </Text>

      {/* Retry button */}
      {onRetry && (
        <TouchableOpacity
          {...getTestProps('retry-notification')}
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}

      {/* Progress bar */}
      {showProgress && !persistent && (
        <Animated.View
          {...getTestProps(`${testId}-progress`)}
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  message: {
    fontSize: 14,
    paddingLeft: 28,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginLeft: 28,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  retryText: {
    fontSize: 14,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});

// * Notification manager for managing multiple notifications
interface Notification {
  id: string;
  props: ErrorNotificationProps;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((props: ErrorNotificationProps) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, props }]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAll
  };
};

// * Notification container component
// Note: In React Native, this should be placed at the root of your app
// with proper positioning to overlay other content
export const NotificationContainer: React.FC<{ notifications: Notification[] }> = ({ notifications }) => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {notifications.map(({ id, props }) => (
        <ErrorNotification
          key={id}
          {...props}
          onClose={() => props.onClose?.()}
        />
      ))}
    </View>
  );
};

export default ErrorNotification;
