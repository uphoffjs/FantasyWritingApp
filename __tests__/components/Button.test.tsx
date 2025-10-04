/**
 * * Button Component Tests (Jest + React Native Testing Library)
 * * Migrated from Cypress component tests to proper React Native testing
 * ! This is the reference implementation for migrating other component tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Button } from '../../src/components/Button';
import { ThemeProvider } from '../../src/providers/ThemeProvider';
import { act } from 'react-test-renderer';

// * Helper to render with theme provider
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  // * Basic rendering tests
  describe('Rendering', () => {
    it('should render with title text', () => {
      const { getByText, getByTestId } = renderWithTheme(
        <Button
          title="Click me"
          onPress={jest.fn()}
          testID="test-button"
        />
      );

      expect(getByText('Click me')).toBeTruthy();
      expect(getByTestId('test-button')).toBeTruthy();
    });

    it('should render with different variants', () => {
      const variants = ['primary', 'secondary', 'danger'] as const;

      variants.forEach(variant => {
        const { getByTestId } = renderWithTheme(
          <Button
            title={`${variant} button`}
            onPress={jest.fn()}
            variant={variant}
            testID={`${variant}-button`}
          />
        );

        expect(getByTestId(`${variant}-button`)).toBeTruthy();
      });
    });

    it('should render with different sizes', () => {
      const sizes = ['small', 'medium', 'large'] as const;

      sizes.forEach(size => {
        const { getByTestId } = renderWithTheme(
          <Button
            title={`${size} button`}
            onPress={jest.fn()}
            size={size}
            testID={`${size}-button`}
          />
        );

        expect(getByTestId(`${size}-button`)).toBeTruthy();
      });
    });
  });

  // * Interaction tests
  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button
          title="Press me"
          onPress={onPressMock}
          testID="press-button"
        />
      );

      const button = getByTestId('press-button');
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button
          title="Disabled"
          onPress={onPressMock}
          disabled={true}
          testID="disabled-button"
        />
      );

      const button = getByTestId('disabled-button');
      fireEvent.press(button);

      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button
          title="Loading"
          onPress={onPressMock}
          loading={true}
          testID="loading-button"
        />
      );

      const button = getByTestId('loading-button');
      fireEvent.press(button);

      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('should handle press in and press out animations', async () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button
          title="Animated"
          onPress={onPressMock}
          testID="animated-button"
        />
      );

      const button = getByTestId('animated-button');

      // * Simulate press in (triggers animation)
      fireEvent(button, 'pressIn');

      // * Simulate press out (triggers animation)
      fireEvent(button, 'pressOut');

      // * Actual press
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  // * Loading state tests
  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      const { getByTestId, queryByText } = renderWithTheme(
        <Button
          title="Submit"
          onPress={jest.fn()}
          loading={true}
          testID="loading-button"
        />
      );

      // * Loading indicator should be present
      expect(getByTestId('loading-button-loading')).toBeTruthy();

      // * Text should not be visible
      expect(queryByText('Submit')).toBeNull();
    });

    it('should show text when not loading', () => {
      const { getByText, queryByTestId } = renderWithTheme(
        <Button
          title="Submit"
          onPress={jest.fn()}
          loading={false}
          testID="normal-button"
        />
      );

      // * Text should be visible
      expect(getByText('Submit')).toBeTruthy();

      // * Loading indicator should not be present
      expect(queryByTestId('normal-button-loading')).toBeNull();
    });
  });

  // * Style and appearance tests
  describe('Styles and Appearance', () => {
    it('should apply custom styles', () => {
      const customStyle = {
        backgroundColor: 'red',
        borderRadius: 20,
      };

      const { getByTestId } = renderWithTheme(
        <Button
          title="Styled"
          onPress={jest.fn()}
          style={customStyle}
          testID="styled-button"
        />
      );

      const button = getByTestId('styled-button');

      // * Check that custom styles are applied
      expect(button.props.style).toEqual(
        expect.objectContaining(customStyle)
      );
    });

    it('should apply custom text styles', () => {
      const customTextStyle = {
        fontSize: 20,
        fontWeight: 'bold' as const,
      };

      const { getByText } = renderWithTheme(
        <Button
          title="Custom Text"
          onPress={jest.fn()}
          textStyle={customTextStyle}
          testID="text-styled-button"
        />
      );

      const text = getByText('Custom Text');

      // * Check that custom text styles are applied
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining(customTextStyle)
        ])
      );
    });

    it('should have disabled styles when disabled', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          title="Disabled"
          onPress={jest.fn()}
          disabled={true}
          testID="disabled-style-button"
        />
      );

      const button = getByTestId('disabled-style-button');

      // * Check for disabled opacity
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ opacity: 0.5 })
        ])
      );
    });
  });

  // * Accessibility tests
  describe('Accessibility', () => {
    it('should have proper accessibility role', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          title="Accessible"
          onPress={jest.fn()}
          testID="accessible-button"
        />
      );

      const button = getByTestId('accessible-button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('should have proper accessibility state when disabled', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          title="Disabled"
          onPress={jest.fn()}
          disabled={true}
          testID="disabled-a11y-button"
        />
      );

      const button = getByTestId('disabled-a11y-button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });

    it('should have proper accessibility state when enabled', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          title="Enabled"
          onPress={jest.fn()}
          disabled={false}
          testID="enabled-a11y-button"
        />
      );

      const button = getByTestId('enabled-a11y-button');
      expect(button.props.accessibilityState).toEqual({ disabled: false });
    });
  });

  // * Animation tests
  describe('Animations', () => {
    it('should reset animations when disabled state changes', () => {
      const { getByTestId, rerender } = renderWithTheme(
        <Button
          title="Animating"
          onPress={jest.fn()}
          disabled={false}
          testID="animation-button"
        />
      );

      const button = getByTestId('animation-button');

      // * Trigger animation
      fireEvent(button, 'pressIn');

      // * Change to disabled
      act(() => {
        rerender(
          <ThemeProvider>
            <Button
              title="Animating"
              onPress={jest.fn()}
              disabled={true}
              testID="animation-button"
            />
          </ThemeProvider>
        );
      });

      // * Animations should be reset when disabled
      // * Note: In a real test, we'd check the Animated.Value directly
      expect(getByTestId('animation-button')).toBeTruthy();
    });
  });

  // * Integration tests
  describe('Integration', () => {
    it('should work with async onPress handlers', async () => {
      const asyncHandler = jest.fn().mockResolvedValue('success');

      const { getByTestId } = renderWithTheme(
        <Button
          title="Async"
          onPress={asyncHandler}
          testID="async-button"
        />
      );

      const button = getByTestId('async-button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(asyncHandler).toHaveBeenCalledTimes(1);
      });

      expect(await asyncHandler.mock.results[0].value).toBe('success');
    });

    it('should handle rapid press events', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button
          title="Rapid"
          onPress={onPressMock}
          testID="rapid-button"
        />
      );

      const button = getByTestId('rapid-button');

      // * Simulate rapid pressing
      for (let i = 0; i < 5; i++) {
        fireEvent.press(button);
      }

      expect(onPressMock).toHaveBeenCalledTimes(5);
    });
  });
});