/**
 * PullToRefresh.tsx
 * * Enhanced pull to refresh component with custom animations
 * * Provides visual feedback and sync status updates
 * ! IMPORTANT: Works with ScrollView and FlatList components
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

import { getTestProps } from '../utils/react-native-web-polyfills';
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  // * Customization
  refreshing?: boolean;
  enabled?: boolean;
  progressViewOffset?: number;
  // * Custom messages
  pullingText?: string;
  readyText?: string;
  refreshingText?: string;
  successText?: string;
  errorText?: string;
  // * Sync status
  lastSyncTime?: Date;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  // * Styling
  tintColor?: string;
  backgroundColor?: string;
  testID?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  enabled = true,
  progressViewOffset = 0,
  pullingText = 'Pull to sync',
  readyText: _readyText = 'Release to sync',
  refreshingText = 'Syncing...',
  successText = 'Sync complete',
  errorText = 'Sync failed',
  lastSyncTime,
  syncStatus = 'idle',
  tintColor,
  backgroundColor,
  testID = 'pull-to-refresh',
}) => {
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(refreshing);
  const [statusMessage, setStatusMessage] = useState(pullingText);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // * Animation values
  const pullDistance = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  
  // * Track pull state
  const pullStateRef = useRef<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle');
  
  // * Colors with theme defaults
  const finalTintColor = tintColor || theme.colors.accent.finesse;
  const finalBackgroundColor = backgroundColor || theme.colors.surface.background;

  // * Update refreshing state
  useEffect(() => {
    setIsRefreshing(refreshing);
    
    if (!refreshing && pullStateRef.current === 'refreshing') {
      // * Show success animation
      handleRefreshComplete();
    }
  }, [refreshing, handleRefreshComplete]);

  // * Update status message based on sync status
  useEffect(() => {
    switch (syncStatus) {
      case 'syncing':
        setStatusMessage(refreshingText);
        startRefreshAnimation();
        break;
      case 'success':
        setStatusMessage(successText);
        showSuccessAnimation();
        break;
      case 'error':
        setStatusMessage(errorText);
        stopRefreshAnimation();
        break;
      default:
        setStatusMessage(pullingText);
        break;
    }
  }, [syncStatus, refreshingText, successText, errorText, pullingText, showSuccessAnimation, startRefreshAnimation, stopRefreshAnimation]);

  // * Start refresh animation
  const startRefreshAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(iconRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [iconRotation]);

  // * Stop refresh animation
  const stopRefreshAnimation = useCallback(() => {
    iconRotation.stopAnimation();
    Animated.timing(iconRotation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [iconRotation]);

  // * Show success animation
  const showSuccessAnimation = useCallback(() => {
    setShowSuccess(true);
    
    Animated.sequence([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccess(false);
    });
  }, [successOpacity]);

  // * Handle refresh complete
  const handleRefreshComplete = useCallback(() => {
    pullStateRef.current = 'idle';
    stopRefreshAnimation();
    showSuccessAnimation();
    
    // * Reset pull distance
    Animated.spring(pullDistance, {
      toValue: 0,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [pullDistance, stopRefreshAnimation, showSuccessAnimation]);

  // * Handle refresh trigger
  const handleRefresh = useCallback(async () => {
    if (!enabled || isRefreshing) return;
    
    pullStateRef.current = 'refreshing';
    setIsRefreshing(true);
    setStatusMessage(refreshingText);
    startRefreshAnimation();
    
    try {
      await onRefresh();
      setStatusMessage(successText);
    } catch (error) {
      setStatusMessage(errorText);
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
      handleRefreshComplete();
    }
  }, [enabled, isRefreshing, onRefresh, refreshingText, successText, errorText, startRefreshAnimation, handleRefreshComplete]);

  // * Format last sync time
  const formatSyncTime = (date?: Date) => {
    if (!date) return 'Never synced';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // * Custom refresh control for native platforms
  const refreshControl = (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor={finalTintColor}
      colors={[finalTintColor]} // * Android
      progressBackgroundColor={finalBackgroundColor} // * Android
      progressViewOffset={progressViewOffset} // * Android
      title={statusMessage} // * iOS
      titleColor={theme.colors.text.secondary} // * iOS
      {...getTestProps(testID)}
    />
  );

  // * For web, create a custom pull indicator
  const webPullIndicator = Platform.OS === 'web' && (
    <View style={[styles.webIndicator, { backgroundColor: finalBackgroundColor }]}>
      <Animated.View
        style={[
          styles.webIndicatorContent,
          {
            opacity: isRefreshing ? 1 : 0.7,
            transform: [
              {
                rotate: iconRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color={finalTintColor} />
        ) : (
          <Text style={[styles.pullIcon, { color: finalTintColor }]}>↻</Text>
        )}
      </Animated.View>
      
      <Text style={[styles.statusText, { color: theme.colors.text.secondary }]}>
        {statusMessage}
      </Text>
      
      {lastSyncTime && (
        <Text style={[styles.syncTimeText, { color: theme.colors.text.tertiary }]}>
          Last sync: {formatSyncTime(lastSyncTime)}
        </Text>
      )}
      
      {/* * Success overlay */}
      {showSuccess && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successOpacity,
              backgroundColor: theme.colors.semantic.success + '20',
            },
          ]}
        >
          <Text style={[styles.successIcon, { color: theme.colors.semantic.success }]}>
            ✓
          </Text>
          <Text style={[styles.successText, { color: theme.colors.semantic.success }]}>
            {successText}
          </Text>
        </Animated.View>
      )}
    </View>
  );

  // * Clone children and add refresh control
  if (React.isValidElement(children)) {
    const childProps = children.props as any;
    
    // * Check if child is ScrollView or FlatList
    if (childProps && (children.type === 'ScrollView' || children.type === 'FlatList' || childProps.refreshControl !== undefined)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        refreshControl: enabled ? refreshControl : undefined,
        ...childProps,
      });
    }
  }

  // * Wrap in View with custom indicator for web
  return (
    <View style={styles.container} {...getTestProps(testID)}>
      {Platform.OS === 'web' && isRefreshing && webPullIndicator}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webIndicatorContent: {
    alignItems: 'center',
  },
  pullIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  syncTimeText: {
    fontSize: 12,
    marginTop: 2,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  successIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PullToRefresh;