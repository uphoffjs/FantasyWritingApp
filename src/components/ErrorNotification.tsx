import React, { useState, useEffect, useCallback } from 'react';

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
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
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
  className = '',
  style,
  testId = 'error-notification'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // * Get the message to display
  const displayMessage = message || (error instanceof Error ? error.message : error) || 'An error occurred';
  const displayTitle = title || (type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : type === 'success' ? 'Success' : 'Info');

  // * Handle auto-dismiss
  useEffect(() => {
    if (!persistent && duration > 0) {
      const interval = showProgress ? 50 : duration;
      const decrement = showProgress ? (100 / (duration / 50)) : 0;
      
      const timer = setInterval(() => {
        if (showProgress) {
          setProgress(prev => {
            const newProgress = prev - decrement;
            if (newProgress <= 0) {
              handleClose();
              return 0;
            }
            return newProgress;
          });
        } else {
          handleClose();
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [duration, persistent, showProgress]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, animated ? 300 : 0);
  }, [onClose, animated]);

  if (!displayMessage && !error) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  // * Style based on type
  const typeStyles = {
    error: {
      // ! HARDCODED: Should use design tokens
    backgroundColor: '#f44336',
      color: 'white',
      iconColor: 'white'
    },
    warning: {
      // ! HARDCODED: Should use design tokens
    backgroundColor: '#ff9800',
      color: 'white',
      iconColor: 'white'
    },
    success: {
      // ! HARDCODED: Should use design tokens
    backgroundColor: '#4caf50',
      color: 'white',
      iconColor: 'white'
    },
    info: {
      // ! HARDCODED: Should use design tokens
    backgroundColor: '#2196f3',
      color: 'white',
      iconColor: 'white'
    }
  };

  // * Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top': { top: '// ! HARDCODED: Should use design tokens
      20px', left: '50%', transform: 'translateX(-50%)' },
    'bottom': { bottom: '// ! HARDCODED: Should use design tokens
      20px', left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: '// ! HARDCODED: Should use design tokens
      20px', right: '// ! HARDCODED: Should use design tokens
      20px' },
    'top-left': { top: '// ! HARDCODED: Should use design tokens
      20px', left: '// ! HARDCODED: Should use design tokens
      20px' },
    'bottom-right': { bottom: '// ! HARDCODED: Should use design tokens
      20px', right: '// ! HARDCODED: Should use design tokens
      20px' },
    'bottom-left': { bottom: '// ! HARDCODED: Should use design tokens
      20px', left: '// ! HARDCODED: Should use design tokens
      20px' }
  };

  const currentTypeStyle = typeStyles[type];
  const currentPositionStyle = positionStyles[position];

  // * Icons for different types
  const icons = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️'
  };

  return (
    <div
      data-testid={testId}
      data-cy={`${type}-notification`}
      className={`error-notification ${type} ${className} ${animated ? 'animated' : ''}`}
      style={{
        position: 'fixed',
        ...currentPositionStyle,
        minWidth: '// ! HARDCODED: Should use design tokens
      300px',
        maxWidth: '// ! HARDCODED: Should use design tokens
      500px',
        padding: '// ! HARDCODED: Should use design tokens
      16px',
        borderRadius: '// ! HARDCODED: Should use design tokens
      8px',
        boxShadow: '0 // ! HARDCODED: Should use design tokens
      4px // ! HARDCODED: Should use design tokens
      6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '// ! HARDCODED: Should use design tokens
      8px',
        ...currentTypeStyle,
        opacity: isVisible ? 1 : 0,
        transition: animated ? 'opacity 0.3s ease-in-out' : 'none',
        ...style
      }}
      role="alert"
      aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '// ! HARDCODED: Should use design tokens
      8px' }}>
          <span data-testid={`${testId}-icon`} style={{ fontSize: '// ! HARDCODED: Should use design tokens
      20px' }}>
            {icons[type]}
          </span>
          <strong data-testid={`${testId}-title`}>{displayTitle}</strong>
        </div>
        <button
          data-testid={`${testId}-close`}
          data-cy="close-notification"
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: currentTypeStyle.iconColor,
            fontSize: '// ! HARDCODED: Should use design tokens
      24px',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '// ! HARDCODED: Should use design tokens
      12px',
            lineHeight: 1
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>

      {/* Message */}
      <div data-testid={`${testId}-message`} style={{ paddingLeft: '// ! HARDCODED: Should use design tokens
      28px' }}>
        {displayMessage}
      </div>

      {/* Retry button */}
      {onRetry && (
        <button
          data-testid={`${testId}-retry`}
          data-cy="retry-notification"
          onClick={onRetry}
          style={{
            alignSelf: 'flex-start',
            marginLeft: '// ! HARDCODED: Should use design tokens
      28px',
            padding: '// ! HARDCODED: Should use design tokens
      4px // ! HARDCODED: Should use design tokens
      12px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '// ! HARDCODED: Should use design tokens
      1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '// ! HARDCODED: Should use design tokens
      4px',
            cursor: 'pointer',
            fontSize: '// ! HARDCODED: Should use design tokens
      14px'
          }}
        >
          {retryText}
        </button>
      )}

      {/* Progress bar */}
      {showProgress && !persistent && (
        <div
          data-testid={`${testId}-progress`}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '// ! HARDCODED: Should use design tokens
      4px',
            width: `${progress}%`,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderBottomLeftRadius: progress > 5 ? '// ! HARDCODED: Should use design tokens
      8px' : '0',
            borderBottomRightRadius: progress > 95 ? '// ! HARDCODED: Should use design tokens
      8px' : '0',
            transition: 'width 0.05s linear'
          }}
        />
      )}
    </div>
  );
};

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
export const NotificationContainer: React.FC<{ notifications: Notification[] }> = ({ notifications }) => {
  return (
    <>
      {notifications.map(({ id, props }) => (
        <ErrorNotification
          key={id}
          {...props}
          onClose={() => props.onClose?.()}
        />
      ))}
    </>
  );
};

export default ErrorNotification;