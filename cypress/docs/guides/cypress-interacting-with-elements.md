# Interacting with Elements

## Element Selection and Querying

### Best Practices for Element Selection

Cypress provides multiple ways to select elements, but following best practices ensures stable and maintainable tests.

```javascript
// ✅ BEST: Use data-cy attributes (recommended for React Native Web)
cy.get('[data-cy="story-title-input"]');
cy.get('[data-cy="save-button"]');
cy.get('[data-cy="character-list"]');

// ✅ GOOD: Use testID for React Native components (converts to data-cy on web)
// In React Native component:
// <TextInput testID="story-title-input" />
cy.get('[data-cy="story-title-input"]'); // Same selector works on web

// ❌ AVOID: CSS classes (can change with styling)
cy.get('.btn-primary');
cy.get('.form-input');

// ❌ AVOID: IDs (not guaranteed to be unique)
cy.get('#submit-button');

// ❌ AVOID: Tag names (too generic)
cy.get('button');
cy.get('input');

// ❌ AVOID: Text content (can change with translations)
cy.get('button').contains('Save');
```

### Element Query Commands

```javascript
describe('Element Selection Strategies', () => {
  beforeEach(() => {
    cy.visit('/stories/new');
  });

  it('demonstrates various selection methods', () => {
    // * Primary selection methods
    cy.get('[data-cy="story-form"]'); // Single element by data-cy
    cy.get('[data-cy="form-field"]').first(); // First element from multiple
    cy.get('[data-cy="form-field"]').eq(2); // Element by index
    cy.get('[data-cy="form-field"]').last(); // Last element

    // * Traversal methods
    cy.get('[data-cy="story-title-input"]')
      .parent() // Parent element
      .siblings() // Sibling elements
      .find('[data-cy="help-text"]'); // Child elements

    // * Within specific context
    cy.get('[data-cy="character-section"]').within(() => {
      cy.get('[data-cy="add-character-button"]').click();
      cy.get('[data-cy="character-name-input"]').type('Aragorn');
    });

    // ? Contains text (use sparingly)
    cy.contains('[data-cy="button"]', 'Save Draft'); // Element with data-cy containing text
    cy.contains('Save Draft'); // Any element containing text
  });

  it('handles dynamic elements', () => {
    // * Wait for element to exist
    cy.get('[data-cy="dynamic-content"]').should('exist');

    // * Wait for element to be visible
    cy.get('[data-cy="modal"]').should('be.visible');

    // * Wait for element to not exist
    cy.get('[data-cy="loading-spinner"]').should('not.exist');

    // * Wait for specific count
    cy.get('[data-cy="story-item"]').should('have.length', 3);
  });
});
```

### Advanced Element Selection

```javascript
// * Multiple element selection
cy.get('[data-cy="story-item"]').each(($el, index) => {
  cy.wrap($el).should('contain', 'Story');
  cy.wrap($el).find('[data-cy="story-title"]').should('not.be.empty');
});

// * Filtering elements
cy.get('[data-cy="story-item"]')
  .filter('[data-status="published"]')
  .should('have.length', 2);

// * Conditional element selection
cy.get('body').then($body => {
  if ($body.find('[data-cy="welcome-modal"]').length > 0) {
    cy.get('[data-cy="welcome-modal"]').within(() => {
      cy.get('[data-cy="close-button"]').click();
    });
  }
});

// * Alias for reuse
cy.get('[data-cy="story-form"]').as('storyForm');
cy.get('@storyForm').within(() => {
  cy.get('[data-cy="title-input"]').type('My Story');
});
```

## Form Interactions

### Text Input and Text Areas

