import React, { useRef, useEffect } from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { getTestProps } from '../utils/react-native-web-polyfills';

interface TestableViewProps extends ViewProps {
  dataCy?: string;
  children?: React.ReactNode;
}

/**
 * TestableView component that ensures data-cy attributes are properly propagated
 * in React Native Web for Cypress testing
 */
export const TestableView: React.FC<TestableViewProps> = ({ 
  dataCy, 
  children, 
  ...props 
}) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    // * Only run on web platform
    if (Platform.OS === 'web' && ref.current && dataCy) {
      // * Set data-cy attribute directly on the DOM element
      if (ref.current._nativeTag) {
        const element = document.querySelector(`[data-reactroot] [data-rnw-id="${ref.current._nativeTag}"]`);
        if (element) {
          element.setAttribute('data-cy', dataCy);
        }
      } else if (ref.current instanceof HTMLElement) {
        ref.current.setAttribute('data-cy', dataCy);
      }
    }
  }, [dataCy]);

  // * Use centralized getTestProps function
  const testAttributes = dataCy ? getTestProps(dataCy) : {};

  return (
    <View 
      ref={ref}
      {...props} 
      {...testAttributes}
    >
      {children}
    </View>
  );
};

// * Re-export the centralized getTestProps function for backward compatibility
export { getTestProps as getTestableProps } from '../utils/react-native-web-polyfills';