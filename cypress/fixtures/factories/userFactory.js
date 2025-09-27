/**
 * User Factory
 * Generates test user data for E2E tests
 */

import { faker } from '@faker-js/faker';

class UserFactory {
  /**
   * Generate a single user with optional overrides
   */
  static create(overrides = {}) {
    const timestamp = Date.now();
    const randomId = faker.string.alphanumeric(8);

    return {
      id: `user-${randomId}`,
      email: faker.internet.email().toLowerCase(),
      password: 'Test123!@#', // Standard test password
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.userName().toLowerCase(),
      avatar: faker.image.avatar(),
      bio: faker.lorem.paragraph(),
      role: 'user',
      isVerified: true,
      preferences: {
        theme: 'light',
        language: 'en',
        emailNotifications: true,
        autoSave: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate multiple users
   */
  static createMany(count = 5, overrides = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Generate a test user with specific role
   */
  static createWithRole(role) {
    return this.create({ role });
  }

  /**
   * Generate an admin user
   */
  static createAdmin() {
    return this.create({
      role: 'admin',
      email: 'admin@test.com',
      username: 'testadmin'
    });
  }

  /**
   * Generate a premium user
   */
  static createPremium() {
    return this.create({
      role: 'premium',
      subscription: {
        plan: 'premium',
        status: 'active',
        expiresAt: faker.date.future().toISOString()
      }
    });
  }

  /**
   * Generate an unverified user
   */
  static createUnverified() {
    return this.create({
      isVerified: false,
      verificationToken: faker.string.alphanumeric(32)
    });
  }

  /**
   * Generate user with specific preferences
   */
  static createWithPreferences(preferences) {
    return this.create({
      preferences: {
        ...this.create().preferences,
        ...preferences
      }
    });
  }

  /**
   * Generate login credentials
   */
  static createCredentials() {
    const user = this.create();
    return {
      email: user.email,
      password: user.password
    };
  }

  /**
   * Generate registration data
   */
  static createRegistrationData() {
    const password = 'Test123!@#';
    return {
      email: faker.internet.email().toLowerCase(),
      password,
      confirmPassword: password,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      acceptTerms: true
    };
  }

  /**
   * Generate profile update data
   */
  static createProfileUpdate() {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      bio: faker.lorem.paragraph(),
      avatar: faker.image.avatar()
    };
  }

  /**
   * Generate password reset data
   */
  static createPasswordReset() {
    const newPassword = 'NewTest123!@#';
    return {
      token: faker.string.alphanumeric(32),
      password: newPassword,
      confirmPassword: newPassword
    };
  }

  /**
   * Create a user with projects
   */
  static createWithProjects(projectCount = 3) {
    const ProjectFactory = require('./projectFactory').default;
    const user = this.create();
    const projects = ProjectFactory.createMany(projectCount, { userId: user.id });

    return {
      ...user,
      projects
    };
  }

  /**
   * Create a user with social login
   */
  static createWithSocialLogin(provider = 'google') {
    return this.create({
      socialLogins: [{
        provider,
        providerId: faker.string.alphanumeric(20),
        connectedAt: faker.date.past().toISOString()
      }]
    });
  }

  /**
   * Create a user with notification settings
   */
  static createWithNotifications() {
    return this.create({
      notifications: {
        email: {
          projectUpdates: true,
          weeklyDigest: true,
          comments: true,
          mentions: true
        },
        push: {
          projectUpdates: false,
          comments: true,
          mentions: true
        },
        inApp: {
          all: true
        }
      }
    });
  }

  /**
   * Clean user data for API
   */
  static toAPI(user) {
    const { password, ...apiUser } = user;
    return apiUser;
  }

  /**
   * Generate mock authentication response
   */
  static createAuthResponse(user = null) {
    const userData = user || this.create();
    return {
      success: true,
      user: this.toAPI(userData),
      token: faker.string.alphanumeric(64),
      refreshToken: faker.string.alphanumeric(64),
      expiresIn: 3600
    };
  }
}

export default UserFactory;