/**
 * Navigation Page Object
 * Handles common navigation elements across the application
 */

import { BasePage } from './BasePage';

export class NavigationPage extends BasePage {
  // * Navigation selectors
  private navSelectors = {
    // * Header/Top navigation
    logo: '[data-cy="app-logo"]',
    userMenu: '[data-cy="user-menu"]',
    userMenuDropdown: '[data-cy="user-menu-dropdown"]',
    searchBar: '[data-cy="global-search"]',
    notificationIcon: '[data-cy="notification-icon"]',

    // * Main navigation links
    projectsLink: '[data-cy="nav-projects"]',
    settingsLink: '[data-cy="nav-settings"]',
    helpLink: '[data-cy="nav-help"]',

    // * User menu items
    profileLink: '[data-cy="user-profile"]',
    accountSettingsLink: '[data-cy="account-settings"]',
    logoutButton: '[data-cy="logout-button"]',

    // * Breadcrumbs
    breadcrumb: '[data-cy="breadcrumb"]',
    breadcrumbItem: '[data-cy="breadcrumb-item"]',

    // * Mobile navigation
    mobileMenuToggle: '[data-cy="mobile-menu-toggle"]',
    mobileMenu: '[data-cy="mobile-menu"]',

    // * Bottom navigation (mobile)
    bottomNav: '[data-cy="bottom-navigation"]',
    bottomNavItem: '[data-cy^="bottom-nav-"]',
  };

  /**
   * Navigate to projects
   */
  goToProjects(): void {
    cy.get(this.navSelectors.projectsLink).click();
  }

  /**
   * Navigate to settings
   */
  goToSettings(): void {
    cy.get(this.navSelectors.settingsLink).click();
  }

  /**
   * Open user menu
   */
  openUserMenu(): void {
    cy.get(this.navSelectors.userMenu).click();
    cy.get(this.navSelectors.userMenuDropdown).should('be.visible');
  }

  /**
   * Close user menu
   */
  closeUserMenu(): void {
    cy.get('body').click(0, 0); // Click outside
    cy.get(this.navSelectors.userMenuDropdown).should('not.be.visible');
  }

  /**
   * Logout
   */
  logout(): void {
    this.openUserMenu();
    cy.get(this.navSelectors.logoutButton).click();
  }

  /**
   * Go to user profile
   */
  goToProfile(): void {
    this.openUserMenu();
    cy.get(this.navSelectors.profileLink).click();
  }

  /**
   * Go to account settings
   */
  goToAccountSettings(): void {
    this.openUserMenu();
    cy.get(this.navSelectors.accountSettingsLink).click();
  }

  /**
   * Use global search
   */
  globalSearch(searchTerm: string): void {
    cy.get(this.navSelectors.searchBar).clear().type(searchTerm);
    cy.get(this.navSelectors.searchBar).type('{enter}');
  }

  /**
   * Clear global search
   */
  clearGlobalSearch(): void {
    cy.get(this.navSelectors.searchBar).clear();
  }

  /**
   * Click on logo to go home
   */
  goHome(): void {
    cy.get(this.navSelectors.logo).click();
  }

  /**
   * Get breadcrumb items
   */
  getBreadcrumbItems(): Cypress.Chainable {
    return cy.get(this.navSelectors.breadcrumbItem);
  }

  /**
   * Click breadcrumb item by text
   */
  clickBreadcrumb(text: string): void {
    cy.get(this.navSelectors.breadcrumbItem).contains(text).click();
  }

  /**
   * Verify breadcrumb path
   */
  verifyBreadcrumbPath(expectedPath: string[]): void {
    cy.get(this.navSelectors.breadcrumbItem).should('have.length', expectedPath.length);

    expectedPath.forEach((item, index) => {
      cy.get(this.navSelectors.breadcrumbItem)
        .eq(index)
        .should('contain', item);
    });
  }

  /**
   * Check if user is logged in
   */
  isUserLoggedIn(): Cypress.Chainable<boolean> {
    return cy.get('body').then(($body) => {
      return $body.find(this.navSelectors.userMenu).length > 0;
    });
  }

  /**
   * Verify user is logged in
   */
  verifyUserLoggedIn(): void {
    cy.get(this.navSelectors.userMenu).should('be.visible');
  }

  /**
   * Verify user is logged out
   */
  verifyUserLoggedOut(): void {
    cy.get(this.navSelectors.userMenu).should('not.exist');
    cy.url().should('include', '/login');
  }

  /**
   * Open notifications
   */
  openNotifications(): void {
    cy.get(this.navSelectors.notificationIcon).click();
  }

  /**
   * Get notification count
   */
  getNotificationCount(): Cypress.Chainable<number> {
    return cy.get('[data-cy="notification-count"]')
      .invoke('text')
      .then((text) => parseInt(text, 10) || 0);
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    cy.get(this.navSelectors.mobileMenuToggle).click();
  }

  /**
   * Verify mobile menu is open
   */
  verifyMobileMenuOpen(): void {
    cy.get(this.navSelectors.mobileMenu).should('be.visible');
  }

  /**
   * Verify mobile menu is closed
   */
  verifyMobileMenuClosed(): void {
    cy.get(this.navSelectors.mobileMenu).should('not.be.visible');
  }

  /**
   * Navigate using bottom navigation (mobile)
   */
  navigateBottomNav(item: 'home' | 'projects' | 'add' | 'search' | 'profile'): void {
    cy.get(`[data-cy="bottom-nav-${item}"]`).click();
  }

  /**
   * Verify active navigation item
   */
  verifyActiveNavItem(item: string): void {
    cy.get(`[data-cy="nav-${item}"]`).should('have.class', 'active');
  }

  /**
   * Get current page title from navigation
   */
  getPageTitle(): Cypress.Chainable<string> {
    return cy.get('[data-cy="page-title"]').invoke('text');
  }

  /**
   * Verify page title
   */
  verifyPageTitle(expectedTitle: string): void {
    cy.get('[data-cy="page-title"]').should('contain', expectedTitle);
  }

  /**
   * Check if notification exists
   */
  hasNotifications(): Cypress.Chainable<boolean> {
    return this.getNotificationCount().then((count) => count > 0);
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.openNotifications();
    cy.get('[data-cy="clear-all-notifications"]').click();
  }

  /**
   * Navigate back using browser
   */
  goBack(): void {
    cy.go('back');
  }

  /**
   * Navigate forward using browser
   */
  goForward(): void {
    cy.go('forward');
  }

  /**
   * Verify navigation link is visible
   */
  verifyNavLinkVisible(linkName: string): void {
    cy.get(`[data-cy="nav-${linkName}"]`).should('be.visible');
  }

  /**
   * Verify navigation link is not visible
   */
  verifyNavLinkNotVisible(linkName: string): void {
    cy.get(`[data-cy="nav-${linkName}"]`).should('not.be.visible');
  }

  /**
   * Get username from user menu
   */
  getUsername(): Cypress.Chainable<string> {
    return cy.get('[data-cy="username-display"]').invoke('text');
  }

  /**
   * Verify username displayed
   */
  verifyUsername(expectedUsername: string): void {
    cy.get('[data-cy="username-display"]').should('contain', expectedUsername);
  }
}