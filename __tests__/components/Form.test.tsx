/**
 * * Form Component Integration Tests (Jest + React Native Testing Library)
 * * Tests complete form workflows including validation, submission, and error handling
 * ! Critical: Tests form submission flow with React Native components
 */

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-color-literals */

import React, { useState } from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import { View, Text, TouchableOpacity, TextInput as RNTextInput, ActivityIndicator, Alert } from 'react-native';
import { TextInput } from '../../src/components/TextInput';
import { Button } from '../../src/components/Button';
import { renderWithProviders } from '../../src/test/testUtils';

// * Mock form component for testing
const TestForm: React.FC<{ onSubmit?: (data: any) => Promise<void> }> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // * Form validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // * Form submission handler
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await onSubmit?.({ email, password });
    } catch (error) {
      setErrors({ form: 'Submission failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View testID="test-form">
      <TextInput
        testID="email-input"
        label="Email"
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        testID="password-input"
        label="Password"
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
      />

      <TextInput
        testID="confirm-password-input"
        label="Confirm Password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
        secureTextEntry
      />

      {errors.form && (
        <Text testID="form-error" style={{ color: 'red' }}>
          {errors.form}
        </Text>
      )}

      <Button
        testID="submit-button"
        title={isLoading ? 'Submitting...' : 'Submit'}
        onPress={handleSubmit}
        disabled={isLoading}
        loading={isLoading}
      />
    </View>
  );
};

describe('Form Component Integration', () => {
  // * Form rendering tests
  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      const { getByTestId, getByText } = render(<TestForm />);

      expect(getByTestId('test-form')).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('confirm-password-input')).toBeTruthy();
      expect(getByTestId('submit-button')).toBeTruthy();
    });

    it('should render field labels', () => {
      const { getByText } = render(<TestForm />);

      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Password')).toBeTruthy();
      expect(getByText('Confirm Password')).toBeTruthy();
    });
  });

  // * Form validation tests
  describe('Form Validation', () => {
    it('should show required field errors on empty submission', async () => {
      const { getByTestId, getByText } = render(<TestForm />);

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
        expect(getByText('Password is required')).toBeTruthy();
      });
    });

    it('should validate email format', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = render(<TestForm />);

      const emailInput = getByPlaceholderText('Enter email');
      fireEvent.changeText(emailInput, 'invalid-email');

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Please enter a valid email')).toBeTruthy();
      });
    });

    it('should validate password length', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = render(<TestForm />);

      const passwordInput = getByPlaceholderText('Enter password');
      fireEvent.changeText(passwordInput, '12345');

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Password must be at least 6 characters')).toBeTruthy();
      });
    });

    it('should validate password confirmation match', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = render(<TestForm />);

      const passwordInput = getByPlaceholderText('Enter password');
      const confirmInput = getByPlaceholderText('Confirm password');

      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmInput, 'password456');

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Passwords do not match')).toBeTruthy();
      });
    });

    it('should clear errors when input is corrected', async () => {
      const { getByTestId, getByText, queryByText, getByPlaceholderText } = render(<TestForm />);

      // * Trigger validation error
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });

      // * Fix the error
      const emailInput = getByPlaceholderText('Enter email');
      fireEvent.changeText(emailInput, 'test@example.com');

      // * Submit again
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(queryByText('Email is required')).toBeFalsy();
      });
    });
  });

  // * Form submission tests
  describe('Form Submission', () => {
    it('should call onSubmit with form data when valid', async () => {
      const onSubmitMock = jest.fn().mockResolvedValue(undefined);
      const { getByTestId, getByPlaceholderText } = render(
        <TestForm onSubmit={onSubmitMock} />
      );

      // * Fill form with valid data
      const emailInput = getByPlaceholderText('Enter email');
      const passwordInput = getByPlaceholderText('Enter password');
      const confirmInput = getByPlaceholderText('Confirm password');

      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmInput, 'password123');

      // * Submit form
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'password123',
        });
      });
    });

    it('should show loading state during submission', async () => {
      const onSubmitMock = jest.fn(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId, getByPlaceholderText, getByText } = render(
        <TestForm onSubmit={onSubmitMock} />
      );

      // * Fill form
      const emailInput = getByPlaceholderText('Enter email');
      const passwordInput = getByPlaceholderText('Enter password');

      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      // * Submit and check loading state
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Submitting...')).toBeTruthy();
        expect(submitButton.props.accessibilityState.disabled).toBe(true);
      });
    });

    it('should handle submission errors', async () => {
      const onSubmitMock = jest.fn().mockRejectedValue(new Error('Network error'));
      const { getByTestId, getByPlaceholderText, getByText } = render(
        <TestForm onSubmit={onSubmitMock} />
      );

      // * Fill form with valid data
      const emailInput = getByPlaceholderText('Enter email');
      const passwordInput = getByPlaceholderText('Enter password');

      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      // * Submit form
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Submission failed')).toBeTruthy();
      });
    });

    it('should prevent submission when already loading', async () => {
      const onSubmitMock = jest.fn(() =>
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { getByTestId, getByPlaceholderText } = render(
        <TestForm onSubmit={onSubmitMock} />
      );

      // * Fill and submit form
      const emailInput = getByPlaceholderText('Enter email');
      const passwordInput = getByPlaceholderText('Enter password');

      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const submitButton = getByTestId('submit-button');

      // * Multiple rapid presses
      fireEvent.press(submitButton);
      fireEvent.press(submitButton);
      fireEvent.press(submitButton);

      // * Should only be called once
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  // * Field interaction tests
  describe('Field Interactions', () => {
    it('should update field values on text change', () => {
      const { getByPlaceholderText } = render(<TestForm />);

      const emailInput = getByPlaceholderText('Enter email');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should handle focus and blur events', () => {
      const { getByPlaceholderText } = render(<TestForm />);

      const emailInput = getByPlaceholderText('Enter email');

      // * Test focus
      fireEvent(emailInput, 'focus');
      // In a real app, you might check for focus styles or states

      // * Test blur
      fireEvent(emailInput, 'blur');
      // In a real app, you might trigger validation on blur
    });

    it('should handle secure text entry for password fields', () => {
      const { getByPlaceholderText } = render(<TestForm />);

      const passwordInput = getByPlaceholderText('Enter password');
      const confirmInput = getByPlaceholderText('Confirm password');

      expect(passwordInput.props.secureTextEntry).toBe(true);
      expect(confirmInput.props.secureTextEntry).toBe(true);
    });

    it('should set correct keyboard type for email field', () => {
      const { getByPlaceholderText } = render(<TestForm />);

      const emailInput = getByPlaceholderText('Enter email');
      expect(emailInput.props.keyboardType).toBe('email-address');
      expect(emailInput.props.autoCapitalize).toBe('none');
    });
  });

  // * Accessibility tests
  describe('Accessibility', () => {
    it('should have accessible form elements', () => {
      const { getByTestId } = render(<TestForm />);

      const submitButton = getByTestId('submit-button');
      expect(submitButton.props.accessibilityRole).toBe('button');
    });

    it('should update accessibility state when disabled', async () => {
      const onSubmitMock = jest.fn(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId, getByPlaceholderText } = render(
        <TestForm onSubmit={onSubmitMock} />
      );

      // * Fill and submit to trigger loading state
      const emailInput = getByPlaceholderText('Enter email');
      const passwordInput = getByPlaceholderText('Enter password');

      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(submitButton.props.accessibilityState.disabled).toBe(true);
      });
    });
  });
});

// * Additional test utilities for form testing
export const fillForm = (
  getByPlaceholderText: any,
  data: { email?: string; password?: string; confirmPassword?: string }
) => {
  if (data.email) {
    const emailInput = getByPlaceholderText('Enter email');
    fireEvent.changeText(emailInput, data.email);
  }

  if (data.password) {
    const passwordInput = getByPlaceholderText('Enter password');
    fireEvent.changeText(passwordInput, data.password);
  }

  if (data.confirmPassword) {
    const confirmInput = getByPlaceholderText('Confirm password');
    fireEvent.changeText(confirmInput, data.confirmPassword);
  }
};

export const submitForm = (getByTestId: any) => {
  const submitButton = getByTestId('submit-button');
  fireEvent.press(submitButton);
};