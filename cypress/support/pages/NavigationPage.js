/**
 * NavigationPage - Page object for navigation and global UI elements
 */

import BasePage from './BasePage';

class NavigationPage extends BasePage {
  // * Header/Navigation elements
  get header() {
    return this.getByDataCy('app-header');
  }

  get logo() {
    return this.getByDataCy('app-logo');
  }

  get homeLink() {
    return this.getByDataCy('nav-home');
  }

  get projectsLink() {
    return this.getByDataCy('nav-projects');
  }

  get settingsLink() {
    return this.getByDataCy('nav-settings');
  }

  get profileMenu() {
    return this.getByDataCy('profile-menu');
  }

  get logoutButton() {
    return this.getByDataCy('logout-button');
  }

  get searchBar() {
    return this.getByDataCy('global-search');
  }

  get notificationBell() {
    return this.getByDataCy('notification-bell');
  }

  get notificationCount() {
    return this.getByDataCy('notification-count');
  }

  // * Sidebar elements (if applicable)
  get sidebar() {
    return this.getByDataCy('app-sidebar');
  }

  get sidebarToggle() {
    return this.getByDataCy('sidebar-toggle');
  }

  get sidebarProjects() {
    return cy.get('[data-cy^="sidebar-project-"]');
  }

  get sidebarRecentItems() {
    return cy.get('[data-cy^="sidebar-recent-"]');
  }

  // * Bottom navigation (mobile)
  get bottomNav() {
    return this.getByDataCy('bottom-navigation');
  }

  get bottomNavHome() {
    return this.getByDataCy('bottom-nav-home');
  }

  get bottomNavProjects() {
    return this.getByDataCy('bottom-nav-projects');
  }

  get bottomNavCreate() {
    return this.getByDataCy('bottom-nav-create');
  }

  get bottomNavSearch() {
    return this.getByDataCy('bottom-nav-search');
  }

  get bottomNavProfile() {
    return this.getByDataCy('bottom-nav-profile');
  }

  // * Breadcrumb elements
  get breadcrumbs() {
    return this.getByDataCy('breadcrumbs');
  }

  get breadcrumbItems() {
    return cy.get('[data-cy^="breadcrumb-"]');
  }

  // * Modal elements
  get activeModal() {
    return cy.get('[data-cy$="-modal"]:visible');
  }

  get modalOverlay() {
    return this.getByDataCy('modal-overlay');
  }

  get modalCloseButton() {
    return this.getByDataCy('modal-close');
  }

  // * Toast/Notification elements
  get toastContainer() {
    return this.getByDataCy('toast-container');
  }

  get toastMessages() {
    return cy.get('[data-cy^="toast-"]');
  }

  // * Loading states
  get pageLoader() {
    return this.getByDataCy('page-loader');
  }

  get progressBar() {
    return this.getByDataCy('progress-bar');
  }

  // * Navigation actions
  navigateToHome() {
    this.homeLink.click();
    return this;
  }

  navigateToProjects() {
    this.projectsLink.click();
    return this;
  }

  navigateToSettings() {
    this.settingsLink.click();
    return this;
  }

  openProfileMenu() {
    this.profileMenu.click();
    return this;
  }

  logout() {
    this.openProfileMenu();
    this.logoutButton.click();
    cy.url().should('include', '/login');
    return this;
  }

  search(query) {
    this.searchBar.clear().type(query);
    this.getByDataCy('search-submit').click();
    return this;
  }

  quickSearch(query) {
    this.searchBar.clear().type(query);
    // Wait for autocomplete
    cy.wait(500);
    return this;
  }

  selectSearchResult(index = 0) {
    cy.get('[data-cy^="search-result-"]').eq(index).click();
    return this;
  }

  // * Sidebar actions
  toggleSidebar() {
    this.sidebarToggle.click();
    return this;
  }

  expandSidebar() {
    this.sidebar.then($sidebar => {
      if (!$sidebar.hasClass('expanded')) {
        this.toggleSidebar();
      }
    });
    return this;
  }

  collapseSidebar() {
    this.sidebar.then($sidebar => {
      if ($sidebar.hasClass('expanded')) {
        this.toggleSidebar();
      }
    });
    return this;
  }

  selectSidebarProject(projectName) {
    cy.contains('[data-cy^="sidebar-project-"]', projectName).click();
    return this;
  }

  selectRecentItem(itemName) {
    cy.contains('[data-cy^="sidebar-recent-"]', itemName).click();
    return this;
  }

  // * Breadcrumb actions
  clickBreadcrumb(text) {
    cy.contains('[data-cy^="breadcrumb-"]', text).click();
    return this;
  }

  clickBreadcrumbByIndex(index) {
    this.breadcrumbItems.eq(index).click();
    return this;
  }

  // * Notification actions
  openNotifications() {
    this.notificationBell.click();
    return this;
  }

  dismissNotification(index = 0) {
    cy.get('[data-cy^="notification-"]')
      .eq(index)
      .find('[data-cy="dismiss-notification"]')
      .click();
    return this;
  }

