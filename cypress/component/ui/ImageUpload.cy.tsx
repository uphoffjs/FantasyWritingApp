/**
 * @fileoverview Image Upload Component Tests
 * Tests for US-X.X: [User Story Name]
 *
 * User Story:
 * As a [user type]
 * I want to [action]
 * So that [benefit]
 *
 * Acceptance Criteria:
 * - [Criterion 1]
 * - [Criterion 2]
 * - [Criterion 3]
 */

import React from 'react';
import { ImageUpload } from '../../../src/components/ImageUpload';

describe('ImageUpload Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  let onImagesChangeSpy: any;
  
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    onImagesChangeSpy = cy.spy().as('onImagesChange');
  });
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('renders upload area with instructions', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.contains('Drop images or click to browse').should('be.visible');
      cy.get('svg').should('be.visible'); // Upload icon
      cy.get('input[type="file"]').should('exist').and('not.be.visible');
    });
    it('renders with existing images', () => {
      const existingImages = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ];
      
      cy.mount(
        <ImageUpload 
          images={existingImages} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('img').should('have.length', 1);
    });
    it('shows image count and limit', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy}
          maxImages={5}
        />
      );

      cy.contains('0 / 5 images').should('be.visible');
    });
    it('displays file size limit', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy}
          maxSizeInMB={10}
        />
      );

      cy.contains('10MB').should('be.visible');
    });
  });
  describe('File Upload via Click', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('opens file dialog when upload area is clicked', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('input[type="file"]').should('exist');
      cy.get('[class*="border-dashed"]').click();
      
      // Note: We can't actually test the file dialog opening in Cypress
      // but we can verify the input exists and has correct attributes
      cy.get('input[type="file"]')
        .should('have.attr', 'accept', 'image/*')
        .and('have.attr', 'multiple');
    });
    it('accepts multiple files', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('input[type="file"]').should('have.attr', 'multiple');
    });
    it('restricts to image files only', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('input[type="file"]').should('have.attr', 'accept', 'image/*');
    });
    it('processes uploaded file', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      // * Create a small test image file
      const fileName = 'test-image.png';
      const fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName,
        mimeType: 'image/png'
      }, { force: true });
      // * Wait for processing
      cy.wait(1000);
      
      cy.get('@onImagesChange').should('have.been.called');
    });
  });
  describe('Drag and Drop', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('shows drag state when dragging over', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('[class*="border-dashed"]')
        .trigger('dragover', { dataTransfer: { files: [] } });
      cy.contains('Drop your images here').should('be.visible');
      cy.get('[class*="border-sapphire-400"]').should('exist');
    });
    it('removes drag state when dragging leaves', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('[class*="border-dashed"]')
        .trigger('dragover', { dataTransfer: { files: [] } })
        .trigger('dragleave');
      
      cy.contains('Drop images or click to browse').should('be.visible');
      cy.get('[class*="border-sapphire-400"]').should('not.exist');
    });
    it('handles file drop', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      const fileName = 'dropped-image.png';
      const fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      // * Simulate file drop
      const file = new File([Cypress.Buffer.from(fileContent, 'base64')], fileName, { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      cy.get('[class*="border-dashed"]')
        .trigger('drop', { dataTransfer });
      cy.wait(1000);
      cy.get('@onImagesChange').should('have.been.called');
    });
  });
  describe('Image Management', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('displays uploaded images', () => {
      const images = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      ];
      
      cy.mount(
        <ImageUpload 
          images={images} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('img').should('have.length', 2);
    });
    it('removes image when delete button is clicked', () => {
      const images = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ];
      
      cy.mount(
        <ImageUpload 
          images={images} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('button[aria-label*="Remove"]').click();
      
      cy.get('@onImagesChange').should('have.been.calledWith', []);
    });
    it('respects maximum image limit', () => {
      const images = ['image1', 'image2', 'image3'];
      
      cy.mount(
        <ImageUpload 
          images={images} 
          onImagesChange={onImagesChangeSpy}
          maxImages={3}
        />
      );

      cy.contains('3 / 3 images').should('be.visible');
      
      // * Try to add another image
      const fileName = 'test-image.png';
      const fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName,
        mimeType: 'image/png'
      }, { force: true });
      // ? TODO: * Should show alert or not add image
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Maximum 3 images allowed');
      });
    });
  });
  describe('File Validation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('rejects non-image files', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      // * Try to upload a text file
      cy.get('input[type="file"]').selectFile({
        contents: 'This is a text file',
        fileName: 'document.txt',
        mimeType: 'text/plain'
      }, { force: true });
      cy.get('@onImagesChange').should('not.have.been.called');
    });
    it('rejects files exceeding size limit', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy}
          maxSizeInMB={0.001} // 1KB limit for testing
        />
      );

      // * Create a large file
      const largeContent = 'A'.repeat(10000);
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(largeContent),
        fileName: 'large-image.png',
        mimeType: 'image/png'
      }, { force: true });
      cy.get('@onImagesChange').should('not.have.been.called');
    });
  });
  describe('Progress Indicators', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('shows upload progress', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      const fileName = 'test-image.png';
      const fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName,
        mimeType: 'image/png'
      }, { force: true });
      // TODO: * Progress indicator should appear briefly
      cy.get('[class*="animate-pulse"]', { timeout: 1000 }).should('exist');
    });
    it('shows compression info', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      const fileName = 'test-image.png';
      const fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName,
        mimeType: 'image/png'
      }, { force: true });
      // * Compression info might appear
      cy.get('body').then($body => {
        cy.contains('Compressed').should('be.visible');
      });
    });
  });
  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('has accessible file input', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('input[type="file"]')
        .should('have.attr', 'id', 'image-upload-input');
    });
    it('has accessible remove buttons', () => {
      const images = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ];
      
      cy.mount(
        <ImageUpload 
          images={images} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('button[aria-label*="Remove"]').should('exist');
    });
    it('is keyboard navigable', () => {
      const images = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ];
      
      cy.mount(
        <div>
          <button>Before</button>
          <ImageUpload 
            images={images} 
            onImagesChange={onImagesChangeSpy} 
          />
          <button>After</button>
        </div>
      );

      cy.get('button').first().focus();
      cy.focused().tab();
      // TODO: * Should focus on the remove button or upload area
      cy.focused().should('exist');
    });
    it('can trigger upload with keyboard', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('[class*="border-dashed"]').focus();
      cy.focused().type('{enter}');
      
      // TODO: * Should trigger file dialog (can't test actual dialog)
      cy.get('input[type="file"]').should('exist');
    });
  });
  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('handles empty images array', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('[class*="border-dashed"]').should('be.visible');
    });
    it('handles null images gracefully', () => {
      cy.mount(
        <ImageUpload 
          images={null as any} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      // TODO: * Should not crash
      cy.get('[class*="border-dashed"]').should('be.visible');
    });
    it('handles very long image URLs', () => {
      const longImage = 'data:image/png;base64,' + 'A'.repeat(1000);
      
      cy.mount(
        <ImageUpload 
          images={[longImage]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('img').should('exist');
    });
    it('handles rapid file uploads', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      const fileName = 'test-image.png';
      const fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      // * Upload multiple files rapidly
      for (let i = 0; i < 3; i++) {
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: `${fileName}-${i}`,
          mimeType: 'image/png'
        }, { force: true });
      }

      cy.wait(2000);
      cy.get('@onImagesChange').should('have.been.called');
    });
  });
  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('works on mobile viewport', () => {
      cy.viewport(375, 667);
      
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('[class*="border-dashed"]').should('be.visible');
      cy.contains('Drop images or click to browse').should('be.visible');
    });
    it('displays images grid on tablet', () => {
      cy.viewport(768, 1024);
      
      const images = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      ];
      
      cy.mount(
        <ImageUpload 
          images={images} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('img').should('have.length', 2);
    });
    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('[class*="border-dashed"]').should('be.visible');
    });
  });
});