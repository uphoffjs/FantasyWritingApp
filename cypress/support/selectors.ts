// Centralized selectors for Cypress tests
// Following the pattern: data-cy="component-element-action"

export const selectors = {
  // Authentication
  auth: {
    emailInput: '[data-cy=email-input]',
    passwordInput: '[data-cy=password-input]',
    loginButton: '[data-cy=login-button]',
    logoutButton: '[data-cy=logout-button]',
    signupButton: '[data-cy=signup-button]',
    forgotPasswordLink: '[data-cy=forgot-password-link]',
    loginScreen: '[data-cy=login-screen]',
    signupScreen: '[data-cy=signup-screen]',
  },

  // Navigation
  nav: {
    homeNav: '[data-cy=home-nav]',
    storiesNav: '[data-cy=stories-nav]',
    charactersNav: '[data-cy=characters-nav]',
    settingsNav: '[data-cy=settings-nav]',
    menuButton: '[data-cy=menu-button]',
    backButton: '[data-cy=back-button]',
    tabBar: '[data-cy=tab-bar]',
  },

  // Screens
  screens: {
    home: '[data-cy=home-screen]',
    stories: '[data-cy=stories-screen]',
    characters: '[data-cy=characters-screen]',
    settings: '[data-cy=settings-screen]',
    editor: '[data-cy=editor-screen]',
  },

  // Story Management
  story: {
    createButton: '[data-cy=create-story-button]',
    titleInput: '[data-cy=story-title-input]',
    genreSelect: '[data-cy=story-genre-select]',
    descriptionInput: '[data-cy=story-description-input]',
    createSubmit: '[data-cy=create-story-submit]',
    cancelButton: '[data-cy=cancel-story-button]',
    saveButton: '[data-cy=save-story-button]',
    deleteButton: '[data-cy=delete-story-button]',
    editor: '[data-cy=story-editor]',
    content: '[data-cy=story-content]',
    wordCount: '[data-cy=word-count]',
    lastSaved: '[data-cy=last-saved]',
    storiesList: '[data-cy=stories-list]',
    storyItem: (id: string) => `[data-cy=story-item-${id}]`,
    storyTitle: (id: string) => `[data-cy=story-title-${id}]`,
    storyPreview: (id: string) => `[data-cy=story-preview-${id}]`,
  },

  // Character Management
  character: {
    tab: '[data-cy=characters-tab]',
    addButton: '[data-cy=add-character-button]',
    nameInput: '[data-cy=character-name-input]',
    roleSelect: '[data-cy=character-role-select]',
    ageInput: '[data-cy=character-age-input]',
    descriptionInput: '[data-cy=character-description-input]',
    backstoryInput: '[data-cy=character-backstory-input]',
    traitsInput: '[data-cy=character-traits-input]',
    saveButton: '[data-cy=save-character-button]',
    deleteButton: '[data-cy=delete-character-button]',
    editor: '[data-cy=character-editor]',
    list: '[data-cy=characters-list]',
    item: (name: string) => `[data-cy=character-${name.toLowerCase().replace(/\s+/g, '-')}]`,
    avatar: (name: string) => `[data-cy=character-avatar-${name.toLowerCase().replace(/\s+/g, '-')}]`,
  },

  // Plot/Outline
  plot: {
    tab: '[data-cy=plot-tab]',
    addChapterButton: '[data-cy=add-chapter-button]',
    chapterTitleInput: '[data-cy=chapter-title-input]',
    chapterSummaryInput: '[data-cy=chapter-summary-input]',
    plotPointInput: '[data-cy=plot-point-input]',
    timelineView: '[data-cy=timeline-view]',
    outlineView: '[data-cy=outline-view]',
    chapterItem: (num: number) => `[data-cy=chapter-${num}]`,
    plotPoint: (id: string) => `[data-cy=plot-point-${id}]`,
  },

  // Settings
  settings: {
    themeToggle: '[data-cy=theme-toggle]',
    fontSizeSlider: '[data-cy=font-size-slider]',
    autoSaveToggle: '[data-cy=autosave-toggle]',
    exportButton: '[data-cy=export-button]',
    importButton: '[data-cy=import-button]',
    accountSection: '[data-cy=account-section]',
    privacySection: '[data-cy=privacy-section]',
    aboutSection: '[data-cy=about-section]',
  },

  // Common UI Elements
  ui: {
    loadingIndicator: '[data-cy=loading-indicator]',
    errorMessage: '[data-cy=error-message]',
    successMessage: '[data-cy=success-message]',
    saveSuccessMessage: '[data-cy=save-success-message]',
    modal: '[data-cy=modal]',
    modalTitle: '[data-cy=modal-title]',
    modalContent: '[data-cy=modal-content]',
    modalConfirm: '[data-cy=modal-confirm]',
    modalCancel: '[data-cy=modal-cancel]',
    dropdown: '[data-cy=dropdown]',
    dropdownItem: (value: string) => `[data-cy=dropdown-item-${value}]`,
    searchInput: '[data-cy=search-input]',
    filterButton: '[data-cy=filter-button]',
    sortButton: '[data-cy=sort-button]',
  },

  // Forms
  form: {
    submit: '[data-cy=form-submit]',
    cancel: '[data-cy=form-cancel]',
    reset: '[data-cy=form-reset]',
    fieldError: (field: string) => `[data-cy=field-error-${field}]`,
    fieldLabel: (field: string) => `[data-cy=field-label-${field}]`,
    fieldInput: (field: string) => `[data-cy=field-input-${field}]`,
  },

  // Editor Tools
  editor: {
    toolbar: '[data-cy=editor-toolbar]',
    boldButton: '[data-cy=editor-bold]',
    italicButton: '[data-cy=editor-italic]',
    underlineButton: '[data-cy=editor-underline]',
    headingButton: '[data-cy=editor-heading]',
    quoteButton: '[data-cy=editor-quote]',
    listButton: '[data-cy=editor-list]',
    undoButton: '[data-cy=editor-undo]',
    redoButton: '[data-cy=editor-redo]',
    findButton: '[data-cy=editor-find]',
    replaceButton: '[data-cy=editor-replace]',
    fullscreenButton: '[data-cy=editor-fullscreen]',
  },
};

// Helper functions for dynamic selectors
export const getStorySelector = (storyId: string) => 
  `[data-cy=story-${storyId}]`;

export const getCharacterSelector = (characterName: string) => 
  `[data-cy=character-${characterName.toLowerCase().replace(/\s+/g, '-')}]`;

export const getChapterSelector = (chapterNum: number) => 
  `[data-cy=chapter-${chapterNum}]`;

export const getTabSelector = (tabName: string) => 
  `[data-cy=tab-${tabName.toLowerCase()}]`;

// Selector validation helper
export const validateSelector = (selector: string): boolean => {
  return selector.includes('data-cy=');
};

// Get all selectors as a flat list (useful for testing coverage)
export const getAllSelectors = (): string[] => {
  const flatSelectors: string[] = [];
  
  const extractSelectors = (obj: any): void => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        flatSelectors.push(obj[key]);
      } else if (typeof obj[key] === 'object') {
        extractSelectors(obj[key]);
      }
    }
  };
  
  extractSelectors(selectors);
  return flatSelectors;
};

// Accessibility selectors (for ARIA attributes)
export const a11y = {
  getByRole: (role: string) => `[role="${role}"]`,
  getByAriaLabel: (label: string) => `[aria-label="${label}"]`,
  getByAriaDescribedBy: (id: string) => `[aria-describedby="${id}"]`,
  getByAriaLabelledBy: (id: string) => `[aria-labelledby="${id}"]`,
};

export default selectors;