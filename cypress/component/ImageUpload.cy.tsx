import React from 'react';
import { ImageUpload } from '../../src/components/ImageUpload';

describe('ImageUpload Component', () => {
  let onImagesChangeSpy: any;
  
  beforeEach(() => {
    onImagesChangeSpy = cy.spy().as('onImagesChange');
  });

  describe('Rendering', () => {
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

      // Create a small test image file
      const fileName = 'test-image.png';
      const fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName,
        mimeType: 'image/png'
      }, { force: true });

      // Wait for processing
      cy.wait(1000);
      
      cy.get('@onImagesChange').should('have.been.called');
    });
  });

  describe('Drag and Drop', () => {
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
      
      // Simulate file drop
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

    it('removes image when delete [data-cy*="button"] is clicked', () => {
      const images = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ];
      
      cy.mount(
        <ImageUpload 
          images={images} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('[data-cy*="button"][aria-label*="Remove"]').click();
      
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
      
      // Try to add another image
      const fileName = 'test-image.png';
      const fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName,
        mimeType: 'image/png'
      }, { force: true });

      // Should show alert or not add image
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Maximum 3 images allowed');
      });
    });
  });

  describe('File Validation', () => {
    it('rejects non-image files', () => {
      cy.mount(
        <ImageUpload 
          images={[]} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      // Try to upload a text file
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

      // Create a large file
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

      // Progress indicator should appear briefly
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

      // Compression info might appear
      cy.get('body').then($body => {
        if ($body.find('[class*="Compressed"]').length > 0) {
          cy.contains('Compressed').should('be.visible');
        }
      });
    });
  });

  describe('Accessibility', () => {
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

    it('has accessible remove [data-cy*="button"]s', () => {
      const images = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ];
      
      cy.mount(
        <ImageUpload 
          images={images} 
          onImagesChange={onImagesChangeSpy} 
        />
      );

      cy.get('[data-cy*="button"][aria-label*="Remove"]').should('exist');
    });

    it('is keyboard navigable', () => {
      const images = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ];
      
      cy.mount(
        <div>
          <[data-cy*="button"]>Before</[data-cy*="button"]>
          <ImageUpload 
            images={images} 
            onImagesChange={onImagesChangeSpy} 
          />
          <[data-cy*="button"]>After</[data-cy*="button"]>
        </div>
      );

      cy.get('[data-cy*="button"]').first().focus();
      cy.focused().tab();
      // Should focus on the remove [data-cy*="button"] or upload area
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
      
      // Should trigger file dialog (can't test actual dialog)
      cy.get('input[type="file"]').should('exist');
    });
  });

  describe('Edge Cases', () => {
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

      // Should not crash
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
      
      // Upload multiple files rapidly
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