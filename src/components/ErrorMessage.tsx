import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { getTestProps } from '../utils/react-native-web-polyfills';

interface ErrorMessageProps {
  error?: Error | string | null;
  message?: string;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
  type?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  showDetails?: boolean;
  details?: string;
  testId?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  message,
  title = 'Error',
  onRetry,
  retryText = 'Try Again',
  type = 'error',
  dismissible = false,
  onDismiss,
  showDetails = false,
  details,
  testId = 'error-message',
  containerStyle,
  textStyle,
}) => {
  // * State for managing details expansion
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // * Determine the message to display
  const displayMessage = message || (error instanceof Error ? error.message : error) || 'An error occurred';

  // * Determine the background and text colors based on type
  const typeColors = {
    error: {
      backgroundColor: '#fee',
      borderColor: '#fcc',
      color: '#c00',
      buttonBg: '#dc3545',
    },
    warning: {
      backgroundColor: '#fff3cd',
      borderColor: '#ffeeba',
      color: '#856404',
      buttonBg: '#ffc107',
    },
    info: {
      backgroundColor: '#d1ecf1',
      borderColor: '#bee5eb',
      color: '#0c5460',
      buttonBg: '#17a2b8',
    }
  };

  const currentColors = typeColors[type];

  // Don't render if there's no message
  if (!displayMessage && !error) {
    return null;
  }

  const detailsText = details || (error instanceof Error ? error.stack : '');

  return (
    <View
      {...getTestProps(`${type}-message`)}
      style={[
        styles.container,
        {
          backgroundColor: currentColors.backgroundColor,
          borderColor: currentColors.borderColor,
        },
        containerStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {/* Header with title and dismiss button */}
      <View style={styles.header}>
        <Text
          {...getTestProps(`${testId}-title`)}
          style={[
            styles.title,
            { color: currentColors.color },
            textStyle,
          ]}
        >
          {title}
        </Text>
        {dismissible && onDismiss && (
          <TouchableOpacity
            {...getTestProps('dismiss-error')}
            onPress={onDismiss}
            accessibilityLabel="Dismiss message"
            style={styles.dismissButton}
          >
            <Text style={[styles.dismissText, { color: currentColors.color }]}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error message */}
      <Text
        {...getTestProps(`${testId}-text`)}
        style={[
          styles.messageText,
          { color: currentColors.color },
          textStyle,
        ]}
      >
        {displayMessage}
      </Text>

      {/* Error details (if available) */}
      {showDetails && detailsText && (
        <View {...getTestProps(`${testId}-details`)}>
          <TouchableOpacity
            onPress={() => setIsDetailsExpanded(!isDetailsExpanded)}
            style={styles.detailsToggle}
          >
            <Text style={[styles.detailsToggleText, { color: currentColors.color }]}>
              {isDetailsExpanded ? 'Hide' : 'Show'} Details
            </Text>
          </TouchableOpacity>

          {isDetailsExpanded && (
            <ScrollView style={styles.detailsContainer}>
              <Text style={styles.detailsText}>
                {detailsText}
              </Text>
            </ScrollView>
          )}
        </View>
      )}

      {/* Retry button */}
      {onRetry && (
        <TouchableOpacity
          {...getTestProps('retry-button')}
          onPress={onRetry}
          style={[
            styles.retryButton,
            { backgroundColor: currentColors.buttonBg }
          ]}
        >
          <Text style={styles.retryButtonText}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 12,
  },
  dismissText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 8,
  },
  detailsToggle: {
    marginTop: 8,
    paddingVertical: 4,
  },
  detailsToggleText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  detailsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    maxHeight: 200,
  },
  detailsText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

// * Hook for managing error messages
export function useErrorMessage(initialError?: Error | string | null) {
  const [error, setError] = React.useState<Error | string | null>(initialError || null);

  const showError = React.useCallback((newError: Error | string) => {
    setError(newError);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const errorProps = React.useMemo(() => ({
    error,
    onDismiss: clearError
  }), [error, clearError]);

  return {
    error,
    showError,
    clearError,
    errorProps
  };
}

export default ErrorMessage;