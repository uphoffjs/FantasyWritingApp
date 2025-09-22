/// <reference types="cypress" />
import React from 'react';
import { ErrorBoundary, useErrorHandler } from '../../../src/components/ErrorBoundary';

// * Test component that throws an error
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="child-content">Child component rendered</div>;
};

// * Test component using useErrorHandler hook
const ComponentWithErrorHandler = ({ triggerError = false }) => {
  const throwError = useErrorHandler();
  
  React.useEffect(() => {
    if (triggerError) {
      throwError(new Error('Hook triggered error'));
    }
  }, [triggerError, throwError]);
  
  return <div data-testid="hook-component">Component with error handler</div>;
};

// * Custom fallback component
const CustomFallback = ({ error, resetError }: any) => {
  return (
    <div data-testid="custom-fallback">
      <h2>Custom Error UI</h2>
      <p>{error.message}</p>
      <[data-cy*="button"] onClick={resetError} data-testid="custom-reset">
        Reset Custom
      </[data-cy*="button"]>
    </div>
  );
};

describe('ErrorBoundary', () => {
  describe('Basic Functionality', () => {
    it('renders children when there is no error', () => {
      cy.mount(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      
      cy.get('[data-testid="child-content"]').should('be.visible');
    });
    
    it('catches errors and displays fallback UI', () => {
      cy.mount(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.contains('Component Error').should('be.visible');
      cy.contains('This component cannot be displayed').should('be.visible');
    });
    
    it('generates unique error ID', () => {
      cy.mount(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // TODO: * In development mode, error ID should be visible
      if (Cypress.env('NODE_ENV') !== 'production') {
        cy.contains('Debug Info').click();
        cy.contains('Test error').should('be.visible');
      }
    });
  });
  
  describe('Error Boundary Levels', () => {
    it('displays root level error UI', () => {
      cy.mount(
        <ErrorBoundary level="root">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.contains('Something went wrong').should('be.visible');
      cy.contains('We encountered an unexpected error').should('be.visible');
      cy.contains('Go Home').should('be.visible');
      cy.contains('Reload App').should('be.visible');
    });
    
    it('displays route level error UI', () => {
      cy.mount(
        <ErrorBoundary level="route">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.contains('Page Error').should('be.visible');
      cy.contains('This page encountered an error').should('be.visible');
      cy.contains('Go Back').should('be.visible');
      cy.contains('Try Again').should('be.visible');
    });
    
    it('displays component level error UI', () => {
      cy.mount(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.contains('Component Error').should('be.visible');
      cy.contains('This component cannot be displayed').should('be.visible');
      cy.contains('Retry').should('be.visible');
    });
  });
  
  describe('Custom Fallback Component', () => {
    it('uses custom fallback when provided', () => {
      cy.mount(
        <ErrorBoundary fallbackComponent={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.get('[data-testid="custom-fallback"]').should('be.visible');
      cy.contains('Custom Error UI').should('be.visible');
      cy.contains('Test error').should('be.visible');
    });
    
    it('passes error info to custom fallback', () => {
      const customMessage = 'Custom error message';
      
      cy.mount(
        <ErrorBoundary fallbackComponent={CustomFallback}>
          <ThrowError shouldThrow={true} errorMessage={customMessage} />
        </ErrorBoundary>
      );
      
      cy.contains(customMessage).should('be.visible');
    });
  });
  
  describe('Error Reset', () => {
    it('resets error state when retry clicked', () => {
      let errorCount = 0;
      
      const ConditionalError = () => {
        errorCount++;
        if (errorCount === 1) {
          throw new Error('First render error');
        }
        return <div data-testid="success">Successfully rendered</div>;
      };
      
      cy.mount(
        <ErrorBoundary level="component">
          <ConditionalError />
        </ErrorBoundary>
      );
      
      cy.contains('Component Error').should('be.visible');
      cy.contains('Retry').click();
      cy.get('[data-testid="success"]').should('be.visible');
    });
    
    it('resets custom fallback error state', () => {
      let shouldError = true;
      
      const ConditionalError = () => {
        if (shouldError) {
          shouldError = false;
          throw new Error('Resettable error');
        }
        return <div data-testid="recovered">Recovered from error</div>;
      };
      
      cy.mount(
        <ErrorBoundary fallbackComponent={CustomFallback}>
          <ConditionalError />
        </ErrorBoundary>
      );
      
      cy.get('[data-testid="custom-fallback"]').should('be.visible');
      cy.get('[data-testid="custom-reset"]').click();
      cy.get('[data-testid="recovered"]').should('be.visible');
    });
  });
  
  describe('Error Handler Callback', () => {
    it('calls onError callback when error occurs', () => {
      const onError = cy.stub();
      
      cy.mount(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.wrap(onError).should('have.been.called');
      cy.wrap(onError).should('have.been.calledWith', 
        Cypress.sinon.match.instanceOf(Error),
        Cypress.sinon.match.object,
        Cypress.sinon.match.string
      );
    });
    
    it('passes error ID to callback', () => {
      const onError = cy.stub();
      
      cy.mount(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.wrap(onError).should('have.been.called').then(() => {
        const errorId = onError.getCall(0).args[2];
        expect(errorId).to.match(/^err_\d+_[a-z0-9]+$/);
      });
    });
  });
  
  describe('useErrorHandler Hook', () => {
    it('triggers error boundary from hook', () => {
      cy.mount(
        <ErrorBoundary>
          <ComponentWithErrorHandler triggerError={true} />
        </ErrorBoundary>
      );
      
      cy.contains('Component Error').should('be.visible');
      cy.contains('Hook triggered error').should('be.visible');
    });
    
    it('does not trigger error when false', () => {
      cy.mount(
        <ErrorBoundary>
          <ComponentWithErrorHandler triggerError={false} />
        </ErrorBoundary>
      );
      
      cy.get('[data-testid="hook-component"]').should('be.visible');
    });
  });
  
  describe('Navigation Actions', () => {
    it('provides home navigation for root errors', () => {
      cy.mount(
        <ErrorBoundary level="root">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.contains('Go Home').should('have.attr', 'onclick');
    });
    
    it('provides reload action for root errors', () => {
      cy.mount(
        <ErrorBoundary level="root">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.contains('Reload App').should('have.attr', 'onclick');
    });
    
    it('provides back navigation for route errors', () => {
      cy.mount(
        <ErrorBoundary level="route">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.contains('Go Back').should('have.attr', 'onclick');
    });
  });
  
  describe('Development vs Production', () => {
    it('shows error details in development', () => {
      // * This test assumes we're in development mode
      if (process.env.NODE_ENV === 'development') {
        cy.mount(
          <ErrorBoundary level="component">
            <ThrowError shouldThrow={true} errorMessage="Dev error details" />
          </ErrorBoundary>
        );
        
        cy.contains('Debug Info').click();
        cy.contains('Dev error details').should('be.visible');
      }
    });
    
    it('shows component stack in development for root errors', () => {
      if (process.env.NODE_ENV === 'development') {
        cy.mount(
          <ErrorBoundary level="root">
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        );
        
        cy.contains('Error Details').click();
        cy.get('pre').should('exist'); // Component stack
      }
    });
  });
  
  describe('Multiple Error Boundaries', () => {
    it('catches errors at different levels', () => {
      cy.mount(
        <ErrorBoundary level="root">
          <div>
            <ErrorBoundary level="component">
              <ThrowError shouldThrow={true} />
            </ErrorBoundary>
            <div data-testid="sibling">Sibling component</div>
          </div>
        </ErrorBoundary>
      );
      
      // TODO: * Component level error boundary should catch it
      cy.contains('Component Error').should('be.visible');
      // TODO: * Sibling should still render
      cy.get('[data-testid="sibling"]').should('be.visible');
    });
  });
  
  describe('Accessibility', () => {
    it('has accessible [data-cy*="button"]s in error UI', () => {
      cy.mount(
        <ErrorBoundary level="root">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.contains('Go Home').should('be.visible').and('have.attr', 'class').and('include', 'focus:');
      cy.contains('Reload App').should('be.visible').and('have.attr', 'class').and('include', 'focus:');
    });
    
    it('supports keyboard navigation', () => {
      cy.mount(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      cy.get('body').tab();
      cy.focused().should('contain', 'Retry');
    });
  });
  
  describe('Edge Cases', () => {
    it('handles async errors', () => {
      const AsyncError = () => {
        React.useEffect(() => {
          setTimeout(() => {
            throw new Error('Async error');
          }, 0);
        }, []);
        
        return <div>Async component</div>;
      };
      
      // TODO: Note: Async errors need to be caught differently
      // * This test demonstrates that async errors don't trigger error boundary
      cy.mount(
        <ErrorBoundary>
          <AsyncError />
        </ErrorBoundary>
      );
      
      cy.contains('Async component').should('be.visible');
    });
    
    it('handles multiple consecutive errors', () => {
      let attemptCount = 0;
      
      const MultiError = () => {
        attemptCount++;
        if (attemptCount <= 2) {
          throw new Error(`Error attempt ${attemptCount}`);
        }
        return <div data-testid="final-success">Finally succeeded</div>;
      };
      
      cy.mount(
        <ErrorBoundary level="component">
          <MultiError />
        </ErrorBoundary>
      );
      
      cy.contains('Component Error').should('be.visible');
      cy.contains('Retry').click();
      cy.contains('Component Error').should('be.visible');
      cy.contains('Retry').click();
      cy.get('[data-testid="final-success"]').should('be.visible');
    });
  });
});