  clearAllNotifications() {
    this.getByDataCy('clear-all-notifications').click();
    return this;
  }

  // * Modal actions
  closeModal() {
    this.modalCloseButton.click();
    return this;
  }

  closeModalByOverlay() {
    this.modalOverlay.click({ force: true });
    return this;
  }

  closeModalByEscape() {
    cy.get('body').type('{esc}');
    return this;
  }

  // * Toast actions
  dismissToast(index = 0) {
    this.toastMessages.eq(index).find('[data-cy="dismiss-toast"]').click();
    return this;
  }

  waitForToastToDisappear() {
    this.toastMessages.should('not.exist');
    return this;
  }

  // * Mobile navigation
  navigateViaBottomNav(destination) {
    switch (destination) {
      case 'home':
        this.bottomNavHome.click();
        break;
      case 'projects':
        this.bottomNavProjects.click();
        break;
      case 'create':
        this.bottomNavCreate.click();
        break;
      case 'search':
        this.bottomNavSearch.click();
        break;
      case 'profile':
        this.bottomNavProfile.click();
        break;
    }
    return this;
  }

  // * Assertions
  shouldBeOnPage(pageName) {
    cy.url().should('include', pageName);
    return this;
  }

  shouldShowBreadcrumb(text) {
    cy.contains('[data-cy^="breadcrumb-"]', text).should('be.visible');
    return this;
  }

  shouldHaveBreadcrumbCount(count) {
    this.breadcrumbItems.should('have.length', count);
    return this;
  }

  shouldShowNotificationBadge(count) {
    this.notificationCount.should('be.visible').and('contain', count);
    return this;
  }

  shouldNotShowNotificationBadge() {
    this.notificationCount.should('not.exist');
    return this;
  }

  shouldShowToast(message) {
    cy.contains('[data-cy^="toast-"]', message).should('be.visible');
    return this;
  }

  shouldShowSuccessToast() {
    this.getByDataCy('toast-success').should('be.visible');
    return this;
  }

  shouldShowErrorToast() {
    this.getByDataCy('toast-error').should('be.visible');
    return this;
  }

  shouldShowLoader() {
    this.pageLoader.should('be.visible');
    return this;
  }

  shouldNotShowLoader() {
    this.pageLoader.should('not.exist');
    return this;
  }

  shouldHaveSidebarExpanded() {
    this.sidebar.should('have.class', 'expanded');
    return this;
  }

  shouldHaveSidebarCollapsed() {
    this.sidebar.should('not.have.class', 'expanded');
    return this;
  }

  shouldShowModal(modalName) {
    this.getByDataCy(`${modalName}-modal`).should('be.visible');
    return this;
  }

  shouldNotShowAnyModal() {
    this.activeModal.should('not.exist');
    return this;
  }

  shouldShowProfileMenu() {
    this.getByDataCy('profile-menu-dropdown').should('be.visible');
    return this;
  }

  shouldBeLoggedIn() {
    this.profileMenu.should('be.visible');
    this.logoutButton.should('exist');
    return this;
  }

  shouldNotBeLoggedIn() {
    this.profileMenu.should('not.exist');
    cy.url().should('include', '/login');
    return this;
  }

  // * Utility methods
  waitForPageLoad() {
    this.pageLoader.should('not.exist');
    cy.get('[data-cy="page-content"]').should('be.visible');
    return this;
  }

  getActivePage() {
    return cy.url().then(url => {
      const path = new URL(url).pathname;
      return path.split('/')[1] || 'home';
    });
  }

  isOnMobile() {
    return cy.window().then(win => {
      return win.innerWidth < 768;
    });
  }

  isOnTablet() {
    return cy.window().then(win => {
      return win.innerWidth >= 768 && win.innerWidth < 1024;
    });
  }

  isOnDesktop() {
    return cy.window().then(win => {
      return win.innerWidth >= 1024;
    });
  }

  // * Theme/Settings
  toggleDarkMode() {
    this.getByDataCy('dark-mode-toggle').click();
    return this;
  }

  selectLanguage(language) {
    this.getByDataCy('language-selector').select(language);
    return this;
  }

  // * Keyboard shortcuts
  openQuickSearch() {
    cy.get('body').type('{cmd}k');
    return this;
  }

  openCommandPalette() {
    cy.get('body').type('{cmd}{shift}p');
    return this;
  }

  navigateWithKeyboard(direction) {
    const key = {
      up: '{upArrow}',
      down: '{downArrow}',
      left: '{leftArrow}',
      right: '{rightArrow}',
      enter: '{enter}',
      escape: '{esc}'
    };
    cy.get('body').type(key[direction]);
    return this;
  }

  // * Accessibility
  checkNavigationAccessibility() {
    this.header.should('have.attr', 'role', 'navigation');
    this.sidebar.should('have.attr', 'aria-label');
    return this;
  }

  checkFocusOrder() {
    // Tab through navigation elements
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-cy', 'nav-home');

    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-cy', 'nav-projects');

    return this;
  }
}

export default NavigationPage;