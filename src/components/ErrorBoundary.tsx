import React, { Component, ReactNode, ErrorInfo, createContext, useContext } from 'react';

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
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
    this.previousResetKeys = props.resetKeys || [];
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
      this.props.onError(error, errorInfo);
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
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
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

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { 
      children, 
      fallback: FallbackComponent, 
      fallbackComponent: AlternateFallback,
      level = 'component',
      showDetails = process.env.NODE_ENV === 'development'
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
      return (
        <div 
          data-testid="error-boundary-fallback"
          data-cy="error-boundary"
          style={{
            padding: '// ! HARDCODED: Should use design tokens
      20px',
            margin: '// ! HARDCODED: Should use design tokens
      20px',
            border: '// ! HARDCODED: Should use design tokens
      1px solid // ! HARDCODED: Should use design tokens
      #ff6b6b',
            borderRadius: '// ! HARDCODED: Should use design tokens
      8px',
            // ! HARDCODED: Should use design tokens
    backgroundColor: '#ffe0e0',
            textAlign: 'center'
          }}
        >
          <h2 data-testid="error-title" style={{ // ! HARDCODED: Should use design tokens
    color: '#c92a2a' }}>
            {level === 'page' ? 'Page Error' : 
             level === 'section' ? 'Section Error' : 
             'Component Error'}
          </h2>
          <p data-testid="error-message" style={{ // ! HARDCODED: Should use design tokens
    color: '#862e2e' }}>
            {error.message || 'An unexpected error occurred'}
          </p>
          
          {showDetails && errorInfo && (
            <details style={{ textAlign: 'left', marginTop: '// ! HARDCODED: Should use design tokens
      20px' }}>
              <summary style={{ cursor: 'pointer', // ! HARDCODED: Should use design tokens
    color: '#862e2e' }}>
                Error Details
              </summary>
              <pre style={{ 
                backgroundColor: '#fff', 
                padding: '// ! HARDCODED: Should use design tokens
      10px', 
                borderRadius: '// ! HARDCODED: Should use design tokens
      4px',
                overflow: 'auto',
                fontSize: '// ! HARDCODED: Should use design tokens
      12px'
              }}>
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          {this.state.errorCount >= 3 && (
            <p style={{ // ! HARDCODED: Should use design tokens
    color: '#862e2e', fontStyle: 'italic' }}>
              Multiple errors detected. Please refresh the page.
            </p>
          )}
          
          <button 
            data-testid="reset-[data-cy*="button"]"
            data-cy="reset-error"
            onClick={this.resetError}
            style={{
              marginTop: '// ! HARDCODED: Should use design tokens
      20px',
              padding: '// ! HARDCODED: Should use design tokens
      10px // ! HARDCODED: Should use design tokens
      20px',
              // ! HARDCODED: Should use design tokens
    backgroundColor: '#087f5b',
              color: 'white',
              border: 'none',
              borderRadius: '// ! HARDCODED: Should use design tokens
      4px',
              cursor: 'pointer',
              fontSize: '// ! HARDCODED: Should use design tokens
      16px'
            }}
          >
            Try Again
          </button>
        </div>
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