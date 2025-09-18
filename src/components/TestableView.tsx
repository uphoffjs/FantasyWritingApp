import React, { useRef, useEffect } from 'react';
import { View, ViewProps, Platform } from 'react-native';

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
    // Only run on web platform
    if (Platform.OS === 'web' && ref.current && dataCy) {
      // Set data-cy attribute directly on the DOM element
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

  // Build attributes object
  const testAttributes: any = {};
  
  if (dataCy) {
    // Add testID for React Native testing
    testAttributes.testID = dataCy;
    
    // Add web-specific attributes
    if (Platform.OS === 'web') {
      testAttributes['data-cy'] = dataCy;
      testAttributes['data-testid'] = dataCy;
    }
  }

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

// Helper function to create testable attributes
export const getTestableProps = (id: string): any => {
  const props: any = {
    testID: id,
  };

  if (Platform.OS === 'web') {
    props['data-cy'] = id;
    props['data-testid'] = id;
  }

  return props;
};