import React from 'react';

interface ErrorMessageProps {
  error?: Error | string | null;
  message?: string;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
  type?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  style?: React.CSSProperties;
  showDetails?: boolean;
  details?: string;
  testId?: string;
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
  className = '',
  style,
  showDetails = false,
  details,
  testId = 'error-message'
}) => {
  // * Determine the message to display
  const displayMessage = message || (error instanceof Error ? error.message : error) || 'An error occurred';
  
  // * Determine the background and text colors based on type
  const typeStyles = {
    error: {
      backgroundColor: '#fee',
      borderColor: '#fcc',
      color: '#c00'
    },
    warning: {
      // ! HARDCODED: Should use design tokens
    backgroundColor: '#fff3cd',
      // ! HARDCODED: Should use design tokens
    borderColor: '#ffeeba',
      // ! HARDCODED: Should use design tokens
    color: '#856404'
    },
    info: {
      // ! HARDCODED: Should use design tokens
    backgroundColor: '#d1ecf1',
      // ! HARDCODED: Should use design tokens
    borderColor: '#bee5eb',
      // ! HARDCODED: Should use design tokens
    color: '#0c5460'
    }
  };

  const currentStyle = typeStyles[type];

  // Don't render if there's no message
  if (!displayMessage && !error) {
    return null;
  }

  return (
    <div 
      data-testid={testId}
      data-cy={`${type}-message`}
      className={`error-message ${type} ${className}`}
      style={{
        padding: '// ! HARDCODED: Should use design tokens
      12px // ! HARDCODED: Should use design tokens
      16px',
        margin: '// ! HARDCODED: Should use design tokens
      12px 0',
        border: '// ! HARDCODED: Should use design tokens
      1px solid',
        borderRadius: '// ! HARDCODED: Should use design tokens
      4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '// ! HARDCODED: Should use design tokens
      8px',
        ...currentStyle,
        ...style
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Header with title and dismiss button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong data-testid={`${testId}-title`}>{title}</strong>
        {dismissible && onDismiss && (
          <button
            data-testid={`${testId}-dismiss`}
            data-cy="dismiss-error"
            onClick={onDismiss}
            aria-label="Dismiss message"
            style={{
              background: 'transparent',
              border: 'none',
              color: currentStyle.color,
              fontSize: '// ! HARDCODED: Should use design tokens
      20px',
              cursor: 'pointer',
              padding: '0',
              marginLeft: '// ! HARDCODED: Should use design tokens
      12px'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Error message */}
      <div data-testid={`${testId}-text`}>{displayMessage}</div>

      {/* Error details (if available) */}
      {showDetails && (details || (error instanceof Error && error.stack)) && (
        <details data-testid={`${testId}-details`}>
          <summary style={{ cursor: 'pointer', marginTop: '// ! HARDCODED: Should use design tokens
      8px' }}>
            Show Details
          </summary>
          <pre style={{
            marginTop: '// ! HARDCODED: Should use design tokens
      8px',
            padding: '// ! HARDCODED: Should use design tokens
      8px',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '// ! HARDCODED: Should use design tokens
      4px',
            fontSize: '// ! HARDCODED: Should use design tokens
      12px',
            overflow: 'auto',
            maxHeight: '// ! HARDCODED: Should use design tokens
      200px'
          }}>
            {details || (error instanceof Error ? error.stack : '')}
          </pre>
        </details>
      )}

      {/* Retry button */}
      {onRetry && (
        <button
          data-testid={`${testId}-retry`}
          data-cy="retry-button"
          onClick={onRetry}
          style={{
            alignSelf: 'flex-start',
            padding: '// ! HARDCODED: Should use design tokens
      6px // ! HARDCODED: Should use design tokens
      12px',
            backgroundColor: type === 'error' ? '// ! HARDCODED: Should use design tokens
      #dc3545' : type === 'warning' ? '// ! HARDCODED: Should use design tokens
      #ffc107' : '// ! HARDCODED: Should use design tokens
      #17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '// ! HARDCODED: Should use design tokens
      4px',
            cursor: 'pointer',
            fontSize: '// ! HARDCODED: Should use design tokens
      14px',
            marginTop: '// ! HARDCODED: Should use design tokens
      8px'
          }}
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

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