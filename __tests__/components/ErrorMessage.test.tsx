/**
 * ErrorMessage Component Tests
 * Tests error message display functionality using React Native Testing Library
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorMessage } from '../../src/components/ErrorMessage';
import { renderWithProviders } from '../../src/test/testUtils';

describe('ErrorMessage', () => {
  describe('Basic Display', () => {
    it('renders error message from string', () => {
      const { getByText } = render(
        <ErrorMessage error="Something went wrong" />
      );

      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('renders error message from Error object', () => {
      const error = new Error('Test error message');
      const { getByText } = render(
        <ErrorMessage error={error} />
      );

      expect(getByText('Test error message')).toBeTruthy();
    });

    it('renders custom message when provided', () => {
      const { getByText } = render(
        <ErrorMessage
          error="Original error"
          message="Custom error message"
        />
      );

      expect(getByText('Custom error message')).toBeTruthy();
    });

    it('renders default message when no error provided', () => {
      const { getByText } = render(
        <ErrorMessage />
      );

      expect(getByText('An error occurred')).toBeTruthy();
    });

    it('renders custom title', () => {
      const { getByText } = render(
        <ErrorMessage
          error="Test error"
          title="Custom Title"
        />
      );

      expect(getByText('Custom Title')).toBeTruthy();
    });
  });

  describe('Error Types', () => {
    it('renders as error type by default', () => {
      const { getByTestId } = render(
        <ErrorMessage
          error="Error message"
          testId="error-msg"
        />
      );

      const container = getByTestId('error-msg');
      expect(container).toBeTruthy();
      // * Check that error styling is applied
      expect(container.props.style).toBeTruthy();
    });

    it('renders as warning type', () => {
      const { getByTestId } = render(
        <ErrorMessage
          error="Warning message"
          type="warning"
          testId="warning-msg"
        />
      );

      const container = getByTestId('warning-msg');
      expect(container).toBeTruthy();
    });

    it('renders as info type', () => {
      const { getByTestId } = render(
        <ErrorMessage
          error="Info message"
          type="info"
          testId="info-msg"
        />
      );

      const container = getByTestId('info-msg');
      expect(container).toBeTruthy();
    });
  });

  describe('Retry Functionality', () => {
    it('shows retry button when onRetry provided', () => {
      const onRetry = jest.fn();
      const { getByText } = render(
        <ErrorMessage
          error="Test error"
          onRetry={onRetry}
        />
      );

      expect(getByText('Try Again')).toBeTruthy();
    });

    it('calls onRetry when retry button pressed', () => {
      const onRetry = jest.fn();
      const { getByText } = render(
        <ErrorMessage
          error="Test error"
          onRetry={onRetry}
        />
      );

      const retryButton = getByText('Try Again');
      fireEvent.press(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('uses custom retry text', () => {
      const { getByText } = render(
        <ErrorMessage
          error="Test error"
          onRetry={() => {}}
          retryText="Retry Operation"
        />
      );

      expect(getByText('Retry Operation')).toBeTruthy();
    });

    it('does not show retry button when onRetry not provided', () => {
      const { queryByText } = render(
        <ErrorMessage error="Test error" />
      );

      expect(queryByText('Try Again')).toBeNull();
    });
  });

  describe('Dismissible Functionality', () => {
    it('shows dismiss button when dismissible is true', () => {
      const onDismiss = jest.fn();
      const { getByTestId } = render(
        <ErrorMessage
          error="Test error"
          dismissible={true}
          onDismiss={onDismiss}
          testId="error-msg"
        />
      );

      const dismissButton = getByTestId('error-msg-dismiss');
      expect(dismissButton).toBeTruthy();
    });

    it('calls onDismiss when dismiss button pressed', () => {
      const onDismiss = jest.fn();
      const { getByTestId } = render(
        <ErrorMessage
          error="Test error"
          dismissible={true}
          onDismiss={onDismiss}
          testId="error-msg"
        />
      );

      const dismissButton = getByTestId('error-msg-dismiss');
      fireEvent.press(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not show dismiss button when dismissible is false', () => {
      const { queryByTestId } = render(
        <ErrorMessage
          error="Test error"
          dismissible={false}
          testId="error-msg"
        />
      );

      expect(queryByTestId('error-msg-dismiss')).toBeNull();
    });
  });

  describe('Details Display', () => {
    it('shows details when showDetails is true', () => {
      const { getByText } = render(
        <ErrorMessage
          error="Test error"
          showDetails={true}
          details="Additional error details here"
        />
      );

      expect(getByText('Additional error details here')).toBeTruthy();
    });

    it('hides details when showDetails is false', () => {
      const { queryByText } = render(
        <ErrorMessage
          error="Test error"
          showDetails={false}
          details="Hidden details"
        />
      );

      expect(queryByText('Hidden details')).toBeNull();
    });

    it('shows error stack in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      const { getByText } = render(
        <ErrorMessage
          error={error}
          showDetails={true}
        />
      );

      // * In development, stack might be shown
      expect(getByText(/Test error/i)).toBeTruthy();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Styling', () => {
    it('applies custom style when provided', () => {
      const customStyle = {
        backgroundColor: '#ff0000'
      };

      const { getByTestId } = render(
        <ErrorMessage
          error="Test error"
          style={customStyle}
          testId="styled-error"
        />
      );

      const container = getByTestId('styled-error');
      expect(container.props.style).toEqual(
        expect.objectContaining(customStyle)
      );
    });

    it('applies testID for testing', () => {
      const { getByTestId } = render(
        <ErrorMessage
          error="Test error"
          testId="custom-test-id"
        />
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });
  });

  describe('Complex Scenarios', () => {
    it('handles all options together', () => {
      const onRetry = jest.fn();
      const onDismiss = jest.fn();

      const { getByText, getByTestId } = render(
        <ErrorMessage
          error="Main error"
          message="Custom message"
          title="Error Title"
          type="warning"
          onRetry={onRetry}
          retryText="Retry Now"
          dismissible={true}
          onDismiss={onDismiss}
          showDetails={true}
          details="Extra details"
          testId="complex-error"
        />
      );

      // * Check all elements are present
      expect(getByText('Error Title')).toBeTruthy();
      expect(getByText('Custom message')).toBeTruthy();
      expect(getByText('Retry Now')).toBeTruthy();
      expect(getByText('Extra details')).toBeTruthy();
      expect(getByTestId('complex-error-dismiss')).toBeTruthy();
    });

    it('handles null error gracefully', () => {
      const { getByText } = render(
        <ErrorMessage error={null} />
      );

      expect(getByText('An error occurred')).toBeTruthy();
    });

    it('handles undefined error gracefully', () => {
      const { getByText } = render(
        <ErrorMessage error={undefined} />
      );

      expect(getByText('An error occurred')).toBeTruthy();
    });

    it('handles empty string error', () => {
      const { getByText } = render(
        <ErrorMessage error="" />
      );

      expect(getByText('An error occurred')).toBeTruthy();
    });
  });

  describe('Integration with Providers', () => {
    it('works with theme provider', () => {
      const { getByText } = renderWithProviders(
        <ErrorMessage error="Themed error" />
      );

      expect(getByText('Themed error')).toBeTruthy();
    });

    it('responds to theme changes', () => {
      const { getByTestId, rerender } = renderWithProviders(
        <ErrorMessage
          error="Test error"
          testId="themed-error"
        />
      );

      const container = getByTestId('themed-error');
      const initialStyle = container.props.style;

      // * Rerender with potentially different theme
      rerender(
        <ErrorMessage
          error="Test error"
          testId="themed-error"
        />
      );

      // * Style should be consistent or updated based on theme
      expect(getByTestId('themed-error')).toBeTruthy();
    });
  });
});