```javascript
describe('Text Input Interactions', () => {
  beforeEach(() => {
    cy.visit('/stories/new');
  });

  it('handles various text input scenarios', () => {
    // * Basic text input
    cy.get('[data-cy="story-title-input"]')
      .type("The Dragon's Quest")
      .should('have.value', "The Dragon's Quest");

    // * Clear and retype
    cy.get('[data-cy="story-title-input"]')
      .clear()
      .type('New Title')
      .should('have.value', 'New Title');

    // * Type with special characters
    cy.get('[data-cy="story-content"]').type(
      'Line 1{enter}Line 2{tab}Indented text',
    );

    // * Type slowly (for real-time validation)
    cy.get('[data-cy="character-name"]').type('Gandalf', { delay: 100 });

    // * Force typing (even if element is not visible)
    cy.get('[data-cy="hidden-input"]').type('hidden value', { force: true });

    // ! Handle React Native TextInput specifics
    cy.get('[data-cy="multiline-input"]')
      .type('First line{enter}Second line')
      .should('contain', 'First line\nSecond line');
  });

  it('handles special key combinations', () => {
    cy.get('[data-cy="story-content"]')
      .type('Some text')
      .type('{selectall}') // Select all text
      .type('Replaced text'); // Replace selected text

    // * Keyboard shortcuts
    cy.get('[data-cy="story-content"]')
      .type('{ctrl+a}') // Select all (Ctrl+A)
      .type('{ctrl+c}') // Copy (Ctrl+C)
      .type('{ctrl+v}'); // Paste (Ctrl+V)

    // ? Save shortcut
    cy.get('[data-cy="story-content"]').type('{ctrl+s}'); // Save (Ctrl+S)

    cy.get('[data-cy="save-success"]').should('be.visible');
  });
});
```

### Select Dropdowns and Options

```javascript
describe('Select and Dropdown Interactions', () => {
  it('handles select dropdowns', () => {
    // * Standard HTML select
    cy.get('[data-cy="genre-select"]')
      .select('fantasy')
      .should('have.value', 'fantasy');

    // * Select by visible text
    cy.get('[data-cy="genre-select"]').select('Science Fiction');

    // * Multiple select
    cy.get('[data-cy="tags-select"]').select(['action', 'adventure', 'magic']);

    // ? Custom dropdown (React Native Picker on web)
    cy.get('[data-cy="character-role-picker"]').click();
    cy.get('[data-cy="option-protagonist"]').click();
    cy.get('[data-cy="character-role-picker"]').should(
      'contain',
      'Protagonist',
    );
  });

  it('handles autocomplete and search dropdowns', () => {
    // * Searchable dropdown
    cy.get('[data-cy="location-search"]').type('Rivendell');
    cy.get('[data-cy="location-option"]').contains('Rivendell').click();

    // * Create new option
    cy.get('[data-cy="tags-input"]').type('new-tag{enter}');
    cy.get('[data-cy="tag-item"]').should('contain', 'new-tag');
  });
});
```

### Checkboxes and Radio Buttons

```javascript
describe('Checkbox and Radio Interactions', () => {
  it('handles checkboxes', () => {
    // * Check checkbox
    cy.get('[data-cy="publish-checkbox"]').check().should('be.checked');

    // * Uncheck checkbox
    cy.get('[data-cy="publish-checkbox"]').uncheck().should('not.be.checked');

    // * Force check (even if hidden)
    cy.get('[data-cy="terms-checkbox"]').check({ force: true });

    // * Multiple checkboxes
    cy.get('[data-cy="permission-checkbox"]').check([
      'read',
      'write',
      'delete',
    ]);
  });

  it('handles radio buttons', () => {
    // * Select radio button
    cy.get('[data-cy="visibility-radio-public"]').check().should('be.checked');

    // ! Verify other radio buttons are unchecked
    cy.get('[data-cy="visibility-radio-private"]').should('not.be.checked');

    // * Radio group selection
    cy.get('[name="difficulty"]').check('intermediate');
  });

  it('handles React Native Switch components', () => {
    // * React Native Switch becomes checkbox on web
    cy.get('[data-cy="auto-save-switch"]')
      .click() // Toggle switch
      .should('be.checked'); // Verify state

    cy.get('[data-cy="auto-save-switch"]')
      .click() // Toggle again
      .should('not.be.checked'); // Verify unchecked
  });
});
```

## Button and Link Interactions

### Button Clicks and Actions

```javascript
describe('Button and Action Interactions', () => {
  it('handles various button types', () => {
    // * Basic button click
    cy.get('[data-cy="save-button"]').click();

    // * Click with options
    cy.get('[data-cy="delete-button"]')
      .click({ force: true }) // Force click even if covered
      .click({ multiple: true }); // Click multiple elements

    // * Click at specific position
    cy.get('[data-cy="color-picker"]').click(50, 50); // Click at x=50, y=50

    // * Double click
    cy.get('[data-cy="edit-title"]').dblclick();

    // * Right click (context menu)
    cy.get('[data-cy="story-item"]').rightclick();
    cy.get('[data-cy="context-menu"]').should('be.visible');

    // ! React Native TouchableOpacity becomes button on web
    cy.get('[data-cy="touchable-button"]')
      .click()
      .should('have.class', 'pressed'); // Verify pressed state
  });

  it('handles button states and loading', () => {
    // * Disabled button handling
    cy.get('[data-cy="submit-button"]').should('be.disabled');

    // Fill required fields to enable button
    cy.get('[data-cy="title-input"]').type('Story Title');
    cy.get('[data-cy="submit-button"]').should('be.enabled').click();

    // ? Wait for loading to complete
    cy.get('[data-cy="submit-button"]')
      .should('contain', 'Saving...') // Loading text
      .should('be.disabled'); // Disabled during save

    cy.get('[data-cy="submit-button"]')
      .should('contain', 'Save') // Back to normal
      .should('be.enabled');
  });
});
```

### Link Navigation

```javascript
describe('Link and Navigation Interactions', () => {
  it('handles link clicks and navigation', () => {
    // * Basic link click
    cy.get('[data-cy="stories-link"]').click();
    cy.url().should('include', '/stories');

    // * Link in new tab (prevent opening new window)
    cy.get('[data-cy="external-link"]')
      .should('have.attr', 'target', '_blank')
      .invoke('removeAttr', 'target')
      .click();

    // * Anchor links
    cy.get('[data-cy="section-link"]').click();
    cy.url().should('include', '#characters');

    // ? React Navigation link (React Native)
    cy.get('[data-cy="nav-character-screen"]').click();
    cy.get('[data-cy="character-screen"]').should('be.visible');
  });

  it('verifies link attributes', () => {
    cy.get('[data-cy="external-link"]')
      .should('have.attr', 'href', 'https://example.com')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer');
  });
});
```

## File Upload and Media

### File Upload Interactions

```javascript
describe('File Upload Interactions', () => {
  it('handles file uploads', () => {
    // * Upload single file
    cy.get('[data-cy="cover-image-upload"]').selectFile(
      'cypress/fixtures/cover-image.jpg',
    );

    // * Verify file was selected
    cy.get('[data-cy="file-name"]').should('contain', 'cover-image.jpg');

    // * Upload multiple files
    cy.get('[data-cy="gallery-upload"]').selectFile([
      'cypress/fixtures/image1.jpg',
      'cypress/fixtures/image2.png',
    ]);

    // * Drag and drop file
    cy.get('[data-cy="drop-zone"]').selectFile(
      'cypress/fixtures/document.pdf',
      {
        action: 'drag-drop',
      },
    );

    // ! Simulate file selection (React Native)
    cy.get('[data-cy="file-picker-button"]').click();
    // Note: React Native file picker would open native dialog
    // For testing, we simulate the result
    cy.window().then(win => {
      win.postMessage({
        type: 'FILE_SELECTED',
        file: { name: 'story.txt', size: 1024 },
      });
    });
  });

  it('handles file validation', () => {
    // * Test file type validation
    cy.get('[data-cy="image-upload"]').selectFile(
      'cypress/fixtures/document.txt',
      { force: true },
    );

    cy.get('[data-cy="error-message"]').should(
      'contain',
      'Only image files are allowed',
    );

    // * Test file size validation
    cy.get('[data-cy="image-upload"]').selectFile(
      'cypress/fixtures/large-image.jpg',
    );

    cy.get('[data-cy="error-message"]').should(
      'contain',
      'File size too large',
    );
  });
});
```

### Image and Media Interactions

```javascript
describe('Image and Media Interactions', () => {
  it('handles image interactions', () => {
    // * Verify image loads
    cy.get('[data-cy="story-cover"]')
      .should('be.visible')
      .and($img => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });

    // * Image click for zoom/modal
    cy.get('[data-cy="gallery-image"]').click();
    cy.get('[data-cy="image-modal"]').should('be.visible');
    cy.get('[data-cy="modal-close"]').click();

    // ? React Native Image component on web
    cy.get('[data-cy="character-avatar"]')
      .should('have.attr', 'src')
      .and('include', 'avatars');
  });

  it('handles video/audio controls', () => {
    // * Video controls
    cy.get('[data-cy="story-trailer"]').should('have.prop', 'paused', true);

    cy.get('[data-cy="play-button"]').click();
    cy.get('[data-cy="story-trailer"]').should('have.prop', 'paused', false);

    // * Audio controls
    cy.get('[data-cy="narration-audio"]').then($audio => {
      $audio[0].currentTime = 30; // Skip to 30 seconds
    });
  });
});
```

## Scrolling and Viewport

### Scrolling Interactions

```javascript
describe('Scrolling and Viewport Interactions', () => {
  it('handles various scrolling scenarios', () => {
    // * Scroll to element
    cy.get('[data-cy="footer"]').scrollIntoView();
    cy.get('[data-cy="footer"]').should('be.visible');

    // * Scroll to specific position
    cy.scrollTo(0, 500); // Scroll to y=500
    cy.scrollTo('bottom'); // Scroll to bottom
    cy.scrollTo('top'); // Scroll to top

    // * Scroll within element
    cy.get('[data-cy="story-content"]').scrollTo('bottom');

    // * Horizontal scroll
    cy.get('[data-cy="character-gallery"]').scrollTo('right');

    // ! React Native ScrollView on web
    cy.get('[data-cy="story-list"]').within(() => {
      cy.scrollTo(0, 1000); // Scroll within ScrollView
    });
  });

  it('handles infinite scroll', () => {
    // * Load more content by scrolling
    cy.get('[data-cy="story-item"]').should('have.length', 10);

    cy.get('[data-cy="story-list"]').scrollTo('bottom');
    cy.get('[data-cy="loading-more"]').should('be.visible');

    // ? Wait for more items to load
    cy.get('[data-cy="story-item"]', { timeout: 10000 }).should(
      'have.length.greaterThan',
      10,
    );
  });

  it('handles sticky/fixed elements during scroll', () => {
    cy.get('[data-cy="sticky-header"]').should('be.visible');

    cy.scrollTo('bottom');
    cy.get('[data-cy="sticky-header"]').should('be.visible'); // Still visible after scroll

    cy.get('[data-cy="back-to-top"]')
      .should('be.visible') // Appears after scrolling
      .click();

    cy.window().its('scrollY').should('equal', 0);
  });
});
```

### Viewport and Responsive Testing

```javascript
describe('Viewport and Responsive Interactions', () => {
  it('tests different viewport sizes', () => {
    // * Mobile viewport
    cy.viewport('iphone-x');
    cy.get('[data-cy="mobile-menu"]').should('be.visible');
    cy.get('[data-cy="desktop-sidebar"]').should('not.be.visible');

    // * Tablet viewport
    cy.viewport('ipad-2');
    cy.get('[data-cy="tablet-layout"]').should('be.visible');

    // * Desktop viewport
    cy.viewport(1920, 1080);
    cy.get('[data-cy="desktop-sidebar"]').should('be.visible');
    cy.get('[data-cy="mobile-menu"]').should('not.be.visible');

    // * Custom viewport
    cy.viewport(400, 800);
    cy.get('[data-cy="narrow-layout"]').should('be.visible');
  });

  it('handles orientation changes', () => {
    // * Portrait orientation
    cy.viewport(375, 667);
    cy.get('[data-cy="portrait-layout"]').should('be.visible');

    // * Landscape orientation
    cy.viewport(667, 375);
    cy.get('[data-cy="landscape-layout"]').should('be.visible');
  });
});
```

## Touch and Gesture Interactions

### Touch Events (React Native Web)

```javascript
describe('Touch and Gesture Interactions', () => {
  it('handles touch events', () => {
    // * Touch events (React Native TouchableOpacity)
    cy.get('[data-cy="story-card"]').trigger('touchstart').trigger('touchend');

    // * Long press
    cy.get('[data-cy="story-card"]')
      .trigger('touchstart')
      .wait(1000)
      .trigger('touchend');

    cy.get('[data-cy="context-menu"]').should('be.visible');

    // * Swipe gestures (simulate)
    cy.get('[data-cy="swipeable-card"]')
      .trigger('touchstart', { clientX: 100, clientY: 100 })
      .trigger('touchmove', { clientX: 200, clientY: 100 })
      .trigger('touchend');

    cy.get('[data-cy="delete-action"]').should('be.visible');
  });

  it('handles pinch and zoom', () => {
    // * Pinch to zoom (simulation for React Native Web)
    cy.get('[data-cy="zoomable-content"]').trigger('wheel', { deltaY: -100 }); // Zoom in

    cy.get('[data-cy="zoom-level"]').should('contain', '1.1x');

    cy.get('[data-cy="zoomable-content"]').trigger('wheel', { deltaY: 100 }); // Zoom out
  });

  it('handles drag and drop', () => {
    // * Drag and drop for reordering
    cy.get('[data-cy="chapter-1"]')
      .trigger('mousedown', { which: 1 })
      .trigger('dragstart');

    cy.get('[data-cy="chapter-3"]')
      .trigger('dragenter')
      .trigger('dragover')
      .trigger('drop');

    // ? Verify reorder
    cy.get('[data-cy="chapter-list"]')
      .children()
      .first()
      .should('contain', 'Chapter 1'); // Should now be first
  });
});
```

## Keyboard Interactions

### Keyboard Navigation and Shortcuts

```javascript
describe('Keyboard Interactions', () => {
  it('handles keyboard navigation', () => {
    // * Tab navigation
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-cy', 'first-input');

    cy.focused().tab();
    cy.focused().should('have.attr', 'data-cy', 'second-input');

    // * Shift+Tab (reverse navigation)
    cy.focused().tab({ shift: true });
    cy.focused().should('have.attr', 'data-cy', 'first-input');

    // * Arrow key navigation
    cy.get('[data-cy="menu-item-1"]').focus();
    cy.focused().type('{downarrow}');
    cy.focused().should('have.attr', 'data-cy', 'menu-item-2');

    cy.focused().type('{uparrow}');
    cy.focused().should('have.attr', 'data-cy', 'menu-item-1');
  });

  it('handles keyboard shortcuts', () => {
    // * Application shortcuts
    cy.get('body').type('{ctrl+n}'); // New story
    cy.get('[data-cy="new-story-modal"]').should('be.visible');

    cy.get('body').type('{ctrl+s}'); // Save
    cy.get('[data-cy="save-success"]').should('be.visible');

    cy.get('body').type('{ctrl+z}'); // Undo
    cy.get('[data-cy="undo-notification"]').should('be.visible');

    // * Escape key
    cy.get('[data-cy="modal"]').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('[data-cy="modal"]').should('not.exist');

    // * Enter key for form submission
    cy.get('[data-cy="search-input"]').type('dragon{enter}');
    cy.get('[data-cy="search-results"]').should('be.visible');
  });

  it('handles accessibility keyboard interactions', () => {
    // * ARIA keyboard interactions
    cy.get('[data-cy="dropdown-trigger"]').focus().type(' '); // Space to open dropdown

    cy.get('[data-cy="dropdown-menu"]').should('be.visible');

    cy.focused().type('{downarrow}'); // Navigate options
    cy.focused().type('{enter}'); // Select option

    // * Modal keyboard trap
    cy.get('[data-cy="open-modal"]').click();
    cy.get('[data-cy="modal-close"]').focus();
    cy.focused().tab(); // Should cycle within modal
    cy.focused().should('be.within', '[data-cy="modal"]');
  });
});
```

## Advanced Element Interactions

### Working with Shadow DOM and iFrames

```javascript
describe('Advanced Element Interactions', () => {
  it('handles shadow DOM elements', () => {
    // * Shadow DOM interaction (if using web components)
    cy.get('[data-cy="custom-element"]')
      .shadow()
      .find('[data-cy="shadow-button"]')
      .click();
  });

  it('handles iframe content', () => {
    // * Interact with iframe content
    cy.get('[data-cy="story-preview-iframe"]')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
      .find('[data-cy="preview-content"]')
      .should('contain', 'Story preview');
  });

  it('handles dynamic content loading', () => {
    // * Wait for dynamically loaded content
    cy.intercept('GET', '/api/stories/*').as('getStory');
    cy.get('[data-cy="story-link"]').click();
    cy.wait('@getStory');

    cy.get('[data-cy="story-content"]')
      .should('not.be.empty')
      .and('be.visible');

    // ? Handle lazy-loaded images
    cy.get('[data-cy="story-images"]').within(() => {
      cy.get('img').each($img => {
        cy.wrap($img).should('be.visible');
        cy.wrap($img).should($el => {
          expect($el[0].naturalWidth).to.be.greaterThan(0);
        });
      });
    });
  });
});
```

### Custom Element Interactions

```javascript
describe('Custom Element Interactions', () => {
  it('handles rich text editor', () => {
    // * Rich text editor interactions
    cy.get('[data-cy="rich-text-editor"]').within(() => {
      // Click bold button
      cy.get('[data-cy="bold-button"]').click();

      // Type in editor
      cy.get('[contenteditable="true"]').type('This is bold text');

      // Verify formatting
      cy.get('strong').should('contain', 'This is bold text');
    });

    // * Handle WYSIWYG editors
    cy.get('[data-cy="wysiwyg-editor"]')
      .find('.editor-content')
      .type('Story content here');

    cy.get('[data-cy="italic-button"]').click();
    cy.get('[data-cy="wysiwyg-editor"]')
      .find('.editor-content')
      .type(' italic text');
  });

  it('handles date/time pickers', () => {
    // * Date picker interaction
    cy.get('[data-cy="publish-date-picker"]').click();
    cy.get('[data-cy="date-picker-modal"]').within(() => {
      cy.get('[data-cy="next-month"]').click();
      cy.get('[data-cy="day-15"]').click();
    });

    // * Time picker
    cy.get('[data-cy="time-picker"]').within(() => {
      cy.get('[data-cy="hour-input"]').clear().type('14');
      cy.get('[data-cy="minute-input"]').clear().type('30');
    });
  });

  it('handles color pickers and sliders', () => {
    // * Color picker
    cy.get('[data-cy="theme-color-picker"]').click();
    cy.get('[data-cy="color-palette"]').within(() => {
      cy.get('[data-color="#ff6b6b"]').click();
    });

    cy.get('[data-cy="color-preview"]').should(
      'have.css',
      'background-color',
      'rgb(255, 107, 107)',
    );

    // * Range slider
    cy.get('[data-cy="font-size-slider"]').invoke('val', 16).trigger('input');

    cy.get('[data-cy="preview-text"]').should('have.css', 'font-size', '16px');
  });
});
```

This comprehensive guide covers all types of element interactions in Cypress, with specific examples for React Native Web applications and the Fantasy Writing App use case.
