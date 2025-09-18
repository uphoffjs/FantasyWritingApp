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
  // Determine the message to display
  const displayMessage = message || (error instanceof Error ? error.message : error) || 'An error occurred';
  
  // Determine the background and text colors based on type
  const typeStyles = {
    error: {
      backgroundColor: '#fee',
      borderColor: '#fcc',
      color: '#c00'
    },
    warning: {
      backgroundColor: '#fff3cd',
      borderColor: '#ffeeba',
      color: '#856404'
    },
    info: {
      backgroundColor: '#d1ecf1',
      borderColor: '#bee5eb',
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
        padding: '12px 16px',
        margin: '12px 0',
        border: '1px solid',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
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
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              marginLeft: '12px'
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
          <summary style={{ cursor: 'pointer', marginTop: '8px' }}>
            Show Details
          </summary>
          <pre style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '200px'
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
            padding: '6px 12px',
            backgroundColor: type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '8px'
          }}
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

// Hook for managing error messages
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