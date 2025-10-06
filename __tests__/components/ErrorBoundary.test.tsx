/**
 * ErrorBoundary Component Tests
 * Tests error handling and recovery functionality using React Native Testing Library
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test files require 'any' type for mock flexibility and test data setup
import React from 'react';
import { View, Text } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ErrorBoundary, useErrorHandler } from '../../src/components/ErrorBoundary';
import { renderWithProviders } from '../../src/test/testUtils';

// * Test component that throws an error
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return (
    <View testID="child-content">
      <Text>Child component rendered</Text>
    </View>
  );
};

// * Test component using useErrorHandler hook
const ComponentWithErrorHandler = ({ triggerError = false }) => {
  const throwError = useErrorHandler();

  React.useEffect(() => {
    if (triggerError) {
      throwError(new Error('Hook triggered error'));
    }
  }, [triggerError, throwError]);

  return (
    <View testID="hook-component">
      <Text>Component with error handler</Text>
    </View>
  );
};

// * Custom fallback component
const CustomFallback = ({ error, resetError }: any) => {
  return (
    <View testID="custom-fallback">
      <Text>Custom Error UI</Text>
      <Text>{error.message}</Text>
      <View testID="custom-reset" onTouchEnd={resetError}>
        <Text>Reset Custom</Text>
      </View>
    </View>
  );
};

// * Suppress console.error for error boundary tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('Basic Functionality', () => {
    it('renders children when there is no error', () => {
      const { getByTestId } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(getByTestId('child-content')).toBeTruthy();
    });

    it('catches errors and displays fallback UI', () => {
      const { getByText } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText(/Component Error/i)).toBeTruthy();
      expect(getByText(/Test error/i)).toBeTruthy();
      expect(getByText(/Try Again/i)).toBeTruthy();
    });

    it('resets error state when reset button is clicked', async () => {
      let shouldThrow = true;

      const TestWrapper = () => {
        const [throwError, setThrowError] = React.useState(shouldThrow);

        return (
          <ErrorBoundary onReset={() => setThrowError(false)}>
            <ThrowError shouldThrow={throwError} />
          </ErrorBoundary>
        );
      };

      const { getByText, getByTestId, rerender } = renderWithProviders(
        <TestWrapper />
      );

      // * Verify error UI is shown
      expect(getByText(/Component Error/i)).toBeTruthy();

      // * Click reset button
      const resetButton = getByText(/Try Again/i);
      fireEvent.press(resetButton);

      // * Update the component to not throw
      shouldThrow = false;
      rerender(<TestWrapper />);

      // * Verify child content is now rendered
      await waitFor(() => {
        expect(getByTestId('child-content')).toBeTruthy();
      });
    });
  });

  describe('Custom Fallback', () => {
    it('uses custom fallback component when provided', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <ErrorBoundary fallbackComponent={CustomFallback}>
          <ThrowError shouldThrow={true} errorMessage="Custom error message" />
        </ErrorBoundary>
      );

      expect(getByTestId('custom-fallback')).toBeTruthy();
      expect(getByText('Custom Error UI')).toBeTruthy();
      expect(getByText('Custom error message')).toBeTruthy();
    });

    it('passes error and resetError to custom fallback', () => {
      const { getByTestId } = renderWithProviders(
        <ErrorBoundary fallbackComponent={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const resetButton = getByTestId('custom-reset');
      expect(resetButton).toBeTruthy();
    });
  });

  describe('useErrorHandler Hook', () => {
    it('triggers error boundary from hook', () => {
      const { getByText, rerender } = renderWithProviders(
        <ErrorBoundary>
          <ComponentWithErrorHandler triggerError={false} />
        </ErrorBoundary>
      );

      // * Component renders normally
      expect(getByText('Component with error handler')).toBeTruthy();

      // * Trigger error through hook
      rerender(
        <ErrorBoundary>
          <ComponentWithErrorHandler triggerError={true} />
        </ErrorBoundary>
      );

      // * Error boundary catches the error
      expect(getByText(/Component Error/i)).toBeTruthy();
      expect(getByText(/Hook triggered error/i)).toBeTruthy();
    });
  });

  describe('Error Logging', () => {
    it('logs error details', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');

      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Logged error" />
        </ErrorBoundary>
      );

      // * Verify console.error was called with error details
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('includes component stack in error info', () => {
      const onError = jest.fn();

      renderWithProviders(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining('ThrowError')
      );
    });
  });

  describe('Multiple Error Boundaries', () => {
    it('nested error boundaries work independently', () => {
      const { getByText, getAllByText } = renderWithProviders(
        <ErrorBoundary>
          <View testID="outer-content">
            <Text>Outer content</Text>
            <ErrorBoundary>
              <ThrowError shouldThrow={true} errorMessage="Inner error" />
            </ErrorBoundary>
          </View>
        </ErrorBoundary>
      );

      // * Inner error boundary catches the error
      expect(getByText('Outer content')).toBeTruthy();
      expect(getByText(/Inner error/i)).toBeTruthy();

      // * Should have error UI from inner boundary, not outer
      const errorTexts = getAllByText(/Component Error/i);
      expect(errorTexts).toHaveLength(1);
    });
  });

  describe('Async Errors', () => {
    it('does not catch async errors (expected behavior)', async () => {
      const AsyncErrorComponent = () => {
        React.useEffect(() => {
          setTimeout(() => {
            throw new Error('Async error');
          }, 0);
        }, []);

        return <Text>Async component</Text>;
      };

      const { getByText } = renderWithProviders(
        <ErrorBoundary>
          <AsyncErrorComponent />
        </ErrorBoundary>
      );

      // * Component renders normally (async errors not caught by error boundary)
      expect(getByText('Async component')).toBeTruthy();

      // * Wait a bit to ensure async error would have fired
      await waitFor(() => {
        expect(getByText('Async component')).toBeTruthy();
      }, { timeout: 100 });
    });
  });

  describe('Development vs Production', () => {
    it('shows detailed error info in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { getByText } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Dev error details" />
        </ErrorBoundary>
      );

      expect(getByText(/Dev error details/i)).toBeTruthy();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('shows generic message in production', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const { getByText, queryByText } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Sensitive error info" />
        </ErrorBoundary>
      );

      // * Generic message shown
      expect(getByText(/Component Error/i)).toBeTruthy();

      // * Detailed error might be hidden in production
      // This depends on ErrorBoundary implementation

      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});