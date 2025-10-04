import React, { Component, ReactNode, ErrorInfo, createContext, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { getTestProps } from '../utils/react-native-web-polyfills';

// * Error context for useErrorHandler hook
const ErrorContext = createContext<((error: Error) => void) | null>(null);

// * Error handler hook
export function useErrorHandler() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorBoundary');
  }
  return context;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId?: string) => void;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  enableRecovery?: boolean;
  fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  detailsExpanded: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];
  private _errorId: string | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      detailsExpanded: false
    };
    this.previousResetKeys = props.resetKeys || [];
  }

  // * Generate unique error ID
  get errorId(): string {
    if (!this._errorId) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      this._errorId = `err_${timestamp}_${random}`;
    }
    return this._errorId;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // ? * Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorCount: 0 // This gets updated in componentDidCatch
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // * Log error details
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // * Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // * Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.errorId);
    }

    // Auto-recovery after 5 seconds if enabled
    if (this.props.enableRecovery && this.state.errorCount < 3) {
      this.resetTimeoutId = setTimeout(() => {
        this.resetError();
      }, 5000);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // * Reset error boundary when resetKeys change
    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) =>
        key !== this.previousResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetError();
        this.previousResetKeys = [...resetKeys];
      }
    }

    // * Reset on any props change if enabled
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    // * Reset error ID for next error
    this._errorId = null;

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      detailsExpanded: false
    });
  };

  throwError = (error: Error) => {
    this.setState({
      hasError: true,
      error,
      errorInfo: null,
      errorCount: this.state.errorCount + 1
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      detailsExpanded: !prevState.detailsExpanded
    }));
  };

  render() {
    const { hasError, error, errorInfo, errorCount, detailsExpanded } = this.state;
    const {
      children,
      fallback: FallbackComponent,
      fallbackComponent: AlternateFallback,
      level = 'component',
      showDetails = __DEV__ // Use React Native's __DEV__ instead of process.env
    } = this.props;

    if (hasError && error) {
      // * Use custom fallback component if provided
      if (FallbackComponent) {
        return <FallbackComponent error={error} resetError={this.resetError} />;
      }

      if (AlternateFallback) {
        return <AlternateFallback error={error} resetError={this.resetError} />;
      }

      // * Default error UI based on level
      const errorTitle = level === 'page' ? 'Page Error' :
                        level === 'section' ? 'Section Error' :
                        'Component Error';

      return (
        <View
          {...getTestProps('error-boundary-fallback')}
          style={styles.container}
        >
          <Text
            {...getTestProps('error-title')}
            style={styles.title}
          >
            {errorTitle}
          </Text>

          <Text
            {...getTestProps('error-message')}
            style={styles.message}
          >
            {error.message || 'An unexpected error occurred'}
          </Text>

          {showDetails && errorInfo && (
            <View style={styles.detailsContainer}>
              <TouchableOpacity
                onPress={this.toggleDetails}
                style={styles.detailsToggle}
              >
                <Text style={styles.detailsToggleText}>
                  {detailsExpanded ? 'Hide' : 'Show'} Error Details
                </Text>
              </TouchableOpacity>

              {detailsExpanded && (
                <ScrollView style={styles.detailsContent}>
                  <Text style={styles.stackTrace}>
                    {errorInfo.componentStack}
                  </Text>
                </ScrollView>
              )}
            </View>
          )}

          {errorCount >= 3 && (
            <Text style={styles.warningText}>
              Multiple errors detected. Please restart the app.
            </Text>
          )}

          <TouchableOpacity
            {...getTestProps('reset-error-button')}
            onPress={this.resetError}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // * Provide error handler context to children
    return (
      <ErrorContext.Provider value={this.throwError}>
        {children}
      </ErrorContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 8,
    backgroundColor: '#ffe0e0',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c92a2a',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    marginTop: 20,
  },
  detailsToggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  detailsToggleText: {
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  detailsContent: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    maxHeight: 200,
    marginTop: 10,
  },
  stackTrace: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  warningText: {
    fontStyle: 'italic',
    fontSize: 14,
    marginVertical: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#087f5b',
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// * Export for convenience
export default ErrorBoundary